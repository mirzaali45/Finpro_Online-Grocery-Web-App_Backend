"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreAdminRouter = void 0;
const express_1 = require("express");
const store_admin_controller_1 = require("../controllers/store-admin.controller");
const auth_verify_1 = require("../middleware/auth.verify");
class StoreAdminRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.storeAdminController = new store_admin_controller_1.StoreAdminController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // View-only Products
        this.router.get("/products", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.storeAdminController.getProducts);
        this.router.get("/products/:product_id", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.storeAdminController.getProductById);
    }
    getRouter() {
        return this.router;
    }
}
exports.StoreAdminRouter = StoreAdminRouter;
