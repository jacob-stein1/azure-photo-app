import { AzureFunction, Context, HttpRequest } from "@azure/functions";

const multipart = require("parse-multipart");

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    const bodyBuffer = Buffer.from(req.body);

    const boundary = multipart.getBoundary(req.headers["content-type"]);

    let parts = multipart.Parse(bodyBuffer, boundary);

    const image = parts[0].data;
    const filename = context.bindingData.filename;

    context.bindings.outputBlob = image;

    context.bindings.outputQueueItem = filename;

    context.res = {
      body: {
        message: "Photo uploaded and URL enqueued.",
        url: filename,
      },
    };
  } catch (error) {
    context.log.error("Error processing request", error);
    context.res = {
      status: 500,
      body: "An error occurred while  the photo.",
    };
  }
};

export default httpTrigger;
