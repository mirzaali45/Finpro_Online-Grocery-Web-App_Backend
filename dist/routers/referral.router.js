"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralRouter = void 0;
var express_1 = require("express");
var auth_verify_1 = require("../middleware/auth.verify");
var referral_controller_1 = __importDefault(require("../controllers/referral.controller"));
var ReferralRouter = /** @class */ (function () {
    function ReferralRouter() {
        this.router = (0, express_1.Router)();
        this.referralController = new referral_controller_1.default();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    ReferralRouter.prototype.initializeRoutes = function () {
        this.router.post("/redeem", this.authMiddleware.verifyToken, this.referralController.redeemDiscount);
    };
    ReferralRouter.prototype.getRouter = function () {
        return this.router;
    };
    return ReferralRouter;
}());
exports.ReferralRouter = ReferralRouter;
