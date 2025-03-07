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
        // Create order from cart
        this.router.post("/from-cart", this.authMiddleware.verifyToken.bind(this.authMiddleware), this.ordersController.createOrderFromCart.bind(this.ordersController));
        // Get orders with optional filters (admin route)
        this.router.get("/", this.authMiddleware.verifyToken.bind(this.authMiddleware), this.ordersController.getOrders.bind(this.ordersController));
        // Get the authenticated user's orders
        this.router.get("/my-orders", this.authMiddleware.verifyToken.bind(this.authMiddleware), this.ordersController.getMyOrders.bind(this.ordersController));
        // Delete/cancel the user's order
        this.router.delete("/my-orders/:order_id", this.authMiddleware.verifyToken.bind(this.authMiddleware), this.ordersController.deleteMyOrder.bind(this.ordersController));
<<<<<<< HEAD
=======
        // Update order total price
        this.router.put("/:order_id", this.authMiddleware.verifyToken.bind(this.authMiddleware), this.ordersController.updateOrder.bind(this.ordersController));
>>>>>>> 4c1860705a7dfa2423dc30897986971170f80551
    }
    getRouter() {
        return this.router;
    }
}
exports.OrdersRouter = OrdersRouter;
