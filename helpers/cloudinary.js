const cloudinary = require("cloudinary").v2;
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KRY_CLOUDINARY,
  api_secret: process.env.API_SECRET,
});

const storage = new multer.memoryStorage();

async function imageUploadUtil(file) {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
        folder: "Chat Tradof",
        resource_type: "auto", // Support all file types
    });
    
      return uploadResponse;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Error uploading image");
  }
}

const upload = multer({ storage });

module.exports = { upload, imageUploadUtil };
