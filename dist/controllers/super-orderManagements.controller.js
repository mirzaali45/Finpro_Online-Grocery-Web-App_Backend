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
exports.SuperordermanagementsController = void 0;
const client_1 = require("../../prisma/generated/client");
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
class SuperordermanagementsController {
    getOrdersSpr(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { status, user_id, store_id, date, order_id, // Pastikan order_id ada di sini
                page = 1, pageSize = 20, } = req.query;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Ambil user_id dari authenticated token
                if (!userId) {
                    res.status(400).json({ msg: "User is not authenticated" });
                    return;
                }
                // Cek apakah pengguna adalah Super Admin dan ambil store_id mereka
                const user = yield prisma.user.findUnique({
                    where: {
                        user_id: userId,
                        role: "super_admin", // Pastikan user memiliki role store_admin
                    },
                });
                // Jika pengguna bukan store_admin atau tidak memiliki data store terkait
                if (!user) {
                    res.status(403).json({ message: "Unauthorized access" });
                    return;
                }
                const where = {};
                // Filter by order_status
                if (status &&
                    Object.values(client_1.OrderStatus).includes(status)) {
                    where.order_status = status;
                }
                // Filter by user_id
                if (user_id) {
                    where.user_id = Number(user_id); // Pastikan user_id diubah menjadi number
                }
                // Filter by store_id
                if (store_id) {
                    where.store_id = Number(store_id); // Pastikan store_id diubah menjadi number
                }
                // Filter by order_id
                if (order_id) {
                    where.order_id = Number(order_id); // Pastikan order_id diubah menjadi number
                }
                // Filter by date (created_at)
                if (date) {
                    const startDate = new Date(date);
                    if (!isNaN(startDate.getTime())) {
                        const endDate = new Date(startDate);
                        endDate.setDate(endDate.getDate() + 1); // Pastikan hanya satu hari yang tercakup
                        where.created_at = {
                            gte: startDate, // Pesanan yang lebih besar atau sama dengan tanggal mulai
                            lt: endDate, // Pesanan yang lebih kecil dari tanggal akhir
                        };
                    }
                }
                // Pagination
                const skip = (Number(page) - 1) * Number(pageSize);
                const take = Number(pageSize);
                // Query orders with pagination and filters
                const orders = yield prisma.order.findMany({
                    where,
                    include: {
                        user: true, // Include user details
                        store: true, // Include store details
                        OrderItem: true, // Include order items
                        Shipping: true, // Include shipping details
                    },
                    orderBy: { created_at: "desc" },
                    skip,
                    take,
                });
                res.status(200).json({
                    data: orders,
                    page: Number(page),
                    pageSize: Number(pageSize),
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
    updateShippingStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { order_id } = req.body; // order_id yang diberikan oleh pengguna
                if (!order_id) {
                    res.status(400).json({ message: "Order ID is required" });
                    return;
                }
                // Cari pesanan berdasarkan order_id
                const order = yield prisma.order.findUnique({
                    where: { order_id: Number(order_id) },
                    include: {
                        Shipping: true, // Sertakan data shipping untuk memastikan status pengiriman
                        OrderItem: true, // Sertakan data item pesanan untuk mengelola stok
                    },
                });
                if (!order) {
                    res.status(404).json({ message: "Order not found" });
                    return;
                }
                // Pastikan status order adalah 'completed' dan status pengiriman 'pending'
                if (!(order.order_status === "completed" || order.order_status === "shipped")) {
                    res.status(400).json({
                        message: "Order must be in 'completed' or 'shipped' status to update shipping",
                    });
                    return;
                }
                if (((_a = order.Shipping[0]) === null || _a === void 0 ? void 0 : _a.shipping_status) !== "pending") {
                    res
                        .status(400)
                        .json({ message: "Shipping must be 'pending' to mark as shipped" });
                    return;
                }
                // Update shipping status to 'shipped'
                yield prisma.shipping.update({
                    where: { shipping_id: order.Shipping[0].shipping_id },
                    data: {
                        shipping_status: "shipped",
                        updated_at: new Date(),
                    },
                });
                res.status(200).json({ message: "Shipping status updated to 'shipped'" });
                return;
            }
            catch (error) {
                console.error("Error updating shipping status:", error);
                res.status(500).json({ message: "Failed to update shipping status" });
                return;
            }
        });
    }
    cancelOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { order_id } = req.body; // order_id yang diberikan oleh pengguna
                if (!order_id) {
                    res.status(400).json({ message: "Order ID is required" });
                    return;
                }
                // Cari pesanan berdasarkan order_id
                const order = yield prisma.order.findUnique({
                    where: { order_id: Number(order_id) },
                    include: {
                        Shipping: true, // Sertakan data shipping untuk memastikan status pengiriman
                        OrderItem: true, // Sertakan data item pesanan untuk mengelola stok
                    },
                });
                if (!order) {
                    res.status(404).json({ message: "Order not found" });
                    return;
                }
                // Pastikan status order adalah 'completed' dan status pengiriman 'pending'
                if (!(order.order_status === "completed" || order.order_status === "shipped")) {
                    res
                        .status(400)
                        .json({ message: "Order must be in 'completed' status to cancel" });
                    return;
                }
                if (((_a = order.Shipping[0]) === null || _a === void 0 ? void 0 : _a.shipping_status) !== "pending") {
                    res
                        .status(400)
                        .json({ message: "Shipping must be 'pending' to cancel the order" });
                    return;
                }
                // Update order status to 'cancelled'
                yield prisma.order.update({
                    where: { order_id: order.order_id },
                    data: {
                        order_status: "cancelled",
                        updated_at: new Date(),
                    },
                });
                // Update the stock for each OrderItem (reverting the quantity) in the Inventory table
                for (const item of order.OrderItem) {
                    // Update the inventory by incrementing the stock
                    yield prisma.inventory.updateMany({
                        where: {
                            store_id: order.store_id, // Ensure inventory is updated for the correct store
                            product_id: item.product_id, // Find the inventory for the correct product
                        },
                        data: {
                            qty: {
                                increment: item.qty, // Add back the quantity to inventory
                            },
                        },
                    });
                }
                res.status(200).json({ message: "Order cancelled and stock reverted" });
                return;
            }
            catch (error) {
                console.error("Error cancelling order:", error);
                res.status(500).json({ message: "Failed to cancel order" });
                return;
            }
        });
    }
}
exports.SuperordermanagementsController = SuperordermanagementsController;
