"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueSuperAdminRouter = void 0;
var express_1 = require("express");
var auth_verify_1 = require("../middleware/auth.verify");
var revenue_superadmin_controller_1 = require("../controllers/revenue-superadmin.controller");
var RevenueSuperAdminRouter = /** @class */ (function () {
    function RevenueSuperAdminRouter() {
        this.router = (0, express_1.Router)();
        this.revenueSuperAdminController = new revenue_superadmin_controller_1.RevenueSuperAdminController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    RevenueSuperAdminRouter.prototype.initializeRoutes = function () {
        this.router.get("/allorder", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.revenueSuperAdminController.getAllOrder);
        this.router.get("/period", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.revenueSuperAdminController
            .getRevenueByPeriod);
        this.router.get("/dashboard", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.revenueSuperAdminController.getDashboardStats);
    };
    RevenueSuperAdminRouter.prototype.getRouter = function () {
        return this.router;
    };
    return RevenueSuperAdminRouter;
}());
exports.RevenueSuperAdminRouter = RevenueSuperAdminRouter;
