"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoucherRouter = void 0;
var express_1 = require("express");
var voucher_controller_1 = require("../controllers/voucher.controller");
var auth_verify_1 = require("../middleware/auth.verify");
var VoucherRouter = /** @class */ (function () {
    function VoucherRouter() {
        this.router = (0, express_1.Router)();
        this.voucherController = new voucher_controller_1.VoucherController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    VoucherRouter.prototype.initializeRoutes = function () {
        // Claim a discount (create voucher)
        this.router.post("/", this.authMiddleware.verifyToken, this.voucherController.claimDiscount);
        // Get user's vouchers
        this.router.get("/my-vouchers", this.authMiddleware.verifyToken, this.voucherController.getUserVouchers);
        // Delete a voucher
        this.router.delete("/:voucher_id", this.authMiddleware.verifyToken, this.voucherController.deleteVoucher);
    };
    VoucherRouter.prototype.getRouter = function () {
        return this.router;
    };
    return VoucherRouter;
}());
exports.VoucherRouter = VoucherRouter;
