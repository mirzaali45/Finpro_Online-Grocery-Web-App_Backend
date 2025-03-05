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
var client_1 = require("../../prisma/generated/client");
var midtrans_client_1 = __importDefault(require("midtrans-client"));
var prisma = new client_1.PrismaClient();
// Konfigurasi Midtrans Client
var midtrans = new midtrans_client_1.default.CoreApi({
    isProduction: false, // Ganti ke true jika sudah siap produksi
    serverKey: "".concat(process.env.MIDTRANS_SERVER_KEY), // Ganti dengan server key Midtrans Anda
    clientKey: "".concat(process.env.MIDTRANS_CLIENT_KEY), // Ganti dengan client key Midtrans Anda
});
// Controller untuk membuat order pembayaran
var PaymentsController = /** @class */ (function () {
    function PaymentsController() {
    }
    PaymentsController.prototype.createPaymentOrder = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, orderId, totalPrice, userId, storeId, order, parameter, chargeResponse, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.body, orderId = _a.orderId, totalPrice = _a.totalPrice, userId = _a.userId, storeId = _a.storeId;
                        // Validasi data yang diterima
                        if (!orderId || !totalPrice || !userId || !storeId) {
                            console.error("Missing required fields:", {
                                orderId: orderId,
                                totalPrice: totalPrice,
                                userId: userId,
                                storeId: storeId,
                            });
                            res.status(400).json({
                                status: "error",
                                message: "Missing required fields: orderId, totalPrice, userId, or storeId",
                            });
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, prisma.order.create({
                                data: {
                                    user_id: userId,
                                    store_id: storeId, // Menambahkan store_id yang dibutuhkan
                                    total_price: totalPrice,
                                    order_status: "awaiting_payment", // Status menunggu pembayaran
                                },
                            })];
                    case 2:
                        order = _b.sent();
                        parameter = {
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
                        return [4 /*yield*/, midtrans.transaction.create(parameter)];
                    case 3:
                        chargeResponse = _b.sent();
                        console.log("Midtrans chargeResponse:", chargeResponse);
                        // Mengirim URL pembayaran ke client
                        res.status(200).json({
                            status: "success",
                            redirect_url: chargeResponse.redirect_url, // URL untuk redirect ke Midtrans
                            orderId: orderId,
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        console.error("Error creating payment order:", error_1);
                        res
                            .status(500)
                            .json({ status: "error", message: "Failed to create payment order" });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Controller untuk menangani callback dari Midtrans
    PaymentsController.prototype.paymentCallback = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var status, orderId, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        status = req.body.transaction_status;
                        orderId = req.body.order_id;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!(status === "capture" || status === "settlement")) return [3 /*break*/, 3];
                        return [4 /*yield*/, prisma.order.update({
                                where: { order_id: orderId },
                                data: { order_status: "processing" },
                            })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(status === "expire" || status === "cancel")) return [3 /*break*/, 5];
                        return [4 /*yield*/, prisma.order.update({
                                where: { order_id: orderId },
                                data: { order_status: "cancelled" },
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        res.status(200).send("Payment status updated");
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _a.sent();
                        console.error(error_2);
                        res.status(500).send("Failed to process callback");
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // Controller untuk membatalkan order otomatis setelah 1 jam jika belum dibayar
    PaymentsController.prototype.autoCancelExpiredOrders = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, hourAgo, expiredOrders, _i, expiredOrders_1, order, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        now = new Date();
                        hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, prisma.order.findMany({
                                where: {
                                    order_status: "awaiting_payment",
                                    created_at: { lt: hourAgo },
                                },
                            })];
                    case 2:
                        expiredOrders = _a.sent();
                        _i = 0, expiredOrders_1 = expiredOrders;
                        _a.label = 3;
                    case 3:
                        if (!(_i < expiredOrders_1.length)) return [3 /*break*/, 6];
                        order = expiredOrders_1[_i];
                        return [4 /*yield*/, prisma.order.update({
                                where: { order_id: order.order_id },
                                data: { order_status: "cancelled" },
                            })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        console.log("Expired orders canceled: ".concat(expiredOrders.length));
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _a.sent();
                        console.error(error_3);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return PaymentsController;
}());
exports.PaymentsController = PaymentsController;
// Menjadwalkan autoCancelExpiredOrders untuk dijalankan setiap 1 menit
setInterval(function () {
    var controller = new PaymentsController();
    controller.autoCancelExpiredOrders();
}, 60000); // Run setiap 1 menit
