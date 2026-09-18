const sharp = require("sharp");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");

// =====================================================
// UPLOAD ONE IMAGE TO CLOUDINARY
// =====================================================

const uploadRoomImage = async (file) => {
  if (!file || !file.buffer) {
    throw new Error("No image file received.");
  }

  // ---------------------------------------------
  // IMAGE OPTIMIZATION
  // ---------------------------------------------

  const optimizedBuffer = await sharp(file.buffer)
    .rotate()
    .resize({
      width: 1600,
      height: 1200,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: 80,
      effort: 5,
    })
    .toBuffer();

  // ---------------------------------------------
  // CLOUDINARY UPLOAD
  // ---------------------------------------------

  const uploadResult = await new Promise(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "backpacker-gateways/rooms",
          resource_type: "image",
          format: "webp",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      Readable.from(optimizedBuffer).pipe(stream);
    }
  );

  // ---------------------------------------------
  // RETURN OPTIMIZED IMAGE INFORMATION
  // ---------------------------------------------

  return {
    url: uploadResult.secure_url,
    publicId: uploadResult.public_id,
    width: uploadResult.width,
    height: uploadResult.height,
    format: uploadResult.format,
    bytes: uploadResult.bytes,
  };
};

module.exports = {
  uploadRoomImage,
};