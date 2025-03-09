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
exports.ordersController = exports.OrdersController = void 0;
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
class OrdersController {
    getOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, user_id, store_id, date } = req.query;
                const where = {};
                if (status &&
                    Object.values(client_1.OrderStatus).includes(status)) {
                    where.order_status = status;
                }
                // Filter by user_id
                if (user_id) {
                    where.user_id = Number(user_id);
                }
                // Filter by store_id
                if (store_id) {
                    where.store_id = Number(store_id);
                }
                // Filter by date (created_at)
                if (date) {
                    const startDate = new Date(date);
                    if (!isNaN(startDate.getTime())) {
                        const endDate = new Date(startDate);
                        endDate.setDate(endDate.getDate() + 1);
                        where.created_at = {
                            gte: startDate,
                            lt: endDate,
                        };
                    }
                }
                const orders = yield prisma.order.findMany({
                    where,
                    include: {
                        user: true,
                        store: true,
                        // misalnya item detail:
                        OrderItem: true,
                        // shipping, dsb.:
                        Shipping: true,
                    },
                    orderBy: { created_at: "desc" },
                });
                res.status(200).json({
                    data: orders,
                });
                return;
            }
            catch (error) {
                console.error("getOrders error:", error);
                res.status(500).json({ error: error.message });
                return;
            }
        });
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
                        order_status: client_1.OrderStatus.pending,
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
                (() => __awaiter(this, void 0, void 0, function* () {
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
                            });
                            // Update inventory
                            const inventory = inventoryMap.get(item.product_id);
                            if (inventory) {
                                yield prisma.inventory.update({
                                    where: { inv_id: inventory.inv_id },
                                    data: {
                                        total_qty: inventory.total_qty - item.quantity,
                                        updated_at: new Date(),
                                    },
                                });
                            }
                        }
                        // Create shipping record
                        yield prisma.shipping.create({
                            data: {
                                order_id: newOrder.order_id,
                                shipping_cost: 0,
                                shipping_address: `${address.address}, ${address.city}, ${address.province}, ${address.postcode || ""}`,
                                shipping_status: client_1.ShippingStatus.pending,
                                created_at: new Date(),
                                updated_at: new Date(),
                            },
                        });
                        // Clear cart items in chunks to avoid timeout
                        const cartItemChunkSize = 5;
                        const userIdNum = Number(user_id);
                        // Get all cart item IDs
                        const allCartItems = yield prisma.cartItem.findMany({
                            where: { user_id: userIdNum },
                            select: { cartitem_id: true },
                        });
                        // Delete in smaller chunks
                        for (let i = 0; i < allCartItems.length; i += cartItemChunkSize) {
                            const chunk = allCartItems.slice(i, i + cartItemChunkSize);
                            const ids = chunk.map((item) => item.cartitem_id);
                            yield prisma.cartItem.deleteMany({
                                where: {
                                    cartitem_id: { in: ids },
                                },
                            });
                        }
                        console.log(`Order ${newOrder.order_id} processing completed successfully`);
                    }
                    catch (backgroundError) {
                        console.error("Background processing error:", backgroundError);
                        // Consider sending this to an error tracking service
                        // or storing in a separate errors table
                    }
                }))();
            }
            catch (error) {
                console.error("createOrderFromCart error:", error);
                (0, responseError_1.responseError)(res, error.message);
            }
        });
    }
    getMyOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { status } = req.query;
                // Validate user is authenticated
                if (!user_id) {
                    (0, responseError_1.responseError)(res, "User tidak terautentikasi.");
                    return;
                }
                // Build query conditions
                const where = {
                    user_id: Number(user_id),
                };
                // Add status filter if provided
                if (status &&
                    Object.values(client_1.OrderStatus).includes(status)) {
                    where.order_status = status;
                }
                // Get all orders for the authenticated user
                const orders = yield prisma.order.findMany({
                    where,
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
                });
                if (orders.length === 0) {
                    res.status(200).json({
                        message: "Belum ada pesanan untuk akun Anda.",
                        data: [],
                    });
                    return;
                }
                // Format the response to be more client-friendly
                const formattedOrders = orders.map((order) => {
                    // Calculate total items in the order
                    const totalItems = order.OrderItem.reduce((sum, item) => sum + item.qty, 0);
                    // Format order items with essential details
                    const items = order.OrderItem.map((item) => ({
                        product_id: item.product_id,
                        name: item.product.name,
                        price: item.price,
                        quantity: item.qty,
                        total_price: item.total_price,
                        image: item.product.ProductImage && item.product.ProductImage.length > 0
                            ? item.product.ProductImage[0].url
                            : null,
                    }));
                    return {
                        order_id: order.order_id,
                        order_date: order.created_at,
                        status: order.order_status,
                        total_price: order.total_price,
                        total_items: totalItems,
                        store: {
                            store_id: order.store.store_id,
                            store_name: order.store.store_name,
                            location: `${order.store.city}, ${order.store.province}`,
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
                return;
            }
            catch (error) {
                console.error("getMyOrders error:", error);
                (0, responseError_1.responseError)(res, error.message);
                return;
            }
        });
    }
    deleteMyOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Get user_id from authenticated token
                const user_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                // Get order_id from request parameters
                const { order_id } = req.params;
                // Validate user is authenticated
                if (!user_id) {
                    (0, responseError_1.responseError)(res, "User tidak terautentikasi.");
                    return;
                }
                // Validate order_id is provided and is a number
                if (!order_id || isNaN(Number(order_id))) {
                    (0, responseError_1.responseError)(res, "ID pesanan tidak valid.");
                    return;
                }
                // Find the order and make sure it belongs to the authenticated user
                const order = yield prisma.order.findFirst({
                    where: {
                        order_id: Number(order_id),
                        user_id: Number(user_id),
                    },
                    include: {
                        OrderItem: true,
                        Shipping: true,
                    },
                });
                // Check if order exists and belongs to the user
                if (!order) {
                    (0, responseError_1.responseError)(res, "Pesanan tidak ditemukan atau tidak memiliki akses.");
                    return;
                }
                // Check if order can be deleted (only if status is awaiting_payment)
                // Check if order can be deleted (only if status is awaiting_payment or pending)
                if (order.order_status !== client_1.OrderStatus.awaiting_payment &&
                    order.order_status !== client_1.OrderStatus.pending) {
                    (0, responseError_1.responseError)(res, "Hanya pesanan dengan status menunggu pembayaran atau tertunda yang dapat dibatalkan.");
                    return;
                }
                // Start a transaction to ensure all operations succeed or fail together
                yield prisma.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                    // Restore inventory for each product in the order
                    for (const item of order.OrderItem) {
                        const inventory = yield prisma.inventory.findFirst({
                            where: {
                                product_id: item.product_id,
                                store_id: order.store_id,
                            },
                        });
                        if (inventory) {
                            // Restore total_qty quantity
                            yield prisma.inventory.update({
                                where: { inv_id: inventory.inv_id },
                                data: {
                                    total_qty: inventory.total_qty + item.qty,
                                    updated_at: new Date(),
                                },
                            });
                            console.log(`Restored ${item.qty} units to inventory total_qty for product ${item.product_id}`);
                        }
                        else {
                            console.warn(`Cannot restore inventory for product ${item.product_id}: No inventory record found`);
                        }
                    }
                    // Delete order items
                    yield prisma.orderItem.deleteMany({
                        where: { order_id: Number(order_id) },
                    });
                    // Delete shipping record
                    yield prisma.shipping.deleteMany({
                        where: { order_id: Number(order_id) },
                    });
                    // Delete the order
                    yield prisma.order.delete({
                        where: { order_id: Number(order_id) },
                    });
                }));
                res.status(200).json({
                    message: "Pesanan berhasil dibatalkan dan dihapus.",
                    data: { order_id: Number(order_id) },
                });
                return;
            }
            catch (error) {
                console.error("deleteMyOrder error:", error);
                (0, responseError_1.responseError)(res, error.message);
                return;
            }
        });
    }
    checkExpiredOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Find orders created more than 1 hour ago that are still in awaiting_payment status
                const oneHourAgo = new Date();
                oneHourAgo.setHours(oneHourAgo.getHours() - 1);
                const expiredOrders = yield prisma.order.findMany({
                    where: {
                        order_status: client_1.OrderStatus.awaiting_payment,
                        created_at: {
                            lt: oneHourAgo,
                        },
                    },
                    include: {
                        OrderItem: true,
                    },
                });
                console.log(`Found ${expiredOrders.length} expired orders to process`);
                // Process each expired order
                const processedOrders = [];
                for (const order of expiredOrders) {
                    try {
                        yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                            // Get order items to restore inventory
                            const orderItems = order.OrderItem;
                            // Restore inventory for each item
                            for (const item of orderItems) {
                                const inventory = yield tx.inventory.findFirst({
                                    where: {
                                        product_id: item.product_id,
                                        store_id: order.store_id,
                                    },
                                });
                                if (inventory) {
                                    yield tx.inventory.update({
                                        where: { inv_id: inventory.inv_id },
                                        data: {
                                            total_qty: {
                                                increment: item.qty,
                                            },
                                            updated_at: new Date(),
                                        },
                                    });
                                    console.log(`Restored ${item.qty} units to inventory for product ${item.product_id}`);
                                }
                            }
                            // Update order status to cancelled
                            yield tx.order.update({
                                where: { order_id: order.order_id },
                                data: {
                                    order_status: client_1.OrderStatus.cancelled,
                                    updated_at: new Date(),
                                },
                            });
                        }));
                        console.log(`Order ${order.order_id} has been cancelled due to payment timeout`);
                        processedOrders.push(order.order_id);
                    }
                    catch (orderError) {
                        console.error(`Error processing expired order ${order.order_id}:`, orderError);
                        // Continue with other orders even if one fails
                    }
                }
                res.status(200).json({
                    status: "success",
                    message: `Processed ${processedOrders.length} expired orders`,
                    data: {
                        processedCount: processedOrders.length,
                        processedOrders,
                    },
                });
            }
            catch (error) {
                console.error("Error processing expired orders:", error);
                (0, responseError_1.responseError)(res, error instanceof Error
                    ? error.message
                    : "Failed to process expired orders");
            }
        });
    }

    QueryOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { order_date, order_id } = req.query;
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Mengambil user_id dari authenticated token yang ada di req.user
            if (!userId) {
                res.status(400).json({ msg: "User not authenticated" });
                return;
            }
            try {
                const whereConditions = {
                    user_id: userId, // Filter berdasarkan user_id yang ada di token
                };
                // Filter berdasarkan order_date jika diberikan
                if (order_date) {
                    const startOfDay = new Date(order_date);
                    startOfDay.setHours(0, 0, 0, 0); // Menyaring data pada waktu 00:00:00
                    const endOfDay = new Date(startOfDay);
                    endOfDay.setDate(startOfDay.getDate() + 1); // Memastikan hanya satu hari yang tercakup
                    whereConditions.created_at = {
                        gte: startOfDay, // Pesanan yang lebih besar atau sama dengan tanggal mulai
                        lt: endOfDay, // Pesanan yang lebih kecil dari tanggal akhir
                    };
                }
                // Filter berdasarkan order_id jika diberikan
                if (order_id) {
                    whereConditions.order_id = parseInt(order_id);
                }
                // Query untuk mengambil data pesanan yang sesuai dengan filter
                const orders = yield prisma.order.findMany({
                    where: whereConditions,
                    include: {
                        user: true, // Termasuk data pengguna
                        store: true, // Termasuk data toko
                        OrderItem: true, // Termasuk data item pesanan
                        Shipping: true, // Termasuk data pengiriman
                    },
                });
                res.json({ data: orders });
                return;
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ msg: "Failed to fetch orders" });
                return;
            }
        });
    }

    updateOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("updateOrder called with params:", req.params);
                console.log("updateOrder called with body:", req.body);
                const { order_id } = req.params;
                const { total_price } = req.body;
                console.log(`Attempting to update order ${order_id} with total_price ${total_price}`);
                // Rest of your code...
                // Before update
                const order = yield prisma.order.findUnique({
                    where: { order_id: Number(order_id) },
                });
                console.log("Found order before update:", order);
                // Update operation
                try {
                    const updatedOrder = yield prisma.order.update({
                        where: { order_id: Number(order_id) },
                        data: {
                            total_price: Number(total_price),
                            updated_at: new Date(),
                        },
                    });
                    console.log("Order updated successfully:", updatedOrder);
                    // Send response
                    res.status(200).json({
                        message: "Harga pesanan berhasil diperbarui.",
                        data: {
                            order_id: updatedOrder.order_id,
                            total_price: updatedOrder.total_price,
                            updated_at: updatedOrder.updated_at,
                        },
                    });
                }
                catch (updateError) {
                    console.error("Error during Prisma update:", updateError);
                    throw updateError;
                }
            }
            catch (error) {
                console.error("updateOrder error:", error);
                (0, responseError_1.responseError)(res, error.message);
            }
        });
    }

    confirmOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const { order_id } = req.body; // order_id yang diberikan oleh pengguna
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Mengambil user_id dari authenticated token
            // Cek jika user_id tidak ada (ini berarti token tidak valid atau tidak ada)
            if (!userId) {
                res.status(403).json({ msg: "User is not authenticated" });
                return;
            }
            // Pastikan order_id adalah tipe integer
            const orderIdInt = parseInt(order_id, 10); // Mengonversi order_id menjadi integer
            // Jika order_id tidak valid, kirimkan error
            if (isNaN(orderIdInt)) {
                res.status(400).json({ msg: "Invalid order_id" });
                return;
            }
            try {
                // Mencari pesanan berdasarkan order_id dan user_id
                const order = yield prisma.order.findUnique({
                    where: { order_id: orderIdInt },
                    include: {
                        Shipping: true, // Menyertakan relasi Shipping
                    },
                });
                // Jika pesanan tidak ditemukan
                if (!order) {
                    res.status(404).json({ msg: "Order not found" });
                    return;
                }
                // Cek apakah user_id yang ada di pesanan cocok dengan user_id dari token
                if (order.user_id !== userId) {
                    res
                        .status(403)
                        .json({ msg: "You are not authorized to confirm this order" });
                    return;
                }
                // Cek apakah status order sudah 'completed'
                if (order.order_status !== "completed") {
                    res
                        .status(400)
                        .json({ msg: "Order must be completed before confirming delivery" });
                    return;
                }
                // Cek status pengiriman apakah sudah 'shipped'
                const shippingStatus = (_c = (_b = order.Shipping) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.shipping_status;
                // Jika status pengiriman tidak 'shipped'
                if (shippingStatus !== "shipped") {
                    res.status(400).json({ msg: "Order is not shipped yet" });
                    return;
                }
                // Memperbarui status pengiriman menjadi 'delivered'
                const updatedShipping = yield prisma.shipping.update({
                    where: { shipping_id: order.Shipping[0].shipping_id }, // Pastikan menggunakan shipping_id yang unik
                    data: {
                        shipping_status: "delivered", // Update status pengiriman menjadi delivered
                        updated_at: new Date(),
                    },
                });
                // Memperbarui status pesanan menjadi 'completed' setelah konfirmasi
                const updatedOrder = yield prisma.order.update({
                    where: { order_id: orderIdInt },
                    data: {
                        order_status: "completed", // Memastikan order status tetap 'completed'
                        updated_at: new Date(),
                    },
                });
                // Jika berhasil memperbarui status pesanan dan pengiriman, kirimkan pesan sukses
                res.json({
                    msg: "Order confirmed and shipping status updated to delivered",
                    order: updatedOrder,
                });
                return;
            }
            catch (error) {
                // Log error jika ada kesalahan dalam proses
                console.error("Error:", error);
                res.status(500).json({ msg: "Internal server error" });
                return;
            }
        });
    }
    autoConfirmOrder() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                // Mencari pesanan yang sudah dikirim dan belum dikonfirmasi dalam 2 hari
                const ordersToConfirm = yield prisma.order.findMany({
                    where: {
                        order_status: "shipped", // Status pesanan harus 'shipped'
                        updated_at: {
                            lt: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000), // 2x24 jam
                        },
                    },
                    include: {
                        Shipping: true, // Menyertakan relasi Shipping untuk mendapatkan shipping_status
                    },
                });
                // Memperbarui status pesanan secara otomatis untuk setiap order
                for (let order of ordersToConfirm) {
                    // Cek apakah user_id dari pesanan cocok dengan user yang seharusnya
                    const userId = order.user_id;
                    if (!userId) {
                        console.log(`Skipping order ${order.order_id}, user_id is missing.`);
                        continue;
                    }
                    // Pastikan pesanan sudah 'completed' sebelum mengonfirmasi pengiriman
                    if (order.order_status !== "completed") {
                        console.log(`Order ${order.order_id} is not completed yet.`);
                        continue;
                    }
                    // Periksa status pengiriman apakah sudah 'shipped'
                    const shippingStatus = (_b = (_a = order.Shipping) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.shipping_status;
                    if (shippingStatus !== "shipped") {
                        console.log(`Order ${order.order_id} shipping is not in shipped status.`);
                        continue;
                    }
                    // Perbarui status pengiriman menjadi 'delivered'
                    yield prisma.shipping.update({
                        where: { shipping_id: order.Shipping[0].shipping_id }, // Menggunakan shipping_id untuk update status pengiriman
                        data: {
                            shipping_status: "delivered", // Mengubah status pengiriman menjadi 'delivered'
                            updated_at: new Date(),
                        },
                    });
                    // Memperbarui status pesanan menjadi 'completed' setelah konfirmasi pengiriman
                    yield prisma.order.update({
                        where: { order_id: order.order_id },
                        data: {
                            order_status: "completed", // Status pesanan tetap 'completed'
                            updated_at: new Date(),
                        },
                    });
                    console.log(`Auto-confirmed order ${order.order_id}, shipping status updated to 'delivered'.`);
                }
                console.log(`Auto-confirmed ${ordersToConfirm.length} orders.`);
            }
            catch (error) {
                console.error("Error in auto-confirming orders:", error);
            }
        });
    }

}
exports.OrdersController = OrdersController;
exports.ordersController = new OrdersController();
