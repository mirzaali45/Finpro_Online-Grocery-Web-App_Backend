"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscountRouter = void 0;
const express_1 = require("express");
const discount_controller_1 = require("../controllers/discount.controller");
const auth_verify_1 = require("../middleware/auth.verify");
const cloudinary_1 = require("../services/cloudinary");
class DiscountRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.discountController = new discount_controller_1.DiscountController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Get discount routes
        this.router.get("/", this.discountController.getAllDiscounts);
        this.router.get("/store", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.discountController.getStoreDiscounts);
        this.router.get("/product/:productId", this.discountController.getProductDiscounts);
        this.router.get("/user/:userId", this.authMiddleware.verifyToken, this.discountController.getUserDiscounts);
        this.router.get("/:id", this.discountController.getDiscountById);
        this.router.post("/create", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, cloudinary_1.uploadDiscountImage.single("thumbnail"), this.discountController.createDiscount);
        // Update discount route
        this.router.put("/:id", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.discountController.updateDiscount);
        // Delete discount route
        this.router.delete("/:id", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.discountController.deleteDiscount);
        // Discount application routes
        this.router.post("/apply", this.discountController.applyDiscount);
    }
    getRouter() {
        return this.router;
    }
}
exports.DiscountRouter = DiscountRouter;
