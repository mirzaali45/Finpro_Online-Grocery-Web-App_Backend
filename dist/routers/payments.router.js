"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsRouter = void 0;
const express_1 = require("express");
const auth_verify_1 = require("../middleware/auth.verify");
const payments_controller_1 = require("../controllers/payments.controller");
class PaymentsRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.paymentsController = new payments_controller_1.PaymentsController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/snap-token", this.paymentsController.createSnapToken);
        this.router.post("/notification", this.paymentsController.midtransNotification);
    }
    getRouter() {
        return this.router;
    }
}
exports.PaymentsRouter = PaymentsRouter;
