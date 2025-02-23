import { Request, Response } from "express";
import { PrismaClient, OrderStatus } from "@prisma/client";
import { snap } from "../utils/midtrans"; // Impor snap dari config

const prisma = new PrismaClient();

export class PaymentsController {
  /**
   * Membuat Snap Token untuk pembayaran Midtrans
   */
  async createSnapToken(req: Request, res: Response): Promise<void> {
    try {
      const { order_id } = req.body;

      // Cari order berdasarkan order_id
      const order = await prisma.order.findUnique({
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
        first_name: order.user?.first_name || "NoName",
        email: order.user?.email || "noemail@example.com",
        phone: order.user?.phone || "000000000",
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
      const transaction = await snap.createTransaction(parameters);

      // Kembalikan Snap Token dan redirect URL ke client
      res.status(200).json({
        token: transaction.token,
        redirect_url: transaction.redirect_url, // Link untuk melakukan pembayaran
      });
      return;
    } catch (error: any) {
      console.error("createSnapToken error:", error);
      res.status(500).json({ error: error.message });
      return;
    }
  }

  /**
   * Menangani notifikasi pembayaran dari Midtrans
   */
  async midtransNotification(req: Request, res: Response): Promise<void> {
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
      const order = await prisma.order.findUnique({
        where: { order_id: orderId },
      });

      if (!order) {
        res.status(404).json({ error: "Order not found." });
        return;
      }

      const transactionStatus = notification.transaction_status; // capture, settlement, cancel, etc.
      const fraudStatus = notification.fraud_status; // accept, deny, challenge

      let newStatus: OrderStatus | undefined;

      // Proses sesuai status transaksi dari Midtrans
      if (transactionStatus === "capture") {
        if (fraudStatus === "challenge") {
          newStatus = OrderStatus.awaiting_payment;
        } else if (fraudStatus === "accept") {
          newStatus = OrderStatus.processing;
        }
      } else if (transactionStatus === "settlement") {
        newStatus = OrderStatus.processing;
      } else if (
        transactionStatus === "cancel" ||
        transactionStatus === "deny" ||
        transactionStatus === "expire"
      ) {
        newStatus = OrderStatus.cancelled;
      } else if (transactionStatus === "pending") {
        newStatus = OrderStatus.awaiting_payment;
      }

      if (newStatus && newStatus !== order.order_status) {
        await prisma.order.update({
          where: { order_id: orderId },
          data: { order_status: newStatus },
        });
      }

      res.status(200).json({ message: "Notification received successfully" });
      return;
    } catch (error: any) {
      console.error("midtransNotification error:", error);
      res.status(500).json({ error: error.message });
      return;
    }
  }
}
