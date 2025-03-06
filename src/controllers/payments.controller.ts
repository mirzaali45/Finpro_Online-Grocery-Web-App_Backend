// import { PrismaClient } from "../../prisma/generated/client";
// import midtransClient from "midtrans-client";
// import { Request, Response } from "express";

// const prisma = new PrismaClient();

// // Konfigurasi Midtrans Client
// const midtrans = new midtransClient.CoreApi({
//   isProduction: false, // Ganti ke true jika sudah siap produksi
//   serverKey: `${process.env.MIDTRANS_SERVER_KEY}`, // Ganti dengan server key Midtrans Anda
//   clientKey: `${process.env.MIDTRANS_CLIENT_KEY}`, // Ganti dengan client key Midtrans Anda
// });

// // Controller untuk membuat order pembayaran
// export class PaymentsController {
//   async createPaymentOrder(req: Request, res: Response): Promise<void> {
//     const { orderId, totalPrice, userId, storeId } = req.body;

//     // Validasi data yang diterima
//     if (!orderId || !totalPrice || !userId || !storeId) {
//       console.error("Missing required fields:", {
//         orderId,
//         totalPrice,
//         userId,
//         storeId,
//       });
//       res.status(400).json({
//         status: "error",
//         message:
//           "Missing required fields: orderId, totalPrice, userId, or storeId",
//       });
//       return;
//     }

//     try {
//       // Membuat order di database (status pending payment)
//       const order = await prisma.order.create({
//         data: {
//           user_id: userId,
//           store_id: storeId, // Menambahkan store_id yang dibutuhkan
//           total_price: totalPrice,
//           order_status: "awaiting_payment", // Status menunggu pembayaran
//         },
//       });

//       // Membuat transaksi pembayaran menggunakan Midtrans API
//       const parameter = {
//         payment_type: "gopay", // Ganti dengan metode pembayaran yang diinginkan
//         gopay: {
//           enable_callback: true,
//           callback_url: "https://your-website.com/payment/callback", // Ganti dengan URL callback Anda
//         },
//         transaction_details: {
//           order_id: orderId,
//           gross_amount: totalPrice,
//         },
//         customer_details: {
//           first_name: "John",
//           last_name: "Doe",
//           email: "johndoe@mail.com",
//           phone: "+628123456789",
//         },
//       };

//       const chargeResponse = await midtrans.transaction.create(parameter); // Metode create yang benar

//       console.log("Midtrans chargeResponse:", chargeResponse);

//       // Mengirim URL pembayaran ke client
//       res.status(200).json({
//         status: "success",
//         redirect_url: chargeResponse.redirect_url, // URL untuk redirect ke Midtrans
//         orderId: orderId,
//       });
//     } catch (error) {
//       console.error("Error creating payment order:", error);
//       res
//         .status(500)
//         .json({ status: "error", message: "Failed to create payment order" });
//     }
//   }

//   // Controller untuk menangani callback dari Midtrans
//   async paymentCallback(req: Request, res: Response): Promise<void> {
//     const status = req.body.transaction_status;
//     const orderId = req.body.order_id;

//     try {
//       // Update status order berdasarkan hasil transaksi
//       if (status === "capture" || status === "settlement") {
//         await prisma.order.update({
//           where: { order_id: orderId },
//           data: { order_status: "processing" },
//         });
//       } else if (status === "expire" || status === "cancel") {
//         await prisma.order.update({
//           where: { order_id: orderId },
//           data: { order_status: "cancelled" },
//         });
//       }

//       res.status(200).send("Payment status updated");
//     } catch (error) {
//       console.error(error);
//       res.status(500).send("Failed to process callback");
//     }
//   }

//   // Controller untuk membatalkan order otomatis setelah 1 jam jika belum dibayar
//   async autoCancelExpiredOrders(): Promise<void> {
//     const now = new Date();
//     const hourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 jam yang lalu

//     try {
//       // Mencari order yang belum dibayar dan lebih dari 1 jam
//       const expiredOrders = await prisma.order.findMany({
//         where: {
//           order_status: "awaiting_payment",
//           created_at: { lt: hourAgo },
//         },
//       });

//       // Membatalkan order yang sudah expired
//       for (const order of expiredOrders) {
//         await prisma.order.update({
//           where: { order_id: order.order_id },
//           data: { order_status: "cancelled" },
//         });
//       }

//       console.log(`Expired orders canceled: ${expiredOrders.length}`);
//     } catch (error) {
//       console.error(error);
//     }
//   }
// }

