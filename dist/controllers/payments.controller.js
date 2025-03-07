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
        this.initiatePayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Get user ID from authenticated token or request body
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || req.body.user_id;
                // Get order_id from URL parameters
                const { order_id } = req.params;
                // Log request data for debugging
                console.log("Payment initiation request:", {
                    userId,
                    order_id,
                    body: req.body,
                    hasAuthHeader: !!req.headers.authorization,
                });
                // Validate required parameters
                if (!userId) {
                    (0, responseError_1.responseError)(res, "User ID missing. Please ensure you are logged in.");
                    return;
                }
                if (!order_id) {
                    (0, responseError_1.responseError)(res, "Order ID missing");
                    return;
                }
                // Fetch the order from the database with all needed associations
                const order = yield prisma.order.findUnique({
                    where: { order_id: Number(order_id) },
                    include: {
                        OrderItem: {
                            include: {
                                product: true, // Include product details
                            },
                        },
                        user: true, // Include user details
                        Shipping: true, // Include shipping details
                    },
                });
                // Check if order exists
                if (!order) {
                    (0, responseError_1.responseError)(res, "Order not found");
                    return;
                }
                // Validate order ownership
                if (order.user_id !== Number(userId)) {
                    (0, responseError_1.responseError)(res, "Unauthorized: You don't have permission to access this order");
                    return;
                }
                // Update order status to awaiting_payment if it's pending
                if (order.order_status === client_1.OrderStatus.pending) {
                    yield prisma.order.update({
                        where: { order_id: Number(order_id) },
                        data: { order_status: client_1.OrderStatus.awaiting_payment },
                    });
                }
                // Check if order can be paid
                else if (order.order_status !== client_1.OrderStatus.awaiting_payment) {
                    (0, responseError_1.responseError)(res, "Order is not in a valid state for payment");
                    return;
                }
                let updatedTotalPrice = order.total_price;
                // Update shipping details if provided
                if (req.body.shipping_method && order.Shipping.length > 0) {
                    // Update shipping record with the selected method details
                    yield prisma.shipping.update({
                        where: { shipping_id: order.Shipping[0].shipping_id },
                        data: {
                            shipping_cost: req.body.shipping_method.cost,
                            // You can also update other shipping details if needed
                            updated_at: new Date(),
                        },
                    });
                    // Calculate new total price including shipping
                    updatedTotalPrice = order.total_price + req.body.shipping_method.cost;
                    // Update order total price
                    yield prisma.order.update({
                        where: { order_id: Number(order_id) },
                        data: {
                            total_price: updatedTotalPrice,
                            updated_at: new Date(),
                        },
                    });
                    // Refetch order to get updated data
                    const updatedOrder = yield prisma.order.findUnique({
                        where: { order_id: Number(order_id) },
                        include: {
                            OrderItem: {
                                include: {
                                    product: true,
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
                    // Create payment transaction with Midtrans using updated order
                    const paymentResponse = yield createPaymentTransaction(updatedOrder, updatedTotalPrice);
                    // Send response with payment URL
                    res.status(200).json({
                        success: true,
                        message: "Payment initiation successful",
                        payment_url: paymentResponse.redirect_url,
                        order_id: updatedOrder.order_id,
                    });
                }
                else {
                    // Use existing order data if no shipping method was provided
                    const paymentResponse = yield createPaymentTransaction(order);
                    // Send response with payment URL
                    res.status(200).json({
                        success: true,
                        message: "Payment initiation successful",
                        payment_url: paymentResponse.redirect_url,
                        order_id: order.order_id,
                    });
                }
                // Do not automatically set to processing here
                // Let the payment callback handle status updates based on actual payment result
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
        // Check payment status directly from Midtrans and update if needed
        this.checkPaymentStatus = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { order_id } = req.params;
                if (!order_id) {
                    (0, responseError_1.responseError)(res, "Order ID missing");
                    return;
                }
                // First get current order status
                const order = yield prisma.order.findUnique({
                    where: { order_id: Number(order_id) },
                    include: { Shipping: true },
                });
                if (!order) {
                    (0, responseError_1.responseError)(res, "Order not found");
                    return;
                }
                console.log(`Checking payment status for order ${order_id}, current status: ${order.order_status}`);
                // Only check payments that are in awaiting_payment status
                if (order.order_status !== client_1.OrderStatus.awaiting_payment) {
                    res.status(200).json({
                        success: true,
                        message: "Order is not in awaiting_payment status",
                        current_status: order.order_status,
                    });
                    return;
                }
                // Check status with Midtrans API
                try {
                    const transactionData = yield checkMidtransStatus(order_id.toString());
                    console.log(`Got transaction status from Midtrans API: ${transactionData.transaction_status}`);
                    let newStatus;
                    let newShippingStatus = null;
                    // Determine new order status based on Midtrans status
                    if (transactionData.transaction_status === "capture" ||
                        transactionData.transaction_status === "settlement") {
                        if (transactionData.fraud_status === "accept" ||
                            !transactionData.fraud_status) {
                            newStatus = client_1.OrderStatus.shipped;
                            newShippingStatus = client_1.ShippingStatus.shipped;
                        }
                        else {
                            newStatus = client_1.OrderStatus.cancelled;
                        }
                    }
                    else if (transactionData.transaction_status === "pending") {
                        newStatus = client_1.OrderStatus.awaiting_payment;
                    }
                    else if (["cancel", "deny", "expire"].includes(transactionData.transaction_status)) {
                        newStatus = client_1.OrderStatus.cancelled;
                    }
                    else {
                        newStatus = order.order_status; // Keep current status if unknown
                    }
                    // Update order status if it needs to change
                    if (newStatus !== order.order_status) {
                        console.log(`Updating order ${order_id} status from ${order.order_status} to ${newStatus}`);
                        const updatedOrder = yield prisma.order.update({
                            where: { order_id: Number(order_id) },
                            data: {
                                order_status: newStatus,
                                updated_at: new Date(),
                            },
                        });
                        // Update shipping if needed
                        if (newShippingStatus && order.Shipping.length > 0) {
                            yield prisma.shipping.update({
                                where: { shipping_id: order.Shipping[0].shipping_id },
                                data: {
                                    shipping_status: newShippingStatus,
                                    updated_at: new Date(),
                                },
                            });
                        }
                        res.status(200).json({
                            success: true,
                            message: "Payment status updated successfully",
                            previous_status: order.order_status,
                            current_status: updatedOrder.order_status,
                            transaction_status: transactionData.transaction_status,
                        });
                    }
                    else {
                        res.status(200).json({
                            success: true,
                            message: "Payment status verified, no update needed",
                            current_status: order.order_status,
                            transaction_status: transactionData.transaction_status,
                        });
                    }
                }
                catch (apiError) {
                    console.error(`Error checking transaction status with Midtrans API: ${apiError.message}`);
                    (0, responseError_1.responseError)(res, `Error checking payment status: ${apiError.message}`);
                }
            }
            catch (error) {
                console.error("Error in checkPaymentStatus:", error);
                (0, responseError_1.responseError)(res, error.message || "Error checking payment status");
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
}
exports.PaymentsController = PaymentsController;
