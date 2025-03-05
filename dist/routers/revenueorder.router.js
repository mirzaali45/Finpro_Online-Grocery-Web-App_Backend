"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueStoreRouter = void 0;
const express_1 = require("express");
const revenue_store_controller_1 = require("../controllers/revenue-store.controller");
const auth_verify_1 = require("../middleware/auth.verify");
class RevenueStoreRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.revenueStoreController = new revenue_store_controller_1.RevenueStoreController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.revenueStoreController.getOrderbyStore);
        this.router.get("/period", this.authMiddleware.verifyToken, this.revenueStoreController.getRevenueByPeriod);
    }
    getRouter() {
        return this.router;
    }
}
exports.RevenueStoreRouter = RevenueStoreRouter;