// // Menjadwalkan autoCancelExpiredOrders untuk dijalankan setiap 1 menit
// setInterval(() => {
//   const controller = new PaymentsController();
//   controller.autoCancelExpiredOrders();
// }, 60000); // Run setiap 1 menit
import { Request, Response } from "express";
import midtransClient from "../config/midtrans"; // Import configured Midtrans client
import { PrismaClient } from "../../prisma/generated/client";
import { OrderStatus } from "../../prisma/generated/client"; // Enum for OrderStatus

const prisma = new PrismaClient();

// Function to create Midtrans payment transaction
async function createPaymentTransaction(order: any) {
  const transactionDetails = {
    order_id: order.order_id.toString(),
    gross_amount: order.total_price,
  };

  const itemDetails = order.OrderItem.map((item: any) => ({
    id: item.product_id.toString(),
    price: item.price,
    quantity: item.qty,
    name: item.product.name,
  }));

  const customerDetails = {
    first_name: order.user.first_name,
    last_name: order.user.last_name,
    email: order.user.email,
    phone: order.user.phone,
  };

  try {
    const response = await midtransClient.createTransaction({
      transaction_details: transactionDetails,
      item_details: itemDetails,
      customer_details: customerDetails,
    });

    return response;
  } catch (error) {
    console.error("Error creating Midtrans payment transaction:", error);
    throw error;
  }
}

// Controller to initiate payment
export class PaymentsController {
  initiatePayment = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id; // Get the authenticated user's ID
    const { order_id } = req.params; // Get the order_id from the URL parameters

    if (!userId || !order_id) {
      res.status(400).json({ message: "User or Order ID missing" });
      return;
    }

    try {
      // Fetch the order from the database
      const order = await prisma.order.findUnique({
        where: { order_id: Number(order_id) },
        include: {
          OrderItem: {
            include: {
              product: true, // Include product details
            },
          },
          user: true, // Include user details
        },
      });

      if (!order || order.user_id !== userId) {
        res.status(404).json({ message: "Order not found or unauthorized" });
        return;
      }

      // Ensure order status is "awaiting_payment"
      if (order.order_status !== OrderStatus.awaiting_payment) {
        res
          .status(400)
          .json({ message: "Order is not in a valid state for payment" });
        return;
      }

      // Create payment transaction with Midtrans
      const paymentResponse = await createPaymentTransaction(order);

      // Respond with the payment redirect URL (Midtrans payment page)
      res.status(200).json({
        message: "Payment initiation successful",
        payment_url: paymentResponse.redirect_url,
        order_id: order.order_id,
      });

      // Optionally, update the order status to "processing" (after initiating payment)
      await prisma.order.update({
        where: { order_id: order.order_id },
        data: { order_status: OrderStatus.processing },
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      res
        .status(500)
        .json({ message: "An error occurred while initiating payment" });
      return;
    }
  };

  // Callback endpoint for Midtrans to notify your server about payment status
  paymentCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const paymentResult = req.body; // Midtrans will send payment data in the request body

      const order_id = paymentResult.order_id;
      const transaction_status = paymentResult.transaction_status; // Payment status (e.g., success, pending, etc.)
      const fraud_status = paymentResult.fraud_status; // Fraud detection status

      // Fetch the order from the database
      const order = await prisma.order.findUnique({
        where: { order_id: Number(order_id) },
        include: { Shipping: true },
      });

      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      let newStatus: OrderStatus;

      // Handle payment status
      if (transaction_status === "capture") {
        if (fraud_status === "accept") {
          newStatus = OrderStatus.completed; // Mark as completed if payment is accepted
        } else {
          newStatus = OrderStatus.cancelled; // Mark as cancelled if payment is suspected fraud
        }
      } else if (transaction_status === "settlement") {
        newStatus = OrderStatus.completed; // Completed payment
      } else if (transaction_status === "pending") {
        newStatus = OrderStatus.awaiting_payment; // Payment pending
      } else if (transaction_status === "cancel") {
        newStatus = OrderStatus.cancelled; // Cancelled payment
      } else {
        newStatus = OrderStatus.cancelled; // Default case for unknown statuses
      }

      // Update the order status in the database
      await prisma.order.update({
        where: { order_id: order.order_id },
        data: { order_status: newStatus },
      });

      // Optionally, handle shipping update (if applicable)
      if (newStatus === OrderStatus.completed && order.Shipping.length > 0) {
        await prisma.shipping.update({
          where: { shipping_id: order.Shipping[0].shipping_id },
          data: { shipping_status: "shipped" }, // Mark as shipped once payment is completed
        });
      }

      res
        .status(200)
        .json({ message: "Payment callback processed successfully" });
    } catch (error) {
      console.error("Error processing payment callback:", error);
      res.status(500).json({ message: "Error processing payment callback" });
      return;
    }
  };
}
