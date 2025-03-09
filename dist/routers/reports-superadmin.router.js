"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportSuperAdminRouter = void 0;
const express_1 = require("express");
const reports_superadmin_controller_1 = require("../controllers/reports-superadmin.controller");
const auth_verify_1 = require("../middleware/auth.verify");
class ReportSuperAdminRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.reportsSuperController = new reports_superadmin_controller_1.ReportSuperAdmin();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.reportsSuperController.getReportInventorySuperAdmin);
    }
    getRouter() {
        return this.router;
    }
}
exports.ReportSuperAdminRouter = ReportSuperAdminRouter;
