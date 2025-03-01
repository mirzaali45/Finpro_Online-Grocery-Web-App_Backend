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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductImageController = void 0;
const client_1 = require("../../prisma/generated/client");
const cloudinary_1 = require("../services/cloudinary");
const responseError_1 = require("../helpers/responseError");
const prisma = new client_1.PrismaClient();
class ProductImageController {
    constructor() {
        this.uploadMiddleware = cloudinary_1.uploadProduct.array("images", 5);
    }
    addProductImages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { product_id } = req.params;
                const files = req.files;
                if (!files || files.length === 0) {
                    return (0, responseError_1.responseError)(res, "No files uploaded");
                }
                const uploadPromises = files.map((file) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        // Upload to Cloudinary first
                        const result = yield (0, cloudinary_1.uploadToCloudinary)(file.path, "product_image");
                        // Then create database record with Cloudinary URL
                        return prisma.productImage.create({
                            data: {
                                product_id: parseInt(product_id),
                                url: result.secure_url,
                            },
                        });
                    }
                    catch (error) {
                        console.error("Error processing file:", error);
                        throw error;
                    }
                }));
                const images = yield Promise.all(uploadPromises);
                return res.status(201).json({
                    status: "success",
                    data: images
                });
            }
            catch (error) {
                return (0, responseError_1.responseError)(res, error instanceof Error ? error.message : "Unknown error occurred");
            }
        });
    }
    getProductImages(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { product_id } = req.params;
                const images = yield prisma.productImage.findMany({
                    where: { product_id: parseInt(product_id) },
                });
                return res.status(200).json({
                    status: "success",
                    data: images
                });
            }
            catch (error) {
                return (0, responseError_1.responseError)(res, error instanceof Error ? error.message : "Unknown error occurred");
            }
        });
    }
    deleteProductImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { image_id } = req.params;
                const image = yield prisma.productImage.findUnique({
                    where: { image_id: parseInt(image_id) },
                });
                if (!image) {
                    return (0, responseError_1.responseError)(res, "Image not found");
                }
                // Delete from Cloudinary first
                const cloudinaryResult = yield (0, cloudinary_1.deleteFromCloudinary)(image.url, "product_image");
                if (!cloudinaryResult) {
                    return (0, responseError_1.responseError)(res, "Failed to delete image from cloud storage");
                }
                // Then delete from database
                yield prisma.productImage.delete({
                    where: { image_id: parseInt(image_id) },
                });
                return res.status(200).json({
                    status: "success",
                    message: "Product image deleted successfully"
                });
            }
            catch (error) {
                return (0, responseError_1.responseError)(res, error instanceof Error ? error.message : "Unknown error occurred");
            }
        });
    }
    getProductImageById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { image_id } = req.params;
                const image = yield prisma.productImage.findUnique({
                    where: { image_id: parseInt(image_id) },
                });
                if (!image) {
                    return (0, responseError_1.responseError)(res, "Image not found");
                }
                return res.status(200).json({
                    status: "success",
                    data: image
                });
            }
            catch (error) {
                return (0, responseError_1.responseError)(res, error instanceof Error ? error.message : "Unknown error occurred");
            }
        });
    }
}
exports.ProductImageController = ProductImageController;
