const express = require("express");
const app = express();
const axios = require("axios");
const cors = require("cors");
const FormData = require("form-data");
const fs = require("fs");
const multer = require("multer");
const azureStorage = require("azure-storage");
const CosmosClient = require("@azure/cosmos").CosmosClient;
const upload = multer({ dest: "uploads/" });
const port = process.env.PORT || 3001;

app.use("/", express.static("frontend/build"));
app.use(cors());

const API1_URL = process.env.API1_URL;
const DATABASE_ID = process.env.DATABASE_ID;
const CONTAINER_ID = process.env.CONTAINER_ID;
const CONNECTION_STRING = process.env.QUEUE_ACCESS_KEY;
const COSMOS_DB_ENDPOINT = process.env.COSMOS_DB_ENDPOINT;
const COSMOS_DB_KEY = process.env.COSMOS_DB_KEY;
const IMAGE_FUNCTION_URL = process.env.IMAGE_FUNCTION_URL;

const { DefaultAzureCredential } = require("@azure/identity");

async function getToken() {
  // Create a credential to be used by the pipeline
  const credential = new DefaultAzureCredential();

  // Fetch the token using the credential
  const accessToken = await credential.getToken(
    "api://2fadaaf3-338d-4391-9cf9-8b2204f9c8c5"
  );

  if (!accessToken) {
    throw new Error("Failed to acquire token");
  }

  console.log("Access Token:", accessToken.token);
}

const token = getToken();

app.get("/api", (req, res) => {
  const secret = process.env.SECRET_1 || "Secret not configured";
  res.send(`Hello, world! This is secret #1: ${secret}`);
});

app.post("/api/uploadFile", upload.single("filename"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No photo uploaded.");
  }

  const filename = req.file.originalname;

  const formData = new FormData();
  formData.append("filename", fs.createReadStream(req.file.path), {
    filename: filename,
    contentType: req.file.mimetype,
  });

  axios
    .post(API1_URL + `/${filename}`, formData, {
      headers: formData.getHeaders(),
    })
    .then((response) => {
      res.send("File forwarded to API1.");
    })
    .catch((error) => {
      console.error("Error sending file to API1:", error);
      res.status(500).send("Failed to send file to API1.");
    });
});

app.get("/api/uploadComplete", async (req, res) => {
  queueService.getMessage(
    "completed-queue",
    { visibilityTimeout: 5 * 60 },
    async function (err, result) {
      if (err || !result) {
        res.status(500).send("Error fetching or no message in the queue.");
        return;
      }

      const message = result.messageText;

      const decodedMessage = Buffer.from(message, "base64").toString("ascii");
      console.log("Dequeued message:", decodedMessage);

      queueService.deleteMessage(
        "completed-queue",
        result.messageId,
        result.popReceipt,
        async function (deleteError) {
          if (deleteError) {
            res.status(500).send("Error deleting message from the queue.");
            return;
          }
          try {
            // Read the database definition
            const { resource: dbResource } = await cosmosClient
              .database(DATABASE_ID)
              .read();

            // Read the container definition
            const { resource: containerResource } = await cosmosClient
              .database(DATABASE_ID)
              .container(CONTAINER_ID)
              .read();
            console.log("Container response:", containerResource);

            // Read the item by ID
            const { resource: item } = await cosmosClient
              .database(DATABASE_ID)
              .container(CONTAINER_ID)
              .item(decodedMessage)
              .read();
            console.log("Item from CosmosDB:", item);

            if (!item) {
              res.status(404).send("Item not found in CosmosDB.");
              return;
            }

            res.json({
              filename: item.filename,
              urlThumbnail: item.urlThumbnail,
              urlOriginalImage: item.urlOriginalImage,
              textCaption: item.textCaption,
            });
          } catch (error) {
            console.error("CosmosDB Error:", error);
            res.status(500).send("An error occurred while accessing CosmosDB.");
          }
        }
      );
    }
  );
});

app.get("/api/getImages", async (req, res) => {
  try {
    let config = {
      method: "get",
      url: IMAGE_FUNCTION_URL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const response = await axios(config);

    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log("Server listening on port " + port);
});
