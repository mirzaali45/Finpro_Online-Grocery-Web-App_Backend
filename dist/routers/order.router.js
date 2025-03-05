"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersRouter = void 0;
var express_1 = require("express");
var orders_controller_1 = require("../controllers/orders.controller");
var auth_verify_1 = require("../middleware/auth.verify");
var OrdersRouter = /** @class */ (function () {
    function OrdersRouter() {
        this.router = (0, express_1.Router)();
        this.ordersController = new orders_controller_1.OrdersController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    OrdersRouter.prototype.initializeRoutes = function () {
        // Create order from cart
        this.router.post("/from-cart", this.authMiddleware.verifyToken.bind(this.authMiddleware), this.ordersController.createOrderFromCart.bind(this.ordersController));
        // Get orders with optional filters (admin route)
        this.router.get("/", this.authMiddleware.verifyToken.bind(this.authMiddleware), this.ordersController.getOrders.bind(this.ordersController));
        // Get the authenticated user's orders
        this.router.get("/my-orders", this.authMiddleware.verifyToken.bind(this.authMiddleware), this.ordersController.getMyOrders.bind(this.ordersController));
        this.router.delete("/my-orders/:order_id", this.authMiddleware.verifyToken.bind(this.authMiddleware), this.ordersController.deleteMyOrder.bind(this.ordersController));
    };
    OrdersRouter.prototype.getRouter = function () {
        return this.router;
    };
    return OrdersRouter;
}());
exports.OrdersRouter = OrdersRouter;
