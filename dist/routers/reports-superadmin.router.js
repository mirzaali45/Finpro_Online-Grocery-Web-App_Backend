"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportSuperAdminRouter = void 0;
var express_1 = require("express");
var reports_superadmin_controller_1 = require("../controllers/reports-superadmin.controller");
var auth_verify_1 = require("../middleware/auth.verify");
var ReportSuperAdminRouter = /** @class */ (function () {
    function ReportSuperAdminRouter() {
        this.router = (0, express_1.Router)();
        this.reportsSuperController = new reports_superadmin_controller_1.ReportSuperAdmin();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    ReportSuperAdminRouter.prototype.initializeRoutes = function () {
        this.router.get("/", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.reportsSuperController.getReportInventorySuperAdmin);
    };
    ReportSuperAdminRouter.prototype.getRouter = function () {
        return this.router;
    };
    return ReportSuperAdminRouter;
}());
exports.ReportSuperAdminRouter = ReportSuperAdminRouter;
