"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoucherRouter = void 0;
const express_1 = require("express");
const voucher_controller_1 = require("../controllers/voucher.controller");
const auth_verify_1 = require("../middleware/auth.verify");
class VoucherRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.voucherController = new voucher_controller_1.VoucherController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Claim a discount (create voucher)
        this.router.post("/", this.authMiddleware.verifyToken, this.voucherController.claimDiscount);
        // Get user's vouchers
        this.router.get("/my-vouchers", this.authMiddleware.verifyToken, this.voucherController.getUserVouchers);
        // Delete a voucher
        this.router.delete("/:voucher_id", this.authMiddleware.verifyToken, this.voucherController.deleteVoucher);
    }
    getRouter() {
        return this.router;
    }
}
exports.VoucherRouter = VoucherRouter;
