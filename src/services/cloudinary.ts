import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import path from "path";
import fs from "fs";

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Local storage for temporary file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// File filter for images
const imageFileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedMimes.includes(file.mimetype)) {
    return cb(
      new Error("Only .jpg, .jpeg, .png, and .webp files are allowed"),
      false
    );
  }
  cb(null, true);
};

// Configure multer upload for products
const uploadProduct = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: imageFileFilter,
});

// Configure multer upload for avatars
const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: imageFileFilter,
});

// Upload to Cloudinary function
const uploadToCloudinary = async (filePath: string, folder: string) => {
  try {
    // Get absolute path
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.join(uploadDir, path.basename(filePath));

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(absolutePath, {
      folder: folder,
      resource_type: "auto",
      transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    });

    // Clean up temporary file
    try {
      fs.unlinkSync(absolutePath);
    } catch (error) {
      console.error("Error deleting temporary file:", error);
    }

    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

// Delete from Cloudinary function
const deleteFromCloudinary = async (url: string, folder: string) => {
  try {
    // Extract public ID from URL - handle both www and res.cloudinary.com URLs
    const urlParts = url.split("/");
    const filenameWithExt = urlParts[urlParts.length - 1];
    const publicId = `${folder}/${filenameWithExt.split(".")[0]}`;

    console.log("Attempting to delete with publicId:", publicId);

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok") {
      console.error("Cloudinary delete returned:", result);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
};

// Verify Cloudinary configuration on startup
const verifyCloudinaryConfig = () => {
  const requiredVars = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error(
      "Missing required Cloudinary environment variables:",
      missing
    );
    throw new Error("Cloudinary configuration incomplete");
  }
};

// Verify config on module load
verifyCloudinaryConfig();

export {
  cloudinary,
  uploadProduct,
  uploadAvatar,
  uploadToCloudinary,
  deleteFromCloudinary,
};
