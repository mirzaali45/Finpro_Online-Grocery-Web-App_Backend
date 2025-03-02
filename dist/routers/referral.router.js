"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralRouter = void 0;
const express_1 = require("express");
const auth_verify_1 = require("../middleware/auth.verify");
const referral_controller_1 = __importDefault(require("../controllers/referral.controller"));
class ReferralRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.referralController = new referral_controller_1.default();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/redeem", this.authMiddleware.verifyToken, this.referralController.redeemDiscount);
    }
    getRouter() {
        return this.router;
    }
}
exports.ReferralRouter = ReferralRouter;
