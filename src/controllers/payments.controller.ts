import { Request, Response } from "express";
// @ts-ignore
import midtransClient from "midtrans-client";
import { PrismaClient, OrderStatus } from "@prisma/client";
import * as crypto from "node:crypto";

const prisma = new PrismaClient();

// Konfigurasi Midtrans
const snap = new midtransClient.Snap({
  isProduction: false, // Ganti ke true jika di production
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

export class PaymentController {
  // Membuat transaksi Midtrans
  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const { order_id } = req.body;

      // Cek apakah order ada
      const order = await prisma.order.findUnique({
        where: { order_id: Number(order_id) },
        include: { user: true }, // Pastikan ada data user
      });

      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      // Pastikan order masih dalam status awaiting_payment
      if (order.order_status !== OrderStatus.awaiting_payment) {
        res.status(400).json({ message: "Order is not eligible for payment" });
        return;
      }

      // Buat parameter transaksi
      const parameter = {
        transaction_details: {
          order_id: `ORDER-${order_id}-${Date.now()}`, // Format lebih aman
          gross_amount: order.total_price,
        },
        customer_details: {
          first_name:
            order.user?.first_name || order.user?.username || "Customer",
          last_name: order.user?.last_name || "",
          email: order.user?.email || "noemail@example.com",
        },
      };

      const transaction = await snap.createTransaction(parameter);

      res.json({ payment_url: transaction.redirect_url });
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      console.log("Received Webhook Payload:", req.body);

      const {
        order_id,
        transaction_status,
        signature_key,
        gross_amount,
        status_code,
      } = req.body;

      if (!order_id || !signature_key || !gross_amount) {
        res.status(400).json({ message: "Invalid webhook data" });
        return;
      }

      // Gunakan status_code jika ada, kalau tidak default 200
      const statusCode = status_code || "200";

      // Pastikan gross_amount dalam bentuk string
      const grossAmountStr = String(gross_amount);

      // Ambil MIDTRANS_SERVER_KEY dari environment
      const serverKey = process.env.MIDTRANS_SERVER_KEY;
      if (!serverKey) {
        console.error(
          "MIDTRANS_SERVER_KEY is not set in environment variables."
        );
        res.status(500).json({ message: "Server key not found" });
        return;
      }

      // Buat hash signature
      const expectedSignature = crypto
        .createHash("sha512")
        .update(`${order_id}${statusCode}${grossAmountStr}${serverKey}`)
        .digest("hex");

      console.log("Expected Signature:", expectedSignature);
      console.log("Received Signature:", signature_key);

      // Validasi Signature Key
      if (signature_key !== expectedSignature) {
        res.status(401).json({ message: "Invalid signature" });
        return;
      }

      let status: OrderStatus | null = null;

      if (
        transaction_status === "capture" ||
        transaction_status === "settlement"
      ) {
        status = OrderStatus.processing;
      } else if (transaction_status === "pending") {
        status = OrderStatus.awaiting_payment;
      } else if (["cancel", "expire", "deny"].includes(transaction_status)) {
        status = OrderStatus.cancelled;
      }

      if (status) {
        await prisma.order.update({
          where: { order_id: Number(order_id.split("-")[1]) },
          data: { order_status: status },
        });
      }

      res.status(200).json({ message: "Webhook processed successfully" });
    } catch (error) {
      console.error("Error handling webhook:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
