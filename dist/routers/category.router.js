"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRouter = void 0;
const express_1 = require("express");
const category_controller_1 = require("../controllers/category.controller");
const auth_verify_1 = require("../middleware/auth.verify");
const cloudinary_1 = require("../services/cloudinary");
class CategoryRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.categoryController = new category_controller_1.CategoryController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Create category - Super Admin only
        this.router.post("/", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, cloudinary_1.uploadCategoryImage.single("image"), this.categoryController.createCategory);
        // Get all categories - Public
        this.router.get("/", this.categoryController.getCategories);
        // Get category by ID - Public
        this.router.get("/:category_id", this.categoryController.getCategoryById);
        // Update category - Super Admin only
        this.router.put("/:category_id", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.categoryController.updateCategory);
        // Delete category - Super Admin only
        this.router.delete("/:category_id", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.categoryController.deleteCategory);
    }
    getRouter() {
        return this.router;
    }
}
exports.CategoryRouter = CategoryRouter;
