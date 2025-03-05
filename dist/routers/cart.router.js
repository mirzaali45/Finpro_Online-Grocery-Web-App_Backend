"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRouter = void 0;
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const auth_verify_1 = require("../middleware/auth.verify"); // Your existing middleware
class CartRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.cartController = new cart_controller_1.CartController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Add verifyToken middleware to all routes
        this.router.get("/get", this.authMiddleware.verifyToken, this.cartController.getCart);
        this.router.get("/user/:userId", this.authMiddleware.verifyToken, this.cartController.getCartbyId);
        this.router.post("/add", this.authMiddleware.verifyToken, this.cartController.addToCart);
        this.router.put("/updatecart", this.authMiddleware.verifyToken, this.cartController.updateCart);
        this.router.delete("/remove/:cartItemId", this.authMiddleware.verifyToken, this.cartController.removeFromCart);
    }
    getRouter() {
        return this.router;
    }
}
exports.CartRouter = CartRouter;
