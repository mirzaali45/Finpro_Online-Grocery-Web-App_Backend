"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueStoreRouter = void 0;
var express_1 = require("express");
var revenue_store_controller_1 = require("../controllers/revenue-store.controller");
var auth_verify_1 = require("../middleware/auth.verify");
var RevenueStoreRouter = /** @class */ (function () {
    function RevenueStoreRouter() {
        this.router = (0, express_1.Router)();
        this.revenueStoreController = new revenue_store_controller_1.RevenueStoreController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    RevenueStoreRouter.prototype.initializeRoutes = function () {
        this.router.get("/", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.revenueStoreController.getOrderbyStore);
        this.router.get("/period", this.authMiddleware.verifyToken, this.revenueStoreController.getRevenueByPeriod);
    };
    RevenueStoreRouter.prototype.getRouter = function () {
        return this.router;
    };
    return RevenueStoreRouter;
}());
exports.RevenueStoreRouter = RevenueStoreRouter;
