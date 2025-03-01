"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsRouter = void 0;
const express_1 = require("express");
const reports_store_controller_1 = require("../controllers/reports-store.controller");
const auth_verify_1 = require("../middleware/auth.verify");
class ReportsRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.reportsController = new reports_store_controller_1.ReportsController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/sales/monthly", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.reportsController.getMonthlySalesReport);
        this.router.get("/sales/by-category", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.reportsController
            .getMonthlySalesByCategory);
        this.router.get("/sales/by-product", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.reportsController
            .getMonthlySalesByProduct);
        this.router.get("/stock/summary", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.reportsController
            .getMonthlyStockSummaryReport);
        this.router.get("/stock/product-detail", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.reportsController
            .getDetailedProductStockReport);
    }
    getRouter() {
        return this.router;
    }
}
exports.ReportsRouter = ReportsRouter;
