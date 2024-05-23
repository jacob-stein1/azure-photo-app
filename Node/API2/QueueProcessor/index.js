const sharp = require("sharp");

module.exports = async function (context, myQueueItem, myInputBlob) {
  const secret = process.env.SECRET_3;
  console.log(secret);
  context.log(
    "JavaScript queue trigger function processed work item",
    myQueueItem
  );

  const filename = myQueueItem;

  const downsizedWidth = 640;
  const thumbnailWidth = 200;
  const thumbnailHeight = 150;

  const originalImage = Buffer.from(myInputBlob);

  const downsizedImage = await sharp(originalImage)
    .resize(downsizedWidth)
    .toBuffer();

  const thumbnailImage = await sharp(originalImage)
    .resize(thumbnailWidth, thumbnailHeight)
    .toBuffer();

  context.bindings.downsizedBlob = downsizedImage;
  context.bindings.thumbnailBlob = thumbnailImage;
  context.bindings.visionQueueItem = filename;

  context.log("Image processing completed.");
};
