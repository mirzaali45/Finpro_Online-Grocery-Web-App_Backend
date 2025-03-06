"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueSuperAdminRouter = void 0;
const express_1 = require("express");
const auth_verify_1 = require("../middleware/auth.verify");
const revenue_superadmin_controller_1 = require("../controllers/revenue-superadmin.controller");
class RevenueSuperAdminRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.revenueSuperAdminController = new revenue_superadmin_controller_1.RevenueSuperAdminController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/allorder", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.revenueSuperAdminController.getAllOrder);
        this.router.get("/period", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.revenueSuperAdminController
            .getRevenueByPeriod);
        this.router.get("/dashboard", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.revenueSuperAdminController.getDashboardStats);
    }
    getRouter() {
        return this.router;
    }
}
exports.RevenueSuperAdminRouter = RevenueSuperAdminRouter;
