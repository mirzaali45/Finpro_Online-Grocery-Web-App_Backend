"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRouter = void 0;
var express_1 = require("express");
var cart_controller_1 = require("../controllers/cart.controller");
var auth_verify_1 = require("../middleware/auth.verify"); // Your existing middleware
var CartRouter = /** @class */ (function () {
    function CartRouter() {
        this.router = (0, express_1.Router)();
        this.cartController = new cart_controller_1.CartController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    CartRouter.prototype.initializeRoutes = function () {
        // Add verifyToken middleware to all routes
        this.router.get("/get", this.authMiddleware.verifyToken, this.cartController.getCart);
        this.router.get("/user/:userId", this.authMiddleware.verifyToken, this.cartController.getCartbyId);
        this.router.post("/add", this.authMiddleware.verifyToken, this.cartController.addToCart);
        this.router.put("/updatecart", this.authMiddleware.verifyToken, this.cartController.updateCart);
        this.router.delete("/remove/:cartItemId", this.authMiddleware.verifyToken, this.cartController.removeFromCart);
    };
    CartRouter.prototype.getRouter = function () {
        return this.router;
    };
    return CartRouter;
}());
exports.CartRouter = CartRouter;
