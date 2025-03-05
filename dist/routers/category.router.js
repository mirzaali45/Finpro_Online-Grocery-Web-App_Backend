"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRouter = void 0;
var express_1 = require("express");
var category_controller_1 = require("../controllers/category.controller");
var auth_verify_1 = require("../middleware/auth.verify");
var cloudinary_1 = require("../services/cloudinary");
var CategoryRouter = /** @class */ (function () {
    function CategoryRouter() {
        this.router = (0, express_1.Router)();
        this.categoryController = new category_controller_1.CategoryController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    CategoryRouter.prototype.initializeRoutes = function () {
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
    };
    CategoryRouter.prototype.getRouter = function () {
        return this.router;
    };
    return CategoryRouter;
}());
exports.CategoryRouter = CategoryRouter;
