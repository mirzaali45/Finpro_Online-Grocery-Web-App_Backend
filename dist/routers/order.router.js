"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersRouter = void 0;
const express_1 = require("express");
const orders_controller_1 = require("../controllers/orders.controller");
const auth_verify_1 = require("../middleware/auth.verify");
class OrdersRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.ordersController = new orders_controller_1.OrdersController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/", this.authMiddleware.verifyToken, this.ordersController.createOrder);
    }
    getRouter() {
        return this.router;
    }
}
exports.OrdersRouter = OrdersRouter;
