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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDiscountImage = exports.deleteCategoryImage = exports.deleteAvatarImage = exports.deleteProductImage = exports.deleteFromCloudinary = exports.uploadDiscountThumbnail = exports.uploadCategoryThumbnail = exports.uploadAvatarImage = exports.uploadProductImage = exports.uploadToCloudinary = exports.uploadDiscountImage = exports.uploadCategoryImage = exports.uploadAvatar = exports.uploadProduct = exports.cloudinary = void 0;
var cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });

const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Determine upload directory based on environment
const uploadDir = process.env.NODE_ENV === "production"
    ? "/tmp/uploads" // Use /tmp in production (serverless)
    : path_1.default.join(process.cwd(), "uploads"); // Use local path in development
// Create uploads directory if it doesn't exist
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
var storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        var uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        var ext = path_1.default.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});
// File filter for images
var imageFileFilter = function (req, file, cb) {
    var allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedMimes.includes(file.mimetype)) {
        return cb(new Error("Only .jpg, .jpeg, .png, and .webp files are allowed"), false);
    }
    cb(null, true);
};
// Configure multer upload for products
var uploadProduct = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: imageFileFilter,
});
exports.uploadProduct = uploadProduct;
// Configure multer upload for avatars
var uploadAvatar = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit
    },
    fileFilter: imageFileFilter,
});
exports.uploadAvatar = uploadAvatar;
// Configure multer upload for category images
var uploadCategoryImage = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB limit
    },
    fileFilter: imageFileFilter,
});
exports.uploadCategoryImage = uploadCategoryImage;
// Configure multer upload for discount images
var uploadDiscountImage = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB limit
    },
    fileFilter: imageFileFilter,
});
exports.uploadDiscountImage = uploadDiscountImage;
// Upload to Cloudinary function
var uploadToCloudinary = function (filePath, folder) { return __awaiter(void 0, void 0, void 0, function () {
    var absolutePath, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                absolutePath = path_1.default.isAbsolute(filePath)
                    ? filePath
                    : path_1.default.join(uploadDir, path_1.default.basename(filePath));
                // Check if file exists
                if (!fs_1.default.existsSync(absolutePath)) {
                    throw new Error("File not found: ".concat(absolutePath));
                }
                return [4 /*yield*/, cloudinary_1.v2.uploader.upload(absolutePath, {
                        folder: folder,
                        resource_type: "auto",
                        transformation: [{ width: 1000, height: 1000, crop: "limit" }],
                    })];
            case 1:
                result = _a.sent();
                // Clean up temporary file
                try {
                    fs_1.default.unlinkSync(absolutePath);
                }
                catch (error) {
                    console.error("Error deleting temporary file:", error);
                }
                return [2 /*return*/, result];
            case 2:
                error_1 = _a.sent();
                console.error("Cloudinary upload error:", error_1);
                throw error_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.uploadToCloudinary = uploadToCloudinary;
// Helper functions for specific upload types
var uploadProductImage = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, uploadToCloudinary(filePath, "product_images")];
    });
}); };
exports.uploadProductImage = uploadProductImage;
var uploadAvatarImage = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, uploadToCloudinary(filePath, "avatars")];
    });
}); };
exports.uploadAvatarImage = uploadAvatarImage;
var uploadCategoryThumbnail = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, uploadToCloudinary(filePath, "category_image")];
    });
}); };
exports.uploadCategoryThumbnail = uploadCategoryThumbnail;
var uploadDiscountThumbnail = function (filePath) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, uploadToCloudinary(filePath, "discount_image")];
    });
}); };
exports.uploadDiscountThumbnail = uploadDiscountThumbnail;
// Delete from Cloudinary function
var deleteFromCloudinary = function (url, folder) { return __awaiter(void 0, void 0, void 0, function () {
    var urlParts, filenameWithExt, publicId, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                urlParts = url.split("/");
                filenameWithExt = urlParts[urlParts.length - 1];
                publicId = "".concat(folder, "/").concat(filenameWithExt.split(".")[0]);
                console.log("Attempting to delete with publicId:", publicId);
                return [4 /*yield*/, cloudinary_1.v2.uploader.destroy(publicId)];
            case 1:
                result = _a.sent();
                if (result.result !== "ok") {
                    console.error("Cloudinary delete returned:", result);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/, true];
            case 2:
                error_2 = _a.sent();
                console.error("Error deleting from Cloudinary:", error_2);
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteFromCloudinary = deleteFromCloudinary;
// Folder-specific delete helpers
var deleteProductImage = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, deleteFromCloudinary(url, "product_images")];
    });
}); };
exports.deleteProductImage = deleteProductImage;
var deleteAvatarImage = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, deleteFromCloudinary(url, "avatars")];
    });
}); };
exports.deleteAvatarImage = deleteAvatarImage;
var deleteCategoryImage = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, deleteFromCloudinary(url, "category_image")];
    });
}); };
exports.deleteCategoryImage = deleteCategoryImage;
var deleteDiscountImage = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, deleteFromCloudinary(url, "discount_image")];
    });
}); };
exports.deleteDiscountImage = deleteDiscountImage;
// Verify Cloudinary configuration on startup
var verifyCloudinaryConfig = function () {
    var requiredVars = [
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
    ];
    var missing = requiredVars.filter(function (varName) { return !process.env[varName]; });
    if (missing.length > 0) {
        console.error("Missing required Cloudinary environment variables:", missing);
        throw new Error("Cloudinary configuration incomplete");
    }
};
// Verify config on module load
verifyCloudinaryConfig();
