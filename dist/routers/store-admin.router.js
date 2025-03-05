"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreAdminRouter = void 0;
var express_1 = require("express");
var store_admin_controller_1 = require("../controllers/store-admin.controller");
var auth_verify_1 = require("../middleware/auth.verify");
var StoreAdminRouter = /** @class */ (function () {
    function StoreAdminRouter() {
        this.router = (0, express_1.Router)();
        this.storeAdminController = new store_admin_controller_1.StoreAdminController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    StoreAdminRouter.prototype.initializeRoutes = function () {
        // View-only Products
        this.router.get("/products", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.storeAdminController.getProducts);
        this.router.get("/products/:product_id", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.storeAdminController.getProductById);
    };
    StoreAdminRouter.prototype.getRouter = function () {
        return this.router;
    };
    return StoreAdminRouter;
}());
exports.StoreAdminRouter = StoreAdminRouter;
