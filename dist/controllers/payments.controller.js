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
exports.PaymentsController = void 0;
const client_1 = require("@prisma/client");
const midtrans_1 = require("../utils/midtrans"); // Impor snap dari config
const prisma = new client_1.PrismaClient();
class PaymentsController {
    /**
     * Membuat Snap Token untuk pembayaran Midtrans
     */
    createSnapToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const { order_id } = req.body;
                // Cari order berdasarkan order_id
                const order = yield prisma.order.findUnique({
                    where: { order_id: Number(order_id) },
                    include: {
                        OrderItem: {
                            include: {
                                product: true, // Mengambil relasi product untuk setiap OrderItem
                            },
                        },
                        user: true, // Mengambil data user yang terkait
                    },
                });
                if (!order) {
                    res.status(404).json({ error: "Order tidak ditemukan" });
                    return;
                }
                // Menyusun parameter untuk Midtrans
                const transactionDetails = {
                    order_id: `order-${order.order_id}`, // Tambahkan prefix "order-" agar unik
                    gross_amount: order.total_price, // Total harga yang harus dibayar
                };
                const customerDetails = {
                    first_name: ((_a = order.user) === null || _a === void 0 ? void 0 : _a.first_name) || "NoName",
                    email: ((_b = order.user) === null || _b === void 0 ? void 0 : _b.email) || "noemail@example.com",
                    phone: ((_c = order.user) === null || _c === void 0 ? void 0 : _c.phone) || "000000000",
                };
                const itemDetails = order.OrderItem.map((item) => ({
                    id: `product-${item.product_id}`,
                    price: item.price,
                    quantity: item.qty,
                    name: item.product.name, // Mengakses nama produk dari relasi OrderItem -> Product
                }));
                const parameters = {
                    transaction_details: transactionDetails,
                    item_details: itemDetails,
                    customer_details: customerDetails,
                };
                // Buat transaksi Snap Midtrans
                const transaction = yield midtrans_1.snap.createTransaction(parameters);
                // Kembalikan Snap Token dan redirect URL ke client
                res.status(200).json({
                    token: transaction.token,
                    redirect_url: transaction.redirect_url, // Link untuk melakukan pembayaran
                });
                return;
            }
            catch (error) {
                console.error("createSnapToken error:", error);
                res.status(500).json({ error: error.message });
                return;
            }
        });
    }
    /**
     * Menangani notifikasi pembayaran dari Midtrans
     */
    midtransNotification(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const notification = req.body;
                if (!notification.order_id) {
                    res.status(400).json({ error: "No order_id in payload." });
                    return;
                }
                const orderIdFromMidtrans = notification.order_id;
                const orderId = orderIdFromMidtrans.includes("-")
                    ? Number(orderIdFromMidtrans.split("-")[1])
                    : Number(orderIdFromMidtrans);
                // Cari order yang terkait
                const order = yield prisma.order.findUnique({
                    where: { order_id: orderId },
                });
                if (!order) {
                    res.status(404).json({ error: "Order not found." });
                    return;
                }
                const transactionStatus = notification.transaction_status; // capture, settlement, cancel, etc.
                const fraudStatus = notification.fraud_status; // accept, deny, challenge
                let newStatus;
                // Proses sesuai status transaksi dari Midtrans
                if (transactionStatus === "capture") {
                    if (fraudStatus === "challenge") {
                        newStatus = client_1.OrderStatus.awaiting_payment;
                    }
                    else if (fraudStatus === "accept") {
                        newStatus = client_1.OrderStatus.processing;
                    }
                }
                else if (transactionStatus === "settlement") {
                    newStatus = client_1.OrderStatus.processing;
                }
                else if (transactionStatus === "cancel" ||
                    transactionStatus === "deny" ||
                    transactionStatus === "expire") {
                    newStatus = client_1.OrderStatus.cancelled;
                }
                else if (transactionStatus === "pending") {
                    newStatus = client_1.OrderStatus.awaiting_payment;
                }
                if (newStatus && newStatus !== order.order_status) {
                    yield prisma.order.update({
                        where: { order_id: orderId },
                        data: { order_status: newStatus },
                    });
                }
                res.status(200).json({ message: "Notification received successfully" });
                return;
            }
            catch (error) {
                console.error("midtransNotification error:", error);
                res.status(500).json({ error: error.message });
                return;
            }
        });
    }
}
exports.PaymentsController = PaymentsController;
