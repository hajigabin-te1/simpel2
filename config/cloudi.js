import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage untuk lampiran tiket
const tiketStorage = new CloudinaryStorage({
  cloudinary, 
    params: {
    folder: "xdbterpadu/tiket_lampiran",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
    resource_type: "auto",
  },
});

// Storage untuk avatar pengguna
const avatarStorage = new CloudinaryStorage({
  cloudinary,
    params: {
        folder: "xdbterpadu/avatars",
        allowed_formats: ["jpg", "jpeg", "png"],
        transformation: [{ width: 350, height: 350, crop: "fill", gravity: "face" }],
        resource_type: "auto",
    },
});

// Bagian untuk unggah tiket
export const uploadTiket = multer({
storage: tiketStorage,
limits : { fileSize: 5 * 1024 * 1024 }, // Batas ukuran file 5MB
});

export const uploadAvatar = multer({
storage: avatarStorage,
limits : { fileSize: 2 * 1024 * 1024 }, // Batas ukuran file 2MB
});

export default cloudinary;