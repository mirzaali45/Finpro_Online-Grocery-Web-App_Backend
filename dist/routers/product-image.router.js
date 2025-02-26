"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductImageRouter = void 0;
const express_1 = require("express");
const product_image_controller_1 = require("../controllers/product-image.controller");
const auth_verify_1 = require("../middleware/auth.verify");
class ProductImageRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.productImageController = new product_image_controller_1.ProductImageController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Upload images - Super Admin only
        this.router.post("/:product_id/images", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.productImageController.uploadMiddleware, this.productImageController.addProductImages);
        // Get all images for a product - Public
        this.router.get("/:product_id/images", this.productImageController.getProductImages);
        // Get single image - Public
        this.router.get("/images/:image_id", this.productImageController
            .getProductImageById);
        // Delete image - Super Admin only
        this.router.delete("/images/:image_id", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.productImageController
            .deleteProductImage);
    }
    getRouter() {
        return this.router;
    }
}
exports.ProductImageRouter = ProductImageRouter;
