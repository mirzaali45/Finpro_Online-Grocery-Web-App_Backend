"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsRouter = void 0;
const express_1 = require("express");
const reports_store_controller_1 = require("../controllers/reports-store.controller");
const auth_verify_1 = require("../middleware/auth.verify");
class ReportsRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.reportStoreController = new reports_store_controller_1.ReportStore();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.reportStoreController.getReportInventory);
    }
    getRouter() {
        return this.router;
    }
}
exports.ReportsRouter = ReportsRouter;
