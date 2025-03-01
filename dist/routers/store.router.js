"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreRouter = void 0;
const express_1 = require("express");
const store_controller_1 = require("../controllers/store.controller");
const auth_verify_1 = require("../middleware/auth.verify");
class StoreRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.storeController = new store_controller_1.StoreController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Create store - Super Admin only
        this.router.post("/", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.storeController.createStore);
        // Get all stores - Super Admin only
        this.router.get("/", this.storeController.getStores);
        // Get store by ID - Super Admin only
        this.router.get("/:store_id", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.storeController.getStoreById);
        // Update store - Super Admin only
        this.router.patch("/:store_id", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdminOrOwner, this.storeController.updateStore);
        // Delete store - Super Admin only
        this.router.delete("/:store_id", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.storeController.deleteStore);
    }
    getRouter() {
        return this.router;
    }
}
exports.StoreRouter = StoreRouter;
