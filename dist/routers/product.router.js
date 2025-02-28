"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRouter = void 0;
const express_1 = require("express");
const product_controllers_1 = require("../controllers/product.controllers");
const auth_verify_1 = require("../middleware/auth.verify");
class ProductRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.productController = new product_controllers_1.ProductController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.productController.createProduct);
        this.router.get("/store", this.authMiddleware.verifyToken, this.productController.getProductsByStore);
        this.router.get("/discounted", this.productController.getDiscountedProducts);
        this.router.patch("/:product_id", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.productController.updateProduct);
        this.router.delete("/:product_id", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.productController.deleteProduct);
        this.router.get("/", this.productController.getProducts);
        this.router.get("/:product_id", this.productController.getProductById);
        this.router.get("/slug/:slug", this.productController.getProductBySlug);
    }
    getRouter() {
        return this.router;
    }
}
exports.ProductRouter = ProductRouter;
