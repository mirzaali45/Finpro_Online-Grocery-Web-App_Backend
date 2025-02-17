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
      const notification = req.body;

      // Dapatkan order_id dari notifikasi midtrans (sesuai transaction_details.order_id)
      // Jika di atas kita menambahkan prefix "order-{order_id}", kita harus parsing:
      const orderIdFromMidtrans = notification.order_id; // ex: "order-123"
      const splitted = orderIdFromMidtrans.split("-");
      if (splitted.length < 2) {
        // Format tidak sesuai
        res
          .status(400)
          .json({ error: "Format order_id tidak valid di notifikasi." });
        return;
      }
      const orderId = Number(splitted[1]); // "123"

      const transactionStatus = notification.transaction_status; // capture, settlement, cancel, expire, etc.
      const fraudStatus = notification.fraud_status; // accept, deny, challenge

      // Cari order di DB
      const order = await prisma.order.findUnique({
        where: { order_id: orderId },
      });
      if (!order) {
        res.status(404).json({ message: "Order not found in DB." });
        return;
      }

      // Tentukan status order berdasarkan transactionStatus
      let newStatus: OrderStatus | null = null;

      if (transactionStatus === "capture") {
        if (fraudStatus === "challenge") {
          // Tergantung flow, misal tetap "awaiting_payment" atau "pending"
          newStatus = OrderStatus.pending;
        } else if (fraudStatus === "accept") {
          // Pembayaran sukses -> 'processing'
          newStatus = OrderStatus.processing;
        }
      } else if (transactionStatus === "settlement") {
        // settlement = pembayaran berhasil
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

      // Jika ada perubahan status, update di DB
      if (newStatus && newStatus !== order.order_status) {
        await prisma.order.update({
          where: { order_id: orderId },
          data: { order_status: newStatus },
        });
      }

      // Beri respon 200 ke Midtrans agar mereka tahu notifikasi telah diproses
      res.status(200).json({ message: "OK" });
      return;
    } catch (error: any) {
      console.error("midtransNotification error:", error);
      res.status(500).json({ error: error.message });
      return;
    }
  }
}
