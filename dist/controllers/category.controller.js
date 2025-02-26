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
exports.CategoryController = void 0;
const client_1 = require("@prisma/client");
const cloudinary_1 = require("../services/cloudinary");
const prisma = new client_1.PrismaClient();
class CategoryController {
    createCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category_name, description } = req.body;
                // Check if required fields are provided
                if (!category_name || !description) {
                    return res.status(400).json({
                        error: "Category name and description are required",
                    });
                }
                // Initialize data object for category creation
                const categoryData = {
                    category_name,
                    description,
                };
                // Handle file upload if exists
                if (req.file) {
                    try {
                        // Upload to Cloudinary
                        const result = yield (0, cloudinary_1.uploadCategoryThumbnail)(req.file.path);
                        // Add image URL to category data
                        categoryData.category_thumbnail = result.secure_url;
                    }
                    catch (uploadError) {
                        console.error("Error uploading thumbnail:", uploadError);
                        return res.status(500).json({
                            error: "Failed to upload category thumbnail",
                        });
                    }
                }
                // Create category with or without thumbnail
                const category = yield prisma.category.create({
                    data: categoryData,
                });
                return res.status(201).json({
                    success: true,
                    message: "Category created successfully",
                    data: category,
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({
                    success: false,
                    error: message,
                });
            }
        });
    }
    getCategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield prisma.category.findMany({
                    include: {
                        Product: true,
                    },
                });
                return res.status(200).json(categories);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    getCategoryById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category_id } = req.params;
                const category = yield prisma.category.findUnique({
                    where: { category_id: parseInt(category_id) },
                    include: {
                        Product: true,
                    },
                });
                if (!category) {
                    throw new Error("Category not found");
                }
                return res.status(200).json(category);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    updateCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category_id } = req.params;
                const { category_name, description, category_url } = req.body;
                const category = yield prisma.category.update({
                    where: { category_id: parseInt(category_id) },
                    data: {
                        category_name,
                        description,
                    },
                });
                return res.status(200).json(category);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    deleteCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category_id } = req.params;
                yield prisma.category.delete({
                    where: { category_id: parseInt(category_id) },
                });
                return res.status(200).json({ message: "Category deleted successfully" });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
}
exports.CategoryController = CategoryController;
