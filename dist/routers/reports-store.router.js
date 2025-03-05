"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsRouter = void 0;
var express_1 = require("express");
var reports_store_controller_1 = require("../controllers/reports-store.controller");
var auth_verify_1 = require("../middleware/auth.verify");
var ReportsRouter = /** @class */ (function () {
    function ReportsRouter() {
        this.router = (0, express_1.Router)();
        this.reportStoreController = new reports_store_controller_1.ReportStore();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    ReportsRouter.prototype.initializeRoutes = function () {
        this.router.get("/", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.reportStoreController.getReportInventory);
    };
    ReportsRouter.prototype.getRouter = function () {
        return this.router;
    };
    return ReportsRouter;
}());
exports.ReportsRouter = ReportsRouter;
