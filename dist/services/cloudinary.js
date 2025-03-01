"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDiscountImage = exports.deleteCategoryImage = exports.deleteAvatarImage = exports.deleteProductImage = exports.deleteFromCloudinary = exports.uploadDiscountThumbnail = exports.uploadCategoryThumbnail = exports.uploadAvatarImage = exports.uploadProductImage = exports.uploadToCloudinary = exports.uploadDiscountImage = exports.uploadCategoryImage = exports.uploadAvatar = exports.uploadProduct = exports.cloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Create uploads directory if it doesn't exist
const uploadDir = path_1.default.join(process.cwd(), "uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Local storage for temporary file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});
// File filter for images
const imageFileFilter = (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error("Only .jpg, .jpeg, .png, and .webp files are allowed"), false);
    }
    cb(null, true);
};
// Configure multer upload for products
const uploadProduct = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: imageFileFilter,
});
exports.uploadProduct = uploadProduct;
// Configure multer upload for avatars
const uploadAvatar = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
    },
    fileFilter: imageFileFilter,
});
exports.uploadAvatar = uploadAvatar;
// Configure multer upload for category images
const uploadCategoryImage = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB limit
    },
    fileFilter: imageFileFilter,
});
exports.uploadCategoryImage = uploadCategoryImage;
// Configure multer upload for discount images
const uploadDiscountImage = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB limit
    },
    fileFilter: imageFileFilter,
});
exports.uploadDiscountImage = uploadDiscountImage;
// Upload to Cloudinary function
const uploadToCloudinary = (filePath, folder) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get absolute path
        const absolutePath = path_1.default.isAbsolute(filePath)
            ? filePath
            : path_1.default.join(uploadDir, path_1.default.basename(filePath));
        // Check if file exists
        if (!fs_1.default.existsSync(absolutePath)) {
            throw new Error(`File not found: ${absolutePath}`);
        }
        // Upload to Cloudinary
        const result = yield cloudinary_1.v2.uploader.upload(absolutePath, {
            folder: folder,
            resource_type: "auto",
            transformation: [{ width: 1000, height: 1000, crop: "limit" }],
        });
        // Clean up temporary file
        try {
            fs_1.default.unlinkSync(absolutePath);
        }
        catch (error) {
            console.error("Error deleting temporary file:", error);
        }
        return result;
    }
    catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
});
exports.uploadToCloudinary = uploadToCloudinary;
// Helper functions for specific upload types
const uploadProductImage = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    return uploadToCloudinary(filePath, "product_images");
});
exports.uploadProductImage = uploadProductImage;
const uploadAvatarImage = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    return uploadToCloudinary(filePath, "avatars");
});
exports.uploadAvatarImage = uploadAvatarImage;
const uploadCategoryThumbnail = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    return uploadToCloudinary(filePath, "category_image");
});
exports.uploadCategoryThumbnail = uploadCategoryThumbnail;
const uploadDiscountThumbnail = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    return uploadToCloudinary(filePath, "discount_image");
});
exports.uploadDiscountThumbnail = uploadDiscountThumbnail;
// Delete from Cloudinary function
const deleteFromCloudinary = (url, folder) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract public ID from URL - handle both www and res.cloudinary.com URLs
        const urlParts = url.split("/");
        const filenameWithExt = urlParts[urlParts.length - 1];
        const publicId = `${folder}/${filenameWithExt.split(".")[0]}`;
        console.log("Attempting to delete with publicId:", publicId);
        const result = yield cloudinary_1.v2.uploader.destroy(publicId);
        if (result.result !== "ok") {
            console.error("Cloudinary delete returned:", result);
            return false;
        }
        return true;
    }
    catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return false;
    }
});
exports.deleteFromCloudinary = deleteFromCloudinary;
// Folder-specific delete helpers
const deleteProductImage = (url) => __awaiter(void 0, void 0, void 0, function* () {
    return deleteFromCloudinary(url, "product_images");
});
exports.deleteProductImage = deleteProductImage;
const deleteAvatarImage = (url) => __awaiter(void 0, void 0, void 0, function* () {
    return deleteFromCloudinary(url, "avatars");
});
exports.deleteAvatarImage = deleteAvatarImage;
const deleteCategoryImage = (url) => __awaiter(void 0, void 0, void 0, function* () {
    return deleteFromCloudinary(url, "category_image");
});
exports.deleteCategoryImage = deleteCategoryImage;
const deleteDiscountImage = (url) => __awaiter(void 0, void 0, void 0, function* () {
    return deleteFromCloudinary(url, "discount_image");
});
exports.deleteDiscountImage = deleteDiscountImage;
// Verify Cloudinary configuration on startup
const verifyCloudinaryConfig = () => {
    const requiredVars = [
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
    ];
    const missing = requiredVars.filter((varName) => !process.env[varName]);
    if (missing.length > 0) {
        console.error("Missing required Cloudinary environment variables:", missing);
        throw new Error("Cloudinary configuration incomplete");
    }
};
// Verify config on module load
verifyCloudinaryConfig();
