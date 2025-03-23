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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const midtrans_1 = __importDefault(require("../config/midtrans")); // Import configured Midtrans client
const client_1 = require("../../prisma/generated/client");
const responseError_1 = require("../helpers/responseError");
const prisma = new client_1.PrismaClient();
// Helper function to check transaction status with Midtrans API
function checkMidtransStatus(orderId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Direct API call using fetch - works with any Midtrans version
            const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
            const auth = Buffer.from(serverKey + ":").toString("base64");
            const apiUrl = process.env.NODE_ENV === "production"
                ? `https://api.midtrans.com/v2/${orderId}/status`
                : `https://api.sandbox.midtrans.com/v2/${orderId}/status`;
            const response = yield fetch(apiUrl, {
                method: "GET",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Basic ${auth}`,
                },
            });
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            return yield response.json();
        }
        catch (error) {
            console.error(`Error checking Midtrans status for order ${orderId}:`, error);
            throw error;
        }
    });
}
// Function to create Midtrans payment transaction
function createPaymentTransaction(order, updatedTotalPrice) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create the item details first
        const itemDetails = order.OrderItem.map((item) => ({
            id: item.product_id.toString(),
            price: item.price,
            quantity: item.qty,
            name: item.product.name,
        }));
        // Add shipping as an item if available
        if (order.Shipping &&
            order.Shipping.length > 0 &&
            order.Shipping[0].shipping_cost > 0) {
            itemDetails.push({
                id: `shipping-${order.order_id}`,
                price: order.Shipping[0].shipping_cost,
                quantity: 1,
                name: "Shipping Fee",
            });
        }
        // Calculate the sum of all item prices to ensure it matches gross_amount
        const itemsTotal = itemDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
        // Use the updatedTotalPrice if provided, otherwise use the calculated sum
        const finalGrossAmount = updatedTotalPrice || itemsTotal;
        // If there's a difference between updatedTotalPrice and items total,
        // add an adjustment item to make them match exactly
        const priceDifference = finalGrossAmount - itemsTotal;
        if (Math.abs(priceDifference) > 0) {
            // Add a discount item (if negative) or adjustment fee (if positive)
            const itemName = priceDifference < 0 ? "Discount" : "Additional Fee";
            itemDetails.push({
                id: `adjustment-${order.order_id}`,
                price: priceDifference,
                quantity: 1,
                name: itemName,
            });
        }
        // Create transaction details with the correct gross_amount
        const transactionDetails = {
            order_id: order.order_id.toString(),
            gross_amount: finalGrossAmount,
        };
        const customerDetails = {
            first_name: order.user.first_name || "",
            last_name: order.user.last_name || "",
            email: order.user.email,
            phone: order.user.phone || "",
        };
        // Define redirect URLs for different payment outcomes
        const frontendBaseUrl = process.env.BASE_URL_FE;
        const redirectUrl = {
            finish: `${frontendBaseUrl}/payment-success?order_id=${order.order_id}`,
            error: `${frontendBaseUrl}/payment-error?order_id=${order.order_id}`,
            pending: `${frontendBaseUrl}/payment-pending?order_id=${order.order_id}`,
        };
        try {
            console.log("Creating Midtrans transaction:", {
                orderId: order.order_id,
                grossAmount: finalGrossAmount,
                itemsTotal: itemsTotal,
                adjustment: priceDifference,
                itemCount: itemDetails.length,
                redirectUrls: redirectUrl,
            });
            const response = yield midtrans_1.default.createTransaction({
                transaction_details: transactionDetails,
                item_details: itemDetails,
                customer_details: customerDetails,
                callbacks: redirectUrl,
            });
            return response;
        }
        catch (error) {
            console.error("Error creating Midtrans payment transaction:", error);
            throw error;
        }
    });
}
// Payment Controller
class PaymentsController {
    constructor() {
        // Method to initiate a payment for an order
        // initiatePayment = async (req: Request, res: Response): Promise<void> => {
        //   try {
        //     const userId = req.user?.id || req.body.user_id;
        //     const { order_id } = req.params;
        //     console.log("Payment initiation request:", {
        //       userId,
        //       order_id,
        //       body: req.body,
        //       hasAuthHeader: !!req.headers.authorization,
        //     });
        //     if (!userId) {
        //       responseError(res, "User ID missing. Please ensure you are logged in.");
        //       return;
        //     }
        //     const orderId = parseInt(order_id, 10);
        //     if (isNaN(orderId)) {
        //       responseError(res, "Invalid Order ID format");
        //       return;
        //     }
        //     const order = await prisma.order.findUnique({
        //       where: { order_id: orderId },
        //       include: {
        //         OrderItem: {
        //           include: {
        //             product: {
        //               include: {
        //                 Discount: true,
        //               },
        //             },
        //           },
        //         },
        //         user: true,
        //         Shipping: true,
        //       },
        //     });
        //     if (!order) {
        //       responseError(res, "Order not found");
        //       return;
        //     }
        //     if (order.user_id !== Number(userId)) {
        //       responseError(
        //         res,
        //         "Unauthorized: You don't have permission to access this order"
        //       );
        //       return;
        //     }
        //     let totalPrice = order.OrderItem.reduce((sum, item) => {
        //       let price = item.product.price;
        //       if (item.product.Discount?.length) {
        //         const discount = item.product.Discount[0];
        //         if (discount.discount_type === "percentage") {
        //           price -= (price * discount.discount_value) / 100;
        //         } else if (discount.discount_type === "point") {
        //           price = Math.max(0, price - discount.discount_value);
        //         }
        //       }
        //       return sum + price * item.qty;
        //     }, 0);
        //     if (order.order_status === "pending") {
        //       await prisma.order.update({
        //         where: { order_id: orderId },
        //         data: { order_status: "awaiting_payment" },
        //       });
        //     } else if (order.order_status !== "awaiting_payment") {
        //       responseError(res, "Order is not in a valid state for payment");
        //       return;
        //     }
        //     if (req.body.voucher?.discount) {
        //       const voucher = req.body.voucher;
        //       let discountAmount =
        //         voucher.discount.discount_type === "percentage"
        //           ? (totalPrice * voucher.discount.discount_value) / 100
        //           : voucher.discount.discount_value;
        //       discountAmount = Math.min(discountAmount, totalPrice);
        //       totalPrice -= discountAmount;
        //       await prisma.order.update({
        //         where: { order_id: orderId },
        //         data: {
        //           total_price: totalPrice,
        //           updated_at: new Date(),
        //         },
        //       });
        //     }
        //     if (req.body.shipping_method && order.Shipping?.length > 0) {
        //       await prisma.shipping.update({
        //         where: { shipping_id: order.Shipping[0].shipping_id },
        //         data: {
        //           shipping_cost: req.body.shipping_method.cost,
        //           updated_at: new Date(),
        //         },
        //       });
        //       totalPrice += req.body.shipping_method.cost;
        //       await prisma.order.update({
        //         where: { order_id: orderId },
        //         data: {
        //           total_price: totalPrice,
        //           updated_at: new Date(),
        //         },
        //       });
        //     }
        //     const updatedOrder = await prisma.order.findUnique({
        //       where: { order_id: orderId },
        //       include: {
        //         OrderItem: {
        //           include: {
        //             product: {
        //               include: {
        //                 Discount: true,
        //               },
        //             },
        //           },
        //         },
        //         user: true,
        //         Shipping: true,
        //       },
        //     });
        //     if (!updatedOrder) {
        //       responseError(res, "Error fetching updated order");
        //       return;
        //     }
        //     let paymentResponse;
        //     try {
        //       paymentResponse = await createPaymentTransaction(
        //         updatedOrder,
        //         totalPrice
        //       );
        //     } catch (paymentError) {
        //       console.error("Payment transaction error:", paymentError);
        //       responseError(res, "Failed to create payment transaction");
        //       return;
        //     }
        //     res.status(200).json({
        //       success: true,
        //       message: "Payment initiation successful",
        //       payment_url: paymentResponse.redirect_url,
        //       order_id: updatedOrder.order_id,
        //     });
        //   } catch (error: any) {
        //     console.error("Error initiating payment:", error);
        //     responseError(
        //       res,
        //       error.message || "An error occurred while initiating payment"
        //     );
        //   }
        // };
        this.initiatePayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.body.user_id;
                const { order_id } = req.params;
                console.log("Payment initiation request:", {
                    userId,
                    order_id,
                    body: req.body,
                    hasAuthHeader: !!req.headers.authorization,
                });
                if (!userId) {
                    (0, responseError_1.responseError)(res, "User ID missing. Please ensure you are logged in.");
                    return;
                }
                const orderId = parseInt(order_id, 10);
                if (isNaN(orderId)) {
                    (0, responseError_1.responseError)(res, "Invalid Order ID format");
                    return;
                }
                const order = yield prisma.order.findUnique({
                    where: { order_id: orderId },
                    include: {
                        OrderItem: {
                            include: {
                                product: {
                                    include: {
                                        Discount: true,
                                    },
                                },
                            },
                        },
                        user: true,
                        Shipping: true,
                    },
                });
                if (!order) {
                    (0, responseError_1.responseError)(res, "Order not found");
                    return;
                }
                if (order.user_id !== Number(userId)) {
                    (0, responseError_1.responseError)(res, "Unauthorized: You don't have permission to access this order");
                    return;
                }
                let totalPrice = order.OrderItem.reduce((sum, item) => {
                    var _a;
                    let price = item.product.price;
                    if ((_a = item.product.Discount) === null || _a === void 0 ? void 0 : _a.length) {
                        const discount = item.product.Discount[0];
                        if (discount.discount_type === "percentage") {
                            price -= (price * discount.discount_value) / 100;
                        }
                        else if (discount.discount_type === "point") {
                            price = Math.max(0, price - discount.discount_value);
                        }
                    }
                    return sum + price * item.qty;
                }, 0);
                if (order.order_status === "pending") {
                    yield prisma.order.update({
                        where: { order_id: orderId },
                        data: { order_status: "awaiting_payment" },
                    });
                }
                else if (order.order_status !== "awaiting_payment") {
                    (0, responseError_1.responseError)(res, "Order is not in a valid state for payment");
                    return;
                }
                if ((_b = req.body.voucher) === null || _b === void 0 ? void 0 : _b.discount) {
                    const voucher = req.body.voucher;
                    let discountAmount = voucher.discount.discount_type === "percentage"
                        ? (totalPrice * voucher.discount.discount_value) / 100
                        : voucher.discount.discount_value;
                    discountAmount = Math.min(discountAmount, totalPrice);
                    totalPrice -= discountAmount;
                    yield prisma.order.update({
                        where: { order_id: orderId },
                        data: {
                            total_price: totalPrice,
                            updated_at: new Date(),
                        },
                    });
                }
                if (req.body.shipping_method && ((_c = order.Shipping) === null || _c === void 0 ? void 0 : _c.length) > 0) {
                    yield prisma.shipping.update({
                        where: { shipping_id: order.Shipping[0].shipping_id },
                        data: {
                            shipping_cost: req.body.shipping_method.cost,
                            updated_at: new Date(),
                        },
                    });
                    totalPrice += req.body.shipping_method.cost;
                    yield prisma.order.update({
                        where: { order_id: orderId },
                        data: {
                            total_price: totalPrice,
                            updated_at: new Date(),
                        },
                    });
                }
                const updatedOrder = yield prisma.order.findUnique({
                    where: { order_id: orderId },
                    include: {
                        OrderItem: {
                            include: {
                                product: {
                                    include: {
                                        Discount: true,
                                    },
                                },
                            },
                        },
                        user: true,
                        Shipping: true,
                    },
                });
                if (!updatedOrder) {
                    (0, responseError_1.responseError)(res, "Error fetching updated order");
                    return;
                }
                let paymentResponse;
                try {
                    paymentResponse = yield createPaymentTransaction(updatedOrder, totalPrice);
                }
                catch (paymentError) {
                    console.error("Payment transaction error:", paymentError);
                    (0, responseError_1.responseError)(res, "Failed to create payment transaction");
                    return;
                }
                res.status(200).json({
                    success: true,
                    message: "Payment initiation successful",
                    payment_url: paymentResponse.redirect_url,
                    order_id: updatedOrder.order_id,
                });
            }
            catch (error) {
                console.error("Error initiating payment:", error);
                (0, responseError_1.responseError)(res, error.message || "An error occurred while initiating payment");
            }
        });
        // Handle payment callback from Midtrans
        this.paymentCallback = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Log the raw request to diagnose issues
                console.log("Payment callback headers:", req.headers);
                console.log("Payment callback raw body:", req.body);
                const paymentResult = req.body; // Midtrans will send payment data in the request body
                console.log("Payment callback received:", JSON.stringify(paymentResult, null, 2));
                // Verify that we have valid payment data
                if (!paymentResult || !paymentResult.order_id) {
                    console.error("Invalid payment callback data received");
                    // Very important: Always return 200 OK to Midtrans, even on error
                    res.status(200).json({
                        success: false,
                        message: "Invalid payment callback data",
                    });
                    return;
                }
                const order_id = paymentResult.order_id;
                const transaction_status = paymentResult.transaction_status;
                const fraud_status = paymentResult.fraud_status;
                console.log(`Processing payment for order ${order_id} with status: ${transaction_status}, fraud status: ${fraud_status}`);
                // Fetch the order
                const order = yield prisma.order.findUnique({
                    where: { order_id: Number(order_id) },
                    include: { Shipping: true },
                });
                if (!order) {
                    console.error(`Order not found: ${order_id}`);
                    // Always return 200 OK to Midtrans, even for errors
                    res.status(200).json({
                        success: false,
                        message: "Order not found",
                    });
                    return;
                }
                console.log(`Current order status: ${order.order_status}`);
                let newStatus;
                let newShippingStatus = null;
                // Determine new order status based on payment result
                if (transaction_status === "capture") {
                    if (fraud_status === "accept") {
                        newStatus = client_1.OrderStatus.shipped;
                        newShippingStatus = client_1.ShippingStatus.shipped;
                    }
                    else {
                        newStatus = client_1.OrderStatus.cancelled;
                    }
                }
                else if (transaction_status === "settlement") {
                    newStatus = client_1.OrderStatus.shipped;
                    newShippingStatus = client_1.ShippingStatus.shipped;
                }
                else if (transaction_status === "pending") {
                    newStatus = client_1.OrderStatus.awaiting_payment;
                }
                else if (["cancel", "deny", "expire"].includes(transaction_status)) {
                    newStatus = client_1.OrderStatus.cancelled;
                }
                else {
                    // Default case - keep it in awaiting_payment if we don't recognize the status
                    newStatus = client_1.OrderStatus.awaiting_payment;
                    console.log(`Unrecognized transaction status: ${transaction_status}, keeping as awaiting_payment`);
                }
                console.log(`Updating order ${order_id} status from ${order.order_status} to ${newStatus}`);
                // Update order status
                try {
                    const updatedOrder = yield prisma.order.update({
                        where: { order_id: Number(order_id) },
                        data: {
                            order_status: newStatus,
                            updated_at: new Date(),
                        },
                    });
                    console.log(`Order status updated successfully to: ${updatedOrder.order_status}`);
                }
                catch (dbError) {
                    console.error(`Error updating order status: ${dbError.message}`);
                    // Always return 200 OK to Midtrans, even for database errors
                    res.status(200).json({
                        success: false,
                        message: "Error updating order in database",
                    });
                    return;
                }
                // Update shipping status if payment was successful and shipping status should change
                if (newShippingStatus && order.Shipping.length > 0) {
                    try {
                        console.log(`Updating shipping status to: ${newShippingStatus}`);
                        const updatedShipping = yield prisma.shipping.update({
                            where: { shipping_id: order.Shipping[0].shipping_id },
                            data: {
                                shipping_status: newShippingStatus,
                                updated_at: new Date(),
                            },
                        });
                        console.log(`Shipping status updated successfully to: ${updatedShipping.shipping_status}`);
                    }
                    catch (shippingError) {
                        console.error(`Error updating shipping status: ${shippingError.message}`);
                        // Continue with the response even if shipping update fails
                    }
                }
                // For settlement and capture, also check if we need to verify with Midtrans API
                if (transaction_status === "settlement" ||
                    transaction_status === "capture") {
                    try {
                        // Verify transaction with Midtrans API using our helper function
                        const transactionData = yield checkMidtransStatus(order_id.toString());
                        console.log(`Verified transaction status from Midtrans API: ${transactionData.transaction_status}`);
                        // Double check if our status matches what Midtrans says
                        if (transactionData.transaction_status !== transaction_status) {
                            console.warn(`Transaction status mismatch: Callback ${transaction_status}, API ${transactionData.transaction_status}`);
                            // Update with the verified status if needed
                            if ((transactionData.transaction_status === "settlement" ||
                                transactionData.transaction_status === "capture") &&
                                (transactionData.fraud_status === "accept" ||
                                    !transactionData.fraud_status)) {
                                console.log(`Updating order status based on verified API status`);
                                yield prisma.order.update({
                                    where: { order_id: Number(order_id) },
                                    data: {
                                        order_status: client_1.OrderStatus.shipped,
                                        updated_at: new Date(),
                                    },
                                });
                            }
                        }
                    }
                    catch (verifyError) {
                        console.error(`Error verifying transaction with Midtrans API: ${verifyError.message}`);
                        // Continue with the response even if verification fails
                    }
                }
                // Check order status again after all updates to confirm it was actually changed
                const finalOrder = yield prisma.order.findUnique({
                    where: { order_id: Number(order_id) },
                });
                console.log(`Final order status after processing: ${finalOrder === null || finalOrder === void 0 ? void 0 : finalOrder.order_status}`);
                // Always return 200 OK to Midtrans
                res.status(200).json({
                    success: true,
                    message: "Payment callback processed successfully",
                    order_status: finalOrder === null || finalOrder === void 0 ? void 0 : finalOrder.order_status,
                });
            }
            catch (error) {
                console.error("Error processing payment callback:", error);
                // CRITICAL CHANGE: Always return HTTP 200 to Midtrans webhooks,
                // even when there's an error processing the notification
                res.status(200).json({
                    success: false,
                    message: "Error processing payment callback, but notification received",
                });
            }
        });
        // Add new method to handle frontend redirect after payment
        this.handlePaymentRedirect = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                // Get parameters from query string
                const { order_id, status_code, transaction_status } = req.query;
                console.log("Payment redirect:", {
                    order_id,
                    status_code,
                    transaction_status,
                });
                // Validate order_id
                if (!order_id) {
                    (0, responseError_1.responseError)(res, "Order ID missing");
                    return;
                }
                // Fetch the order
                const order = yield prisma.order.findUnique({
                    where: { order_id: Number(order_id) },
                });
                if (!order) {
                    (0, responseError_1.responseError)(res, "Order not found");
                    return;
                }
                // Check if we need to update the order status based on the redirect params
                if (transaction_status === "settlement" ||
                    transaction_status === "capture") {
                    // This is a success case, consider updating the order status here if the callback hasn't done it yet
                    if (order.order_status === client_1.OrderStatus.awaiting_payment) {
                        console.log(`Order ${order_id} still in awaiting_payment state on redirect. Triggering status check.`);
                        // We could update directly, but better to check with Midtrans API to confirm
                        try {
                            const transactionData = yield checkMidtransStatus(order_id.toString());
                            if (transactionData.transaction_status === "settlement" ||
                                transactionData.transaction_status === "capture") {
                                yield prisma.order.update({
                                    where: { order_id: Number(order_id) },
                                    data: {
                                        order_status: client_1.OrderStatus.shipped,
                                        updated_at: new Date(),
                                    },
                                });
                                console.log(`Updated order ${order_id} to shipped status during redirect handler`);
                            }
                        }
                        catch (checkError) {
                            console.error(`Error checking status during redirect: ${checkError}`);
                            // Continue with response even if check fails
                        }
                    }
                }
                // Return JSON response with payment info
                res.status(200).json({
                    success: true,
                    message: "Payment redirect received",
                    order_id,
                    status_code,
                    transaction_status,
                    current_order_status: order.order_status,
                });
                // Alternatively, redirect to a specific page based on status
                // const frontendBaseUrl = process.env.FRONTEND_URL || "https://example.com";
                // if (transaction_status === "settlement" || transaction_status === "capture") {
                //   res.redirect(`${frontendBaseUrl}/payment-success?order_id=${order_id}`);
                // } else if (transaction_status === "pending") {
                //   res.redirect(`${frontendBaseUrl}/payment-pending?order_id=${order_id}`);
                // } else {
                //   res.redirect(`${frontendBaseUrl}/payment-failed?order_id=${order_id}`);
                // }
            }
            catch (error) {
                console.error("Error handling payment redirect:", error);
                (0, responseError_1.responseError)(res, error.message || "Error handling payment redirect");
            }
        });
    }
    checkPaymentStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { order_id } = req.params;
                if (!order_id) {
                    console.error("❌ Order ID missing in request");
                    res.status(400).json({ success: false, message: "Order ID missing" });
                    return;
                }
                // 🔍 Cek order di database
                const order = yield prisma.order.findUnique({
                    where: { order_id: Number(order_id) },
                    include: { Shipping: true },
                });
                if (!order) {
                    console.error(`❌ Order not found: ${order_id}`);
                    res.status(404).json({ success: false, message: "Order not found" });
                    return;
                }
                console.log(`🔍 Checking payment status for order ${order_id}, current status: ${order.order_status}`);
                // 🛑 Jika status bukan `awaiting_payment`, tidak perlu cek ke Midtrans
                if (order.order_status !== client_1.OrderStatus.awaiting_payment) {
                    res.status(200).json({
                        success: true,
                        message: "Order is not in awaiting_payment status",
                        current_status: order.order_status,
                    });
                    return;
                }
                // 🔥 Cek status pembayaran dari Midtrans
                try {
                    const transactionData = yield checkMidtransStatus(order_id.toString());
                    console.log(`🔍 Midtrans API Response for ${order_id}:`, transactionData);
                    let newStatus = order.order_status;
                    switch (transactionData.transaction_status) {
                        case "capture":
                        case "settlement":
                            newStatus =
                                transactionData.fraud_status === "accept"
                                    ? client_1.OrderStatus.shipped
                                    : client_1.OrderStatus.cancelled;
                            break;
                        case "pending":
                            newStatus = client_1.OrderStatus.awaiting_payment;
                            break;
                        case "cancel":
                        case "deny":
                        case "expire":
                            newStatus = client_1.OrderStatus.cancelled;
                            break;
                        default:
                            console.warn(`⚠️ Unrecognized Midtrans status: ${transactionData.transaction_status}`);
                    }
                    // 🛠 Jika status berubah, update di database
                    if (newStatus !== order.order_status) {
                        console.log(`🔄 Updating order ${order_id} status from ${order.order_status} to ${newStatus}`);
                        const updatedOrder = yield prisma.order.update({
                            where: { order_id: Number(order_id) },
                            data: { order_status: newStatus, updated_at: new Date() },
                        });
                        res.status(200).json({
                            success: true,
                            message: "Payment status updated successfully",
                            previous_status: order.order_status,
                            current_status: updatedOrder.order_status,
                            transaction_status: transactionData.transaction_status,
                        });
                        return;
                    }
                    res.status(200).json({
                        success: true,
                        message: "Payment status verified, no update needed",
                        current_status: order.order_status,
                        transaction_status: transactionData.transaction_status,
                    });
                    return;
                }
                catch (apiError) {
                    console.error(`❌ Error checking transaction status with Midtrans API: ${apiError.message}`);
                    res.status(500).json({
                        success: false,
                        message: "Error checking payment status with Midtrans",
                        error: apiError.message,
                    });
                    return;
                }
            }
            catch (error) {
                console.error("❌ Error in checkPaymentStatus:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                    error: error.message,
                });
                return;
            }
        });
    }
}
exports.PaymentsController = PaymentsController;
