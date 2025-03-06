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
        // Route for payment initiation
        this.router.post("/:order_id", this.authMiddleware.verifyToken, this.paymentsController.initiatePayment);
        // Callback route - receives notifications from Midtrans
        this.router.post("/callback", this.paymentsController.paymentCallback);
        // Test route that always returns 200 OK
        this.router.post("/callback-test", (req, res) => {
            console.log("Test callback received - Headers:", req.headers);
            console.log("Test callback received - Body:", req.body);
            res
                .status(200)
                .json({ success: true, message: "Test callback received" });
        });
        // Handle redirect from payment page
        this.router.get("/redirect", this.paymentsController.handlePaymentRedirect);
        // New endpoint to manually check and update payment status - WITH authentication
        this.router.get("/:order_id/check-status", this.authMiddleware.verifyToken, this.paymentsController.checkPaymentStatus);
        // Public endpoint to manually check and update payment status - WITHOUT authentication
        // This will be useful for the payment success page
        this.router.get("/public/:order_id/check-status", this.paymentsController.checkPaymentStatus);
    }
    getRouter() {
        return this.router;
    }
}
exports.PaymentsRouter = PaymentsRouter;
