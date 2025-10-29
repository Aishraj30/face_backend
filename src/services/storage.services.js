const ImageKit = require("imagekit");
const { v4: uuid } = require("uuid");

const imagekit = new ImageKit({
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVATE_KEY,
  urlEndpoint: process.env.URL_ENDPOINT,
});

const uploadFile = async (file) => {
  try {
    if (!file || !file.buffer) throw new Error("No file buffer provided");

    const result = await imagekit.upload({
      file: file.buffer.toString("base64"),
      fileName: `${uuid()}-${file.originalname}`,
    });

    return result; // result.url contains uploaded image URL
  } catch (err) {
    console.error("ImageKit upload failed:", err);
    throw err;
  }
};

module.exports = { uploadFile };
