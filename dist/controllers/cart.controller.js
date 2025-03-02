"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
class CartController {
    getCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cartItems = yield prisma.cartItem.findMany({
                    include: {
                        product: {
                            include: {
                                ProductImage: true,
                            },
                        },
                    },
                });
                const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                const totalPrice = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
                res.json({
                    items: cartItems,
                    summary: {
                        totalItems: cartItems.length,
                        totalQuantity,
                        totalPrice,
                    },
                });
            }
            catch (error) {
                res.status(500).json({ error: "Failed to fetch cart" });
            }
        });
    }
    getCartbyId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = parseInt(req.params.userId);
                if (isNaN(userId)) {
                    res.status(400).json({ message: "Invalid User ID provided" });
                    return;
                }
                const cartItems = yield prisma.cartItem.findMany({
                    where: { user_id: userId },
                    include: {
                        product: {
                            include: {
                                ProductImage: true,
                                Discount: true, // Include discount information
                            },
                        },
                    },
                });
                if (!cartItems) {
                    res.status(400).json({ message: "Cart is empty!" });
                    return;
                }
                const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                const totalPrice = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
                res.status(200).json({
                    data: {
                        items: cartItems,
                        summary: {
                            totalItems: cartItems.length,
                            totalQuantity,
                            totalPrice,
                        },
                    },
                });
            }
            catch (error) {
                res.status(500).json({
                    message: "Failed to fetch cart items",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    addToCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { productId, userId, quantity = 1 } = req.body;
                if (!productId || !userId) {
                    res
                        .status(400)
                        .json({ message: "Product ID and User ID are required" });
                    return;
                }
                const product = yield prisma.product.findUnique({
                    where: { product_id: productId },
                });
                if (!product) {
                    res.status(404).json({ message: "Product not found" });
                    return;
                }
                const existingCartItem = yield prisma.cartItem.findFirst({
                    where: { user_id: userId, product_id: productId },
                });
                if (existingCartItem) {
                    const updatedCart = yield prisma.cartItem.update({
                        where: { cartitem_id: existingCartItem.cartitem_id },
                        data: { quantity: existingCartItem.quantity + quantity },
                    });
                    res.status(200).json(updatedCart);
                    return;
                }
                const newCartItem = yield prisma.cartItem.create({
                    data: {
                        user_id: userId,
                        product_id: productId,
                        quantity,
                    },
                });
                res.status(201).json(newCartItem);
            }
            catch (error) {
                res.status(500).json({ message: "Internal Server Error", error });
            }
        });
    }
    updateCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cartItemId, quantity } = req.body;
                const updatedCartItem = yield prisma.cartItem.update({
                    where: { cartitem_id: cartItemId },
                    data: { quantity },
                    include: {
                        product: true,
                    },
                });
                res.status(200).json(updatedCartItem);
            }
            catch (error) {
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
    removeFromCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cartItemId } = req.params;
                yield prisma.cartItem.delete({
                    where: { cartitem_id: Number(cartItemId) },
                });
                res.status(200).json({ message: "Item removed from cart" });
            }
            catch (error) {
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
}
exports.CartController = CartController;
