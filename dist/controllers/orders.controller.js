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
exports.OrdersController = void 0;
const client_1 = require("../../prisma/generated/client");
const models_1 = require("../utils/models");
const prisma = new client_1.PrismaClient();
class OrdersController {
    /**
     * POST /orders
     * Membuat pesanan baru setelah cek stok global dan memilih store terdekat
     */
    createOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { user_id, products, address_id } = req.body;
                // Pastikan user sudah login dan terdaftar
                const user = yield prisma.user.findUnique({
                    where: { user_id: Number(user_id) },
                });
                if (!user) {
                    res
                        .status(401)
                        .json({ error: "User tidak ditemukan / tidak terautentikasi." });
                    return;
                }
                // Pastikan alamat ada di DB
                const address = yield prisma.address.findUnique({
                    where: { address_id: Number(address_id) },
                });
                if (!address) {
                    res.status(404).json({ error: "Alamat tidak ditemukan." });
                    return;
                }
                let total_price = 0;
                // 1. Cek stok global untuk setiap produk
                for (const item of products) {
                    yield (0, models_1.checkProductAvailability)(item.product_id, item.quantity);
                    const productData = yield prisma.product.findUnique({
                        where: { product_id: item.product_id },
                    });
                    if (!productData) {
                        throw new Error(`Produk ID ${item.product_id} tidak ditemukan.`);
                    }
                    total_price += productData.price * item.quantity;
                }
                // 2. Cari store terdekat berdasarkan alamat
                const stores = yield prisma.store.findMany();
                let closestStore = null;
                let minDistance = Number.MAX_VALUE;
                for (const store of stores) {
                    const distance = (0, models_1.calculateDistance)(address.latitude, address.longitude, store.latitude, store.longitude);
                    if (distance < minDistance) {
                        minDistance = distance;
                        closestStore = store;
                    }
                }
                if (!closestStore) {
                    res.status(400).json({ error: "Tidak ada store terdekat ditemukan." });
                    return;
                }
                // 3. Buat order baru dengan status awaiting_payment
                const newOrder = yield prisma.order.create({
                    data: {
                        user_id: Number(user_id),
                        store_id: closestStore.store_id,
                        total_price,
                        order_status: client_1.OrderStatus.awaiting_payment,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                });
                // 4. Buat OrderItem untuk setiap produk
                for (const item of products) {
                    const productData = yield prisma.product.findUnique({
                        where: { product_id: item.product_id },
                    });
                    yield prisma.orderItem.create({
                        data: {
                            order_id: newOrder.order_id,
                            product_id: item.product_id,
                            qty: item.quantity,
                            price: productData.price,
                            total_price: productData.price * item.quantity,
                        },
                    });
                }
                res.status(201).json({
                    message: "Order berhasil dibuat.",
                    data: newOrder,
                });
                return;
            }
            catch (error) {
                console.error("createOrder error:", error);
                res.status(400).json({ error: error.message });
                return;
            }
        });
    }
    getOrders(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { status, user_id, store_id, date } = req.query;
                // Buat objek "where" sesuai tipe Prisma.OrderWhereInput
                const where = {};
                // Filter by order_status
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
                // Dapatkan data order + relasi
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
}
exports.OrdersController = OrdersController;
