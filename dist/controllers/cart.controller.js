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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
var client_1 = require("../../prisma/generated/client");
var prisma = new client_1.PrismaClient();
var CartController = /** @class */ (function () {
    function CartController() {
    }
    CartController.prototype.getCart = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var cartItems, totalQuantity, totalPrice, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, prisma.cartItem.findMany({
                                include: {
                                    product: {
                                        include: {
                                            ProductImage: true,
                                        },
                                    },
                                },
                            })];
                    case 1:
                        cartItems = _a.sent();
                        totalQuantity = cartItems.reduce(function (sum, item) { return sum + item.quantity; }, 0);
                        totalPrice = cartItems.reduce(function (sum, item) { return sum + item.quantity * item.product.price; }, 0);
                        res.json({
                            items: cartItems,
                            summary: {
                                totalItems: cartItems.length,
                                totalQuantity: totalQuantity,
                                totalPrice: totalPrice,
                            },
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        res.status(500).json({ error: "Failed to fetch cart" });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CartController.prototype.getCartbyId = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, cartItems, totalQuantity, totalPrice, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        userId = parseInt(req.params.userId);
                        if (isNaN(userId)) {
                            res.status(400).json({ message: "Invalid User ID provided" });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.cartItem.findMany({
                                where: { user_id: userId },
                                include: {
                                    product: {
                                        include: {
                                            ProductImage: true,
                                            Discount: true, // Include discount information
                                        },
                                    },
                                },
                            })];
                    case 1:
                        cartItems = _a.sent();
                        if (!cartItems) {
                            res.status(400).json({ message: "Cart is empty!" });
                            return [2 /*return*/];
                        }
                        totalQuantity = cartItems.reduce(function (sum, item) { return sum + item.quantity; }, 0);
                        totalPrice = cartItems.reduce(function (sum, item) { return sum + item.quantity * item.product.price; }, 0);
                        res.status(200).json({
                            data: {
                                items: cartItems,
                                summary: {
                                    totalItems: cartItems.length,
                                    totalQuantity: totalQuantity,
                                    totalPrice: totalPrice,
                                },
                            },
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        res.status(500).json({
                            message: "Failed to fetch cart items",
                            error: error_2 instanceof Error ? error_2.message : "Unknown error",
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CartController.prototype.addToCart = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, productId, userId, _b, quantity, product, existingCartItem, updatedCart, newCartItem, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        _a = req.body, productId = _a.productId, userId = _a.userId, _b = _a.quantity, quantity = _b === void 0 ? 1 : _b;
                        if (!productId || !userId) {
                            res
                                .status(400)
                                .json({ message: "Product ID and User ID are required" });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.product.findUnique({
                                where: { product_id: productId },
                            })];
                    case 1:
                        product = _c.sent();
                        if (!product) {
                            res.status(404).json({ message: "Product not found" });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.cartItem.findFirst({
                                where: { user_id: userId, product_id: productId },
                            })];
                    case 2:
                        existingCartItem = _c.sent();
                        if (!existingCartItem) return [3 /*break*/, 4];
                        return [4 /*yield*/, prisma.cartItem.update({
                                where: { cartitem_id: existingCartItem.cartitem_id },
                                data: { quantity: existingCartItem.quantity + quantity },
                            })];
                    case 3:
                        updatedCart = _c.sent();
                        res.status(200).json(updatedCart);
                        return [2 /*return*/];
                    case 4: return [4 /*yield*/, prisma.cartItem.create({
                            data: {
                                user_id: userId,
                                product_id: productId,
                                quantity: quantity,
                            },
                        })];
                    case 5:
                        newCartItem = _c.sent();
                        res.status(201).json(newCartItem);
                        return [3 /*break*/, 7];
                    case 6:
                        error_3 = _c.sent();
                        res.status(500).json({ message: "Internal Server Error", error: error_3 });
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    CartController.prototype.updateCart = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, cartItemId, quantity, updatedCartItem, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, cartItemId = _a.cartItemId, quantity = _a.quantity;
                        return [4 /*yield*/, prisma.cartItem.update({
                                where: { cartitem_id: cartItemId },
                                data: { quantity: quantity },
                                include: {
                                    product: true,
                                },
                            })];
                    case 1:
                        updatedCartItem = _b.sent();
                        res.status(200).json(updatedCartItem);
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        res.status(500).json({ message: "Internal Server Error" });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CartController.prototype.removeFromCart = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var cartItemId, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        cartItemId = req.params.cartItemId;
                        return [4 /*yield*/, prisma.cartItem.delete({
                                where: { cartitem_id: Number(cartItemId) },
                            })];
                    case 1:
                        _a.sent();
                        res.status(200).json({ message: "Item removed from cart" });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        res.status(500).json({ message: "Internal Server Error" });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return CartController;
}());
exports.CartController = CartController;
