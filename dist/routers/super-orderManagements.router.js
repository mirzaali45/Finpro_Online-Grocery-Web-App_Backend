"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperordermanagementsRouter = void 0;
const express_1 = require("express");
const auth_verify_1 = require("../middleware/auth.verify");
const super_orderManagements_controller_1 = require("../controllers/super-orderManagements.controller");
class SuperordermanagementsRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.superordermanagementsController =
            new super_orderManagements_controller_1.SuperordermanagementsController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.superordermanagementsController
            .getOrdersSpr);
        this.router.post("/update-shipping-status", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.superordermanagementsController.updateShippingStatus);
        this.router.post("/cancel-order", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.superordermanagementsController.cancelOrder);
    }
    getRouter() {
        return this.router;
    }
}
exports.SuperordermanagementsRouter = SuperordermanagementsRouter;
