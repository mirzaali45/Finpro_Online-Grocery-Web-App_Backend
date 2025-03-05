"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRouter = void 0;
var express_1 = require("express");
var product_controllers_1 = require("../controllers/product.controllers");
var auth_verify_1 = require("../middleware/auth.verify");
var ProductRouter = /** @class */ (function () {
    function ProductRouter() {
        this.router = (0, express_1.Router)();
        this.productController = new product_controllers_1.ProductController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    ProductRouter.prototype.initializeRoutes = function () {
        this.router.post("/", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.productController.createProduct);
        this.router.get("/store", this.authMiddleware.verifyToken, this.productController.getProductsByStore);
        this.router.get("/discounted", this.productController.getDiscountedProducts);
        this.router.patch("/:product_id", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.productController.updateProduct);
        this.router.delete("/:product_id", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.productController.deleteProduct);
        this.router.get("/", this.productController.getProducts);
        this.router.get("/:product_id", this.productController.getProductById);
        this.router.get("/slug/:slug", this.productController.getProductBySlug);
    };
    ProductRouter.prototype.getRouter = function () {
        return this.router;
    };
    return ProductRouter;
}());
exports.ProductRouter = ProductRouter;
