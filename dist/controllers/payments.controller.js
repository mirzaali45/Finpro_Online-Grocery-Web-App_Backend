"use strict";
// import { Request, Response } from "express";
// import { PrismaClient, OrderStatus } from "../../prisma/generated/client";
// import { snap } from "../utils/midtrans"; // Impor snap dari config
// import { responseError } from "../helpers/responseError"; // Use your custom responseError
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
// const prisma = new PrismaClient();
// export class PaymentsController {
//   async createSnapToken(req: Request, res: Response): Promise<void> {
//     try {
//       const { order_id } = req.body;
//       const order = await prisma.order.findUnique({
//         where: { order_id: Number(order_id) },
//         include: {
//           OrderItem: {
//             include: {
//               product: true, // Mengambil relasi product untuk setiap OrderItem
//             },
//           },
//           user: true, // Mengambil data user yang terkait
//         },
//       });
//       if (!order) {
//         responseError(res, "Order tidak ditemukan");
//         return;
//       }
//       const transactionDetails = {
//         order_id: `order-${order.order_id}`,
//         gross_amount: order.total_price,
//       };
//       const customerDetails = {
//         first_name: order.user?.first_name || "NoName",
//         email: order.user?.email || "noemail@example.com",
//         phone: order.user?.phone || "000000000",
//       };
//       const itemDetails = order.OrderItem.map((item) => ({
//         id: `product-${item.product_id}`,
//         price: item.price,
//         quantity: item.qty,
//         name: item.product.name,
//       }));
//       const parameters = {
//         transaction_details: transactionDetails,
//         item_details: itemDetails,
//         customer_details: customerDetails,
//       };
//       const transaction = await snap.createTransaction(parameters);
//       res.status(200).json({
//         token: transaction.token,
//         redirect_url: transaction.redirect_url,
//       });
//     } catch (error: any) {
//       console.error("createSnapToken error:", error);
//       responseError(res, error.message); // Using the responseError with only two arguments
//       return;
//     }
//   }
//   async midtransNotification(req: Request, res: Response): Promise<void> {
//     try {
//       const notification = req.body;
//       if (!notification.order_id) {
//         responseError(res, "No order_id in payload.");
//         return;
//       }
//       const orderIdFromMidtrans = notification.order_id;
//       const orderId = orderIdFromMidtrans.includes("-")
//         ? Number(orderIdFromMidtrans.split("-")[1])
//         : Number(orderIdFromMidtrans);
//       const order = await prisma.order.findUnique({
//         where: { order_id: orderId },
//       });
//       if (!order) {
//         responseError(res, "Order not found.");
//         return;
//       }
//       const transactionStatus = notification.transaction_status;
//       const fraudStatus = notification.fraud_status;
//       let newStatus: OrderStatus | undefined;
//       if (transactionStatus === "capture") {
//         if (fraudStatus === "challenge") {
//           newStatus = OrderStatus.awaiting_payment;
//         } else if (fraudStatus === "accept") {
//           newStatus = OrderStatus.processing;
//         }
//       } else if (transactionStatus === "settlement") {
//         newStatus = OrderStatus.processing;
//       } else if (
//         transactionStatus === "cancel" ||
//         transactionStatus === "deny" ||
//         transactionStatus === "expire"
//       ) {
//         newStatus = OrderStatus.cancelled;
//       } else if (transactionStatus === "pending") {
//         newStatus = OrderStatus.awaiting_payment;
//       }
//       if (newStatus && newStatus !== order.order_status) {
//         await prisma.order.update({
//           where: { order_id: orderId },
//           data: { order_status: newStatus },
//         });
//       }
//       res.status(200).json({ message: "Notification received successfully" });
//     } catch (error: any) {
//       console.error("midtransNotification error:", error);
//       responseError(res, error.message); // Using the responseError with only two arguments
//       return;
//     }
//   }
// }
const client_1 = require("../../prisma/generated/client");
const midtrans_client_1 = __importDefault(require("midtrans-client"));
const prisma = new client_1.PrismaClient();
// Konfigurasi Midtrans Client
const midtrans = new midtrans_client_1.default.CoreApi({
    isProduction: false, // Ganti ke true jika sudah siap produksi
    serverKey: `${process.env.MIDTRANS_SERVER_KEY}`, // Ganti dengan server key Midtrans Anda
    clientKey: `${process.env.MIDTRANS_CLIENT_KEY}`, // Ganti dengan client key Midtrans Anda
});
// Controller untuk membuat order pembayaran
class PaymentsController {
    createPaymentOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { orderId, totalPrice, userId, storeId } = req.body;
            // Validasi data yang diterima
            if (!orderId || !totalPrice || !userId || !storeId) {
                console.error("Missing required fields:", {
                    orderId,
                    totalPrice,
                    userId,
                    storeId,
                });
                res.status(400).json({
                    status: "error",
                    message: "Missing required fields: orderId, totalPrice, userId, or storeId",
                });
                return;
            }
            try {
                // Membuat order di database (status pending payment)
                const order = yield prisma.order.create({
                    data: {
                        user_id: userId,
                        store_id: storeId, // Menambahkan store_id yang dibutuhkan
                        total_price: totalPrice,
                        order_status: "awaiting_payment", // Status menunggu pembayaran
                    },
                });
                // Membuat transaksi pembayaran menggunakan Midtrans API
                const parameter = {
                    payment_type: "gopay", // Ganti dengan metode pembayaran yang diinginkan
                    gopay: {
                        enable_callback: true,
                        callback_url: "https://your-website.com/payment/callback", // Ganti dengan URL callback Anda
                    },
                    transaction_details: {
                        order_id: orderId,
                        gross_amount: totalPrice,
                    },
                    customer_details: {
                        first_name: "John",
                        last_name: "Doe",
                        email: "johndoe@mail.com",
                        phone: "+628123456789",
                    },
                };
                const chargeResponse = yield midtrans.transaction.create(parameter); // Metode create yang benar
                console.log("Midtrans chargeResponse:", chargeResponse);
                // Mengirim URL pembayaran ke client
                res.status(200).json({
                    status: "success",
                    redirect_url: chargeResponse.redirect_url, // URL untuk redirect ke Midtrans
                    orderId: orderId,
                });
            }
            catch (error) {
                console.error("Error creating payment order:", error);
                res
                    .status(500)
                    .json({ status: "error", message: "Failed to create payment order" });
            }
        });
    }
    // Controller untuk menangani callback dari Midtrans
    paymentCallback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const status = req.body.transaction_status;
            const orderId = req.body.order_id;
            try {
                // Update status order berdasarkan hasil transaksi
                if (status === "capture" || status === "settlement") {
                    yield prisma.order.update({
                        where: { order_id: orderId },
                        data: { order_status: "processing" },
                    });
                }
                else if (status === "expire" || status === "cancel") {
                    yield prisma.order.update({
                        where: { order_id: orderId },
                        data: { order_status: "cancelled" },
                    });
                }
                res.status(200).send("Payment status updated");
            }
            catch (error) {
                console.error(error);
                res.status(500).send("Failed to process callback");
            }
        });
    }
    // Controller untuk membatalkan order otomatis setelah 1 jam jika belum dibayar
    autoCancelExpiredOrders() {
        return __awaiter(this, void 0, void 0, function* () {
            const now = new Date();
            const hourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 jam yang lalu
            try {
                // Mencari order yang belum dibayar dan lebih dari 1 jam
                const expiredOrders = yield prisma.order.findMany({
                    where: {
                        order_status: "awaiting_payment",
                        created_at: { lt: hourAgo },
                    },
                });
                // Membatalkan order yang sudah expired
                for (const order of expiredOrders) {
                    yield prisma.order.update({
                        where: { order_id: order.order_id },
                        data: { order_status: "cancelled" },
                    });
                }
                console.log(`Expired orders canceled: ${expiredOrders.length}`);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
}
exports.PaymentsController = PaymentsController;
// Menjadwalkan autoCancelExpiredOrders untuk dijalankan setiap 1 menit
setInterval(() => {
    const controller = new PaymentsController();
    controller.autoCancelExpiredOrders();
}, 60000); // Run setiap 1 menit
