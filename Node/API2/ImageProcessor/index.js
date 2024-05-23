const axios = require("axios");
const sizeOf = require("image-size");

module.exports = async function (context, myQueueItem) {
  context.log(
    "JavaScript queue trigger function processed work item",
    myQueueItem
  );

  const COMPUTER_VISION_KEY = process.env.COMPUTER_VISION_KEY;
  const ENDPOINT = process.env.COMPUTER_VISION_ENDPOINT;
  const CONTAINER_URL = process.env.CONTAINER_URL;

  const imageUrl = `${CONTAINER_URL}downsized-blob/${myQueueItem}`;
  const body = JSON.stringify({ url: imageUrl });

  try {
    const response = await axios.post(ENDPOINT, body, {
      headers: {
        "Ocp-Apim-Subscription-Key": COMPUTER_VISION_KEY,
        "Content-Type": "application/json",
      },
      params: {
        visualFeatures: "Categories,Description,Color",
        language: "en",
      },
    });

    context.log("Computer Vision API call successful.");
    const caption = response.data.captionResult.text;

    const document = {
      id: myQueueItem,
      filename: myQueueItem,
      size: null,
      dimensions: null,
      urlThumbnail: `${CONTAINER_URL}thumbnail-blob/${myQueueItem}`,
      urlDownsizedImage: imageUrl,
      urlOriginalImage: `${CONTAINER_URL}image-blob/${myQueueItem}`,
      textCaption: caption,
      entities: null,
    };

    context.bindings.document = document;

    const originalImage = await axios.get(document.urlOriginalImage, {
      responseType: "arraybuffer",
    });
    const originalImageBuffer = Buffer.from(originalImage.data, "binary");
    const dimensions = sizeOf(originalImageBuffer);
    document.size = originalImageBuffer.length;
    document.dimensions = `${dimensions.width}x${dimensions.height}`;

    context.bindings.completedQueueItem = myQueueItem;

    context.log("Successfully loaded to CosmosDB");
  } catch (error) {
    context.log.error("Error calling the Computer Vision API:", error);
    throw new Error(`Computer Vision API call failed: ${error}`);
  }
};
