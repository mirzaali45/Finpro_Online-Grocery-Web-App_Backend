"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsRouter = void 0;
var express_1 = require("express");
var auth_verify_1 = require("../middleware/auth.verify");
var payments_controller_1 = require("../controllers/payments.controller");
var PaymentsRouter = /** @class */ (function () {
    function PaymentsRouter() {
        this.router = (0, express_1.Router)();
        this.paymentsController = new payments_controller_1.PaymentsController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    PaymentsRouter.prototype.initializeRoutes = function () {
        this.router.post("/create", this.authMiddleware.verifyToken, this.paymentsController.createPaymentOrder);
        this.router.post("/callback", this.paymentsController.paymentCallback);
    };
    PaymentsRouter.prototype.getRouter = function () {
        return this.router;
    };
    return PaymentsRouter;
}());
exports.PaymentsRouter = PaymentsRouter;
