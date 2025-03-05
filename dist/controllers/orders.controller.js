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
exports.OrdersController = void 0;

const client_1 = require("../../prisma/generated/client");
const responseError_1 = require("../helpers/responseError");
let prisma = new client_1.PrismaClient();
if (process.env.NODE_ENV === "production") {
    prisma = new client_1.PrismaClient({
        log: ["query", "info", "warn", "error"],
        datasources: {
            db: {
                url: process.env.DATABASE_URL,
            },
        },
    });
}
else {
    // For development, use global instance to prevent too many connections
    if (!global.prisma) {
        global.prisma = new client_1.PrismaClient();
    }
    prisma = global.prisma;
}
var OrdersController = /** @class */ (function () {
    function OrdersController() {
    }

    createOrderFromCart(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_id } = req.body;
                console.log("Creating order from cart for user:", user_id);
                // Step 1: Quick response to prevent Vercel timeout
                // This is key - send a response early while processing continues
                const responsePromise = new Promise((resolve) => {
                    // We'll resolve this later to send the actual response
                    setTimeout(() => resolve(), 8000); // Backup resolve after 8 seconds
                });
                // Do initial validation checks synchronously
                const user = yield prisma.user.findUnique({
                    where: { user_id: Number(user_id) },
                    include: {
                        Address: {
                            where: { is_primary: true },
                            take: 1,
                        },
                    },
                });
                if (!user) {
                    (0, responseError_1.responseError)(res, "User tidak ditemukan / tidak terautentikasi.");
                    return;
                }
                if (!user.Address || user.Address.length === 0) {
                    (0, responseError_1.responseError)(res, "User tidak memiliki alamat pengiriman.");
                    return;
                }
                const address = user.Address[0];
                // Get cart items
                const cartItems = yield prisma.cartItem.findMany({
                    where: { user_id: Number(user_id) },
                    include: { product: { include: { store: true } } },
                });
                if (cartItems.length === 0) {
                    (0, responseError_1.responseError)(res, "Keranjang belanja kosong.");
                    return;
                }
                // Check if all products are from the same store
                const storeIds = new Set(cartItems.map((item) => item.product.store_id));
                if (storeIds.size > 1) {
                    (0, responseError_1.responseError)(res, "Tidak dapat membuat pesanan, produk berasal dari toko yang berbeda. Harap hanya pilih produk dari toko yang sama.");
                    return;
                }
                const storeId = cartItems[0].product.store_id;
                // Calculate total price
                const total_price = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
                // Check inventories
                const productIds = cartItems.map((item) => item.product_id);
                const inventories = yield prisma.inventory.findMany({
                    where: {
                        product_id: { in: productIds },
                        store_id: storeId,
                    },
                });
                const inventoryMap = new Map();
                inventories.forEach((inv) => inventoryMap.set(inv.product_id, inv));
                // Check inventory for each item
                for (const item of cartItems) {
                    const inventory = inventoryMap.get(item.product_id);
                    if (!inventory || inventory.total_qty < item.quantity) {
                        (0, responseError_1.responseError)(res, `Stok tidak cukup untuk produk "${item.product.name}". Tersedia: ${inventory ? inventory.total_qty : 0}, Dibutuhkan: ${item.quantity}`);
                        return;
                    }
                }
                // CRITICAL: Create order first - this is the core operation
                const newOrder = yield prisma.order.create({
                    data: {
                        user_id: Number(user_id),
                        store_id: storeId,
                        total_price,
                        order_status: client_1.OrderStatus.awaiting_payment,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                });
                // Send response immediately after order creation
                res.status(201).json({
                    message: "Order berhasil dibuat dari keranjang belanja. Pembayaran harus dilakukan dalam 1 jam.",
                    data: {
                        order_id: newOrder.order_id,
                        user_id: newOrder.user_id,
                        store_id: newOrder.store_id,
                        total_price: newOrder.total_price,
                        order_status: newOrder.order_status,
                    },
                });
                // Continue processing in the background
                // This will run even after response is sent

                Promise.resolve().then(() => __awaiter(this, void 0, void 0, function* () {
                    try {
                        // Process order items one at a time to avoid timeouts
                        for (const item of cartItems) {
                            // Create order item
                            yield prisma.orderItem.create({
                                data: {
                                    order_id: newOrder.order_id,
                                    product_id: item.product_id,
                                    qty: item.quantity,
                                    price: item.product.price,
                                    total_price: item.product.price * item.quantity,
                                },
                                orderBy: { created_at: "desc" },
                            })];
                    case 1:
                        orders = _b.sent();
                        res.status(200).json({
                            data: orders,
                        });
                        return [2 /*return*/];
                    case 2:
                        error_1 = _b.sent();
                        console.error("getOrders error:", error_1);
                        res.status(500).json({ error: error_1.message });
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OrdersController.prototype.createOrderFromCart = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user_id_1, responsePromise, user, address_1, cartItems_2, storeIds, storeId, total_price, productIds, inventories, inventoryMap_1, _i, cartItems_1, item, inventory, newOrder_1, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        user_id_1 = req.body.user_id;
                        console.log("Creating order from cart for user:", user_id_1);
                        responsePromise = new Promise(function (resolve) {
                            // We'll resolve this later to send the actual response
                            setTimeout(function () { return resolve(); }, 8000); // Backup resolve after 8 seconds
                        });
                        return [4 /*yield*/, prisma.user.findUnique({
                                where: { user_id: Number(user_id_1) },
                                include: {
                                    Address: {
                                        where: { is_primary: true },
                                        take: 1,
                                    },
                                },
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            (0, responseError_1.responseError)(res, "User tidak ditemukan / tidak terautentikasi.");
                            return [2 /*return*/];
                        }
                        if (!user.Address || user.Address.length === 0) {
                            (0, responseError_1.responseError)(res, "User tidak memiliki alamat pengiriman.");
                            return [2 /*return*/];
                        }
                        address_1 = user.Address[0];
                        return [4 /*yield*/, prisma.cartItem.findMany({
                                where: { user_id: Number(user_id_1) },
                                include: { product: { include: { store: true } } },
                            })];
                    case 2:
                        cartItems_2 = _a.sent();
                        if (cartItems_2.length === 0) {
                            (0, responseError_1.responseError)(res, "Keranjang belanja kosong.");
                            return [2 /*return*/];
                        }
                        storeIds = new Set(cartItems_2.map(function (item) { return item.product.store_id; }));
                        if (storeIds.size > 1) {
                            (0, responseError_1.responseError)(res, "Tidak dapat membuat pesanan, produk berasal dari toko yang berbeda. Harap hanya pilih produk dari toko yang sama.");
                            return [2 /*return*/];
                        }
                        storeId = cartItems_2[0].product.store_id;
                        total_price = cartItems_2.reduce(function (sum, item) { return sum + item.product.price * item.quantity; }, 0);
                        productIds = cartItems_2.map(function (item) { return item.product_id; });
                        return [4 /*yield*/, prisma.inventory.findMany({
                                where: {
                                    product_id: { in: productIds },
                                    store_id: storeId,
                                },
                            })];
                    case 3:
                        inventories = _a.sent();
                        inventoryMap_1 = new Map();
                        inventories.forEach(function (inv) { return inventoryMap_1.set(inv.product_id, inv); });
                        // Check inventory for each item
                        for (_i = 0, cartItems_1 = cartItems_2; _i < cartItems_1.length; _i++) {
                            item = cartItems_1[_i];
                            inventory = inventoryMap_1.get(item.product_id);
                            if (!inventory || inventory.total_qty < item.quantity) {
                                (0, responseError_1.responseError)(res, "Stok tidak cukup untuk produk \"".concat(item.product.name, "\". Tersedia: ").concat(inventory ? inventory.total_qty : 0, ", Dibutuhkan: ").concat(item.quantity));
                                return [2 /*return*/];
                            }
                        }
                        // Create shipping record
                        yield prisma.shipping.create({
                            data: {
                                order_id: newOrder_1.order_id,
                                user_id: newOrder_1.user_id,
                                store_id: newOrder_1.store_id,
                                total_price: newOrder_1.total_price,
                                order_status: newOrder_1.order_status,
                            },
                        });
                        // Continue processing in the background
                        // This will run even after response is sent
                        (function () { return __awaiter(_this, void 0, void 0, function () {
                            var _i, cartItems_3, item, inventory, cartItemChunkSize, userIdNum, allCartItems, i, chunk, ids, backgroundError_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 12, , 13]);
                                        _i = 0, cartItems_3 = cartItems_2;
                                        _a.label = 1;
                                    case 1:
                                        if (!(_i < cartItems_3.length)) return [3 /*break*/, 5];
                                        item = cartItems_3[_i];
                                        // Create order item
                                        return [4 /*yield*/, prisma.orderItem.create({
                                                data: {
                                                    order_id: newOrder_1.order_id,
                                                    product_id: item.product_id,
                                                    qty: item.quantity,
                                                    price: item.product.price,
                                                    total_price: item.product.price * item.quantity,
                                                },
                                            })];
                                    case 2:
                                        // Create order item
                                        _a.sent();
                                        inventory = inventoryMap_1.get(item.product_id);
                                        if (!inventory) return [3 /*break*/, 4];
                                        return [4 /*yield*/, prisma.inventory.update({
                                                where: { inv_id: inventory.inv_id },
                                                data: {
                                                    total_qty: inventory.total_qty - item.quantity,
                                                    updated_at: new Date(),
                                                },
                                            })];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 5: 
                                    // Create shipping record
                                    return [4 /*yield*/, prisma.shipping.create({
                                            data: {
                                                order_id: newOrder_1.order_id,
                                                shipping_cost: 0,
                                                shipping_address: "".concat(address_1.address, ", ").concat(address_1.city, ", ").concat(address_1.province, ", ").concat(address_1.postcode || ""),
                                                shipping_status: client_1.ShippingStatus.pending,
                                                created_at: new Date(),
                                                updated_at: new Date(),
                                            },
                                        })];
                                    case 6:
                                        // Create shipping record
                                        _a.sent();
                                        cartItemChunkSize = 5;
                                        userIdNum = Number(user_id_1);
                                        return [4 /*yield*/, prisma.cartItem.findMany({
                                                where: { user_id: userIdNum },
                                                select: { cartitem_id: true },
                                            })];
                                    case 7:
                                        allCartItems = _a.sent();
                                        i = 0;
                                        _a.label = 8;
                                    case 8:
                                        if (!(i < allCartItems.length)) return [3 /*break*/, 11];
                                        chunk = allCartItems.slice(i, i + cartItemChunkSize);
                                        ids = chunk.map(function (item) { return item.cartitem_id; });
                                        return [4 /*yield*/, prisma.cartItem.deleteMany({
                                                where: {
                                                    cartitem_id: { in: ids },
                                                },
                                            })];
                                    case 9:
                                        _a.sent();
                                        _a.label = 10;
                                    case 10:
                                        i += cartItemChunkSize;
                                        return [3 /*break*/, 8];
                                    case 11:
                                        console.log("Order ".concat(newOrder_1.order_id, " processing completed successfully"));
                                        return [3 /*break*/, 13];
                                    case 12:
                                        backgroundError_1 = _a.sent();
                                        console.error("Background processing error:", backgroundError_1);
                                        return [3 /*break*/, 13];
                                    case 13: return [2 /*return*/];
                                }
                            });

                        }
                        console.log(`Order ${newOrder.order_id} processing completed successfully`);
                    }
                    catch (backgroundError) {
                        console.error("Background processing error:", backgroundError);
                        // Consider sending this to an error tracking service
                        // or storing in a separate errors table
                    }
                }));
            }
            catch (error) {
                console.error("createOrderFromCart error:", error);
                (0, responseError_1.responseError)(res, error.message);
            }
        });
    };
    OrdersController.prototype.getMyOrders = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user_id, status_2, where, orders, formattedOrders, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        status_2 = req.query.status;
                        // Validate user is authenticated
                        if (!user_id) {
                            (0, responseError_1.responseError)(res, "User tidak terautentikasi.");
                            return [2 /*return*/];
                        }
                        where = {
                            user_id: Number(user_id),
                        };
                        // Add status filter if provided
                        if (status_2 &&
                            Object.values(client_1.OrderStatus).includes(status_2)) {
                            where.order_status = status_2;
                        }
                        return [4 /*yield*/, prisma.order.findMany({
                                where: where,
                                include: {
                                    store: {
                                        select: {
                                            store_id: true,
                                            store_name: true,
                                            address: true,
                                            city: true,
                                            province: true,

                                        },
                                    },
                                    OrderItem: {
                                        include: {
                                            product: {
                                                include: {
                                                    ProductImage: {
                                                        take: 1, // Include just the first image
                                                    },
                                                },
                                            },
                                        },
                                    },
                                    Shipping: true,
                                },
                                orderBy: { created_at: "desc" },
                            })];
                    case 1:
                        orders = _b.sent();
                        if (orders.length === 0) {
                            res.status(200).json({
                                message: "Belum ada pesanan untuk akun Anda.",
                                data: [],
                            });
                            return [2 /*return*/];
                        }
                        formattedOrders = orders.map(function (order) {
                            // Calculate total items in the order
                            var totalItems = order.OrderItem.reduce(function (sum, item) { return sum + item.qty; }, 0);
                            // Format order items with essential details
                            var items = order.OrderItem.map(function (item) { return ({
                                product_id: item.product_id,
                                name: item.product.name,
                                price: item.price,
                                quantity: item.qty,
                                total_price: item.total_price,
                                image: item.product.ProductImage && item.product.ProductImage.length > 0
                                    ? item.product.ProductImage[0].url
                                    : null,
                            }); });
                            return {
                                order_id: order.order_id,
                                order_date: order.created_at,
                                status: order.order_status,
                                total_price: order.total_price,
                                total_items: totalItems,
                                store: {
                                    store_id: order.store.store_id,
                                    store_name: order.store.store_name,
                                    location: "".concat(order.store.city, ", ").concat(order.store.province),
                                },
                                shipping: order.Shipping.length > 0
                                    ? {
                                        status: order.Shipping[0].shipping_status,
                                        address: order.Shipping[0].shipping_address,
                                        cost: order.Shipping[0].shipping_cost,
                                    }
                                    : null,
                                items: items,
                            };
                        });
                        res.status(200).json({
                            message: "Daftar pesanan berhasil dimuat.",
                            data: formattedOrders,
                        });
                        return [2 /*return*/];
                    case 2:
                        error_3 = _b.sent();
                        console.error("getMyOrders error:", error_3);
                        (0, responseError_1.responseError)(res, error_3.message);
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    OrdersController.prototype.deleteMyOrder = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user_id, order_id_1, order_1, error_4;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        order_id_1 = req.params.order_id;
                        // Validate user is authenticated
                        if (!user_id) {
                            (0, responseError_1.responseError)(res, "User tidak terautentikasi.");
                            return [2 /*return*/];
                        }
                        // Validate order_id is provided and is a number
                        if (!order_id_1 || isNaN(Number(order_id_1))) {
                            (0, responseError_1.responseError)(res, "ID pesanan tidak valid.");
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.order.findFirst({
                                where: {
                                    order_id: Number(order_id_1),
                                    user_id: Number(user_id),
                                },
                                include: {
                                    OrderItem: true,
                                    Shipping: true,
                                },
                            })];
                    case 1:
                        order_1 = _b.sent();
                        // Check if order exists and belongs to the user
                        if (!order_1) {
                            (0, responseError_1.responseError)(res, "Pesanan tidak ditemukan atau tidak memiliki akses.");
                            return [2 /*return*/];
                        }
                        // Check if order can be deleted (only if status is awaiting_payment)
                        if (order_1.order_status !== client_1.OrderStatus.awaiting_payment) {
                            (0, responseError_1.responseError)(res, "Hanya pesanan dengan status menunggu pembayaran yang dapat dibatalkan.");
                            return [2 /*return*/];
                        }
                        // Start a transaction to ensure all operations succeed or fail together
                        return [4 /*yield*/, prisma.$transaction(function (prisma) { return __awaiter(_this, void 0, void 0, function () {
                                var _i, _a, item, inventory;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _i = 0, _a = order_1.OrderItem;
                                            _b.label = 1;
                                        case 1:
                                            if (!(_i < _a.length)) return [3 /*break*/, 6];
                                            item = _a[_i];
                                            return [4 /*yield*/, prisma.inventory.findFirst({
                                                    where: {
                                                        product_id: item.product_id,
                                                        store_id: order_1.store_id,
                                                    },
                                                })];
                                        case 2:
                                            inventory = _b.sent();
                                            if (!inventory) return [3 /*break*/, 4];
                                            // Restore total_qty quantity
                                            return [4 /*yield*/, prisma.inventory.update({
                                                    where: { inv_id: inventory.inv_id },
                                                    data: {
                                                        total_qty: inventory.total_qty + item.qty,
                                                        updated_at: new Date(),
                                                    },
                                                })];
                                        case 3:
                                            // Restore total_qty quantity
                                            _b.sent();
                                            console.log("Restored ".concat(item.qty, " units to inventory total_qty for product ").concat(item.product_id));
                                            return [3 /*break*/, 5];
                                        case 4:
                                            console.warn("Cannot restore inventory for product ".concat(item.product_id, ": No inventory record found"));
                                            _b.label = 5;
                                        case 5:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 6: 
                                        // Delete order items
                                        return [4 /*yield*/, prisma.orderItem.deleteMany({
                                                where: { order_id: Number(order_id_1) },
                                            })];
                                        case 7:
                                            // Delete order items
                                            _b.sent();
                                            // Delete shipping record
                                            return [4 /*yield*/, prisma.shipping.deleteMany({
                                                    where: { order_id: Number(order_id_1) },
                                                })];
                                        case 8:
                                            // Delete shipping record
                                            _b.sent();
                                            // Delete the order
                                            return [4 /*yield*/, prisma.order.delete({
                                                    where: { order_id: Number(order_id_1) },
                                                })];
                                        case 9:
                                            // Delete the order
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        // Start a transaction to ensure all operations succeed or fail together
                        _b.sent();
                        res.status(200).json({
                            message: "Pesanan berhasil dibatalkan dan dihapus.",
                            data: { order_id: Number(order_id_1) },
                        });
                        return [2 /*return*/];
                    case 3:
                        error_4 = _b.sent();
                        console.error("deleteMyOrder error:", error_4);
                        (0, responseError_1.responseError)(res, error_4.message);
                        return [2 /*return*/];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    OrdersController.prototype.checkExpiredOrders = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var oneHourAgo, expiredOrders, processedOrders, _loop_1, _i, expiredOrders_1, order, error_5;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        oneHourAgo = new Date();
                        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
                        return [4 /*yield*/, prisma.order.findMany({
                                where: {
                                    order_status: client_1.OrderStatus.awaiting_payment,
                                    created_at: {
                                        lt: oneHourAgo,
                                    },
                                },
                                include: {
                                    OrderItem: true,
                                },
                            })];
                    case 1:
                        expiredOrders = _a.sent();
                        console.log("Found ".concat(expiredOrders.length, " expired orders to process"));
                        processedOrders = [];
                        _loop_1 = function (order) {
                            var orderError_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                                var orderItems, _i, orderItems_1, item, inventory;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            orderItems = order.OrderItem;
                                                            _i = 0, orderItems_1 = orderItems;
                                                            _a.label = 1;
                                                        case 1:
                                                            if (!(_i < orderItems_1.length)) return [3 /*break*/, 5];
                                                            item = orderItems_1[_i];
                                                            return [4 /*yield*/, tx.inventory.findFirst({
                                                                    where: {
                                                                        product_id: item.product_id,
                                                                        store_id: order.store_id,
                                                                    },
                                                                })];
                                                        case 2:
                                                            inventory = _a.sent();
                                                            if (!inventory) return [3 /*break*/, 4];
                                                            return [4 /*yield*/, tx.inventory.update({
                                                                    where: { inv_id: inventory.inv_id },
                                                                    data: {
                                                                        total_qty: {
                                                                            increment: item.qty,
                                                                        },
                                                                        updated_at: new Date(),
                                                                    },
                                                                })];
                                                        case 3:
                                                            _a.sent();
                                                            console.log("Restored ".concat(item.qty, " units to inventory for product ").concat(item.product_id));
                                                            _a.label = 4;
                                                        case 4:
                                                            _i++;
                                                            return [3 /*break*/, 1];
                                                        case 5: 
                                                        // Update order status to cancelled
                                                        return [4 /*yield*/, tx.order.update({
                                                                where: { order_id: order.order_id },
                                                                data: {
                                                                    order_status: client_1.OrderStatus.cancelled,
                                                                    updated_at: new Date(),
                                                                },
                                                            })];
                                                        case 6:
                                                            // Update order status to cancelled
                                                            _a.sent();
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 1:
                                        _b.sent();
                                        console.log("Order ".concat(order.order_id, " has been cancelled due to payment timeout"));
                                        processedOrders.push(order.order_id);
                                        return [3 /*break*/, 3];
                                    case 2:
                                        orderError_1 = _b.sent();
                                        console.error("Error processing expired order ".concat(order.order_id, ":"), orderError_1);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, expiredOrders_1 = expiredOrders;
                        _a.label = 2;
                    case 2:
                        if (!(_i < expiredOrders_1.length)) return [3 /*break*/, 5];
                        order = expiredOrders_1[_i];
                        return [5 /*yield**/, _loop_1(order)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        res.status(200).json({
                            status: "success",
                            message: "Processed ".concat(processedOrders.length, " expired orders"),
                            data: {
                                processedCount: processedOrders.length,
                                processedOrders: processedOrders,
                            },
                        });
                        return [3 /*break*/, 7];
                    case 6:
                        error_5 = _a.sent();
                        console.error("Error processing expired orders:", error_5);
                        (0, responseError_1.responseError)(res, error_5 instanceof Error
                            ? error_5.message
                            : "Failed to process expired orders");
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return OrdersController;
}());
exports.OrdersController = OrdersController;
