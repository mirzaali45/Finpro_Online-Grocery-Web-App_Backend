import { Request, Response } from "express";
import { PrismaClient, OrderStatus } from "@prisma/client";
import { snap } from "../utils/midtrans";
// <-- Contoh import Snap config (sesuaikan path & nama file Anda)

const prisma = new PrismaClient();

export class PaymentsController {
  /**
   * GET /payments/:order_id/snap-token
   * Mengambil / generate token SNAP dari Midtrans untuk melanjutkan pembayaran.
   *
   * Client side akan menggunakan "token" ini untuk menampilkan Popup Midtrans.
   */
  async getSnapToken(req: Request, res: Response): Promise<void> {
    try {
      const { order_id } = req.params;

      // Cari order di DB
      const order = await prisma.order.findUnique({
        where: { order_id: Number(order_id) },
        include: {
          user: true,
          store: true,
        },
      });
      if (!order) {
        res.status(404).json({ error: "Order tidak ditemukan." });
        return;
      }

      // Cek apakah order_status masih "awaiting_payment" atau "pending"
      if (
        order.order_status !== OrderStatus.awaiting_payment &&
        order.order_status !== OrderStatus.pending
      ) {
        res.status(400).json({
          error: `Order dengan status '${order.order_status}' tidak bisa diproses untuk pembayaran.`,
        });
        return;
      }

      // Contoh gabungkan first_name + last_name
      const fullName = `${order.user?.first_name || ""} ${
        order.user?.last_name || ""
      }`.trim();

      // Siapkan parameter Midtrans
      const parameter = {
        transaction_details: {
          order_id: `order-${order.order_id}`,
          gross_amount: Math.floor(order.total_price),
        },
        customer_details: {
          first_name: fullName || "NoName",
          email: order.user?.email || "noemail@example.com",
          // Anda juga bisa menambahkan phone, dsb.
        },
      };

      // Dapatkan token Snap
      const transaction = await snap.createTransaction(parameter);

      // Kembalikan token & redirect_url ke client
      res.status(200).json({
        token: transaction.token,
        redirect_url: transaction.redirect_url,
      });
      return;
    } catch (error: any) {
      console.error("getSnapToken error:", error);
      res.status(500).json({ error: error.message });
      return;
    }
  }

  /**
   * POST /payments/notification
   * Endpoint untuk menerima callback / notifikasi pembayaran dari Midtrans.
   * Midtrans akan mengirim JSON ke URL ini ketika status pembayaran berubah.
   *
   * Pastikan URL ini ter‐expose (mis. via ngrok) dan didaftarkan di Dashboard Midtrans.
   */
  async midtransNotification(req: Request, res: Response): Promise<void> {
    try {
      // 1. Dapatkan payload notifikasi dari Midtrans
      const notification = req.body;

      // 2. Pastikan 'order_id' ada di payload
      if (!notification.order_id) {
        res
          .status(400)
          .json({ error: 'No "order_id" found in notification payload.' });
        return;
      }

      const orderIdFromMidtrans = notification.order_id as string;

      // 3. Jika Anda menambahkan prefix "order-" di createTransaction, parse di sini
      let numericOrderId: number;
      if (orderIdFromMidtrans.includes("-")) {
        // misal "order-5" => ["order", "5"]
        const splitted = orderIdFromMidtrans.split("-");
        if (splitted.length < 2) {
          res.status(400).json({ error: "Invalid order_id format." });
          return;
        }
        numericOrderId = Number(splitted[1]);
      } else {
        // Jika tidak menambahkan prefix, langsung parse ke number
        numericOrderId = Number(orderIdFromMidtrans);
      }

      // 4. Cari order di DB
      const order = await prisma.order.findUnique({
        where: { order_id: numericOrderId },
      });
      if (!order) {
        res
          .status(404)
          .json({ error: `Order with ID ${numericOrderId} not found in DB.` });
        return;
      }

      // 5. Baca status notifikasi dari Midtrans
      const transactionStatus = notification.transaction_status; // capture, settlement, cancel, expire, etc.
      const fraudStatus = notification.fraud_status; // accept, deny, challenge, etc.

      // 6. Tentukan status baru di DB berdasarkan status Midtrans
      let newStatus: OrderStatus | undefined;

      if (transactionStatus === "capture") {
        if (fraudStatus === "challenge") {
          // Contoh: jika 'challenge' => tetap awaiting_payment atau pending
          newStatus = OrderStatus.pending;
        } else if (fraudStatus === "accept") {
          // capture + accept => pembayaran sukses => processing
          newStatus = OrderStatus.processing;
        }
      } else if (transactionStatus === "settlement") {
        // settlement = pembayaran sukses
        newStatus = OrderStatus.processing;
      } else if (
        transactionStatus === "cancel" ||
        transactionStatus === "deny" ||
        transactionStatus === "expire"
      ) {
        // ketiganya => dibatalkan
        newStatus = OrderStatus.cancelled;
      } else if (transactionStatus === "pending") {
        // pending => belum bayar
        newStatus = OrderStatus.awaiting_payment;
      }

      // 7. Update status di DB jika ada perubahan
      // (pastikan newStatus berbeda dari order.order_status)
      if (newStatus && newStatus !== order.order_status) {
        await prisma.order.update({
          where: { order_id: numericOrderId },
          data: { order_status: newStatus },
        });
      }

      // 8. Response 200 ke Midtrans agar notifikasi dianggap "diterima dengan sukses"
      res.status(200).json({ message: "OK" });
      return;
    } catch (error: any) {
      console.error("midtransNotification error:", error);
      // 9. Jika ada error di server, beri response 500
      res.status(500).json({ error: error.message });
      return;
    }
  }
}
