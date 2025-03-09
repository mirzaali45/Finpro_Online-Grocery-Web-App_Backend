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
exports.StoreordermanagementsController = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
class StoreordermanagementsController {
    getOrdersStr(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { status, user_id, store_id, date, order_id, page = 1, pageSize = 20, } = req.query;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Ambil user_id dari authenticated token
                if (!userId) {
                    res.status(400).json({ msg: "User is not authenticated" });
                    return;
                }
                // Cek apakah pengguna adalah Store Admin dan ambil store_id mereka
                const user = yield prisma.user.findUnique({
                    where: {
                        user_id: userId,
                        role: "store_admin", // Pastikan user memiliki role store_admin
                    },
                    include: {
                        Store: true, // Sertakan data store terkait
                    },
                });
                // Jika pengguna bukan store_admin atau tidak memiliki data store terkait
                if (!user || !user.Store) {
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
                // Filter by store_id: only allow store admins to view orders of their store
                if (store_id) {
                    // Verifikasi store_id yang diterima sesuai dengan store_id yang dimiliki oleh Store Admin
                    if (user.Store.store_id !== Number(store_id)) {
                        res
                            .status(403)
                            .json({ message: "Unauthorized to view orders of this store" });
                        return;
                    }
                    where.store_id = Number(store_id); // Filter berdasarkan store_id yang dimiliki oleh Store Admin
                }
                else {
                    // Jika store_id tidak disertakan, maka hanya tampilkan pesanan untuk store yang dimiliki oleh Store Admin
                    where.store_id = user.Store.store_id;
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
                        user: true,
                        store: true,
                        OrderItem: true,
                        Shipping: true,
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
}
exports.StoreordermanagementsController = StoreordermanagementsController;
