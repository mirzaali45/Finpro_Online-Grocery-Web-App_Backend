import { Request, Response } from "express";
import { PrismaClient, OrderStatus } from "@prisma/client";

const prisma = new PrismaClient();

export class OrdersController {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, store_id, total_price } = req.body;

      if (!user_id || !store_id || total_price == null) {
        res.status(400).json({
          error: "user_id, store_id, dan total_price harus diisi.",
        });
        return;
      }

      // Pastikan user & store valid (opsional)
      const user = await prisma.user.findUnique({
        where: { user_id: Number(user_id) },
      });
      if (!user) {
        res.status(404).json({ error: "User tidak ditemukan." });
        return;
      }

      const store = await prisma.store.findUnique({
        where: { store_id: Number(store_id) },
      });
      if (!store) {
        res.status(404).json({ error: "Store tidak ditemukan." });
        return;
      }

      // Buat order baru
      const newOrder = await prisma.order.create({
        data: {
          user_id: Number(user_id),
          store_id: Number(store_id),
          total_price: Number(total_price),
          // Set status awal ke "awaiting_payment" (atau "pending", sesuai kebutuhan)
          order_status: OrderStatus.awaiting_payment,
        },
      });

      res.status(201).json({
        message: "Order berhasil dibuat.",
        data: newOrder,
      });
      return;
    } catch (error: any) {
      console.error("createOrder error:", error);
      res.status(500).json({ error: error.message });
      return;
    }
  }

  /**
   * GET /orders
   * Query params (opsional):
   *   ?status=pending|awaiting_payment|processing|shipped|completed|cancelled
   *   ?user_id=1
   *   ?store_id=1
   *   ?date=YYYY-MM-DD (filter by created_at)
   */
  async getOrders(req: Request, res: Response): Promise<void> {
    try {
      const { status, user_id, store_id, date } = req.query as {
        status?: string;
        user_id?: string;
        store_id?: string;
        date?: string;
      };

      // Buat objek "where" sesuai tipe Prisma.OrderWhereInput
      const where: any = {};

      // Filter by order_status
      if (
        status &&
        Object.values(OrderStatus).includes(status as OrderStatus)
      ) {
        where.order_status = status as OrderStatus;
      }

      // Filter by user_id
      if (user_id) {
        where.user_id = Number(user_id);
      }

      // Filter by store_id
      if (store_id) {
        where.store_id = Number(store_id);
      }

      // Filter by date (created_at)
      if (date) {
        const startDate = new Date(date);
        if (!isNaN(startDate.getTime())) {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
          where.created_at = {
            gte: startDate,
            lt: endDate,
          };
        }
      }

      // Dapatkan data order + relasi
      const orders = await prisma.order.findMany({
        where,
        include: {
          user: true,
          store: true,
          // misalnya item detail:
          OrderItem: true,
          // shipping, dsb.:
          Shipping: true,
        },
        orderBy: { created_at: "desc" },
      });

      res.status(200).json({
        data: orders,
      });
      return;
    } catch (error: any) {
      console.error("getOrders error:", error);
      res.status(500).json({ error: error.message });
      return;
    }
  }

  /**
   * PATCH /orders/:order_id/cancel
   * Cancel order manual (misal, hanya jika status masih "awaiting_payment" / "pending").
   */
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { order_id } = req.params;

      const order = await prisma.order.findUnique({
        where: { order_id: Number(order_id) },
      });
      if (!order) {
        res.status(404).json({ error: "Order tidak ditemukan." });
        return;
      }

      // Pilihan 1 (cek langsung):
      if (
        order.order_status !== OrderStatus.awaiting_payment &&
        order.order_status !== OrderStatus.pending
      ) {
        res.status(400).json({
          error: `Order tidak berstatus 'awaiting_payment' atau 'pending'. (Status saat ini: '${order.order_status}')`,
        });
        return;
      }

      // Update status ke "cancelled"
      const cancelledOrder = await prisma.order.update({
        where: { order_id: Number(order_id) },
        data: {
          order_status: OrderStatus.cancelled,
        },
      });

      res.status(200).json({
        message: "Order berhasil dibatalkan.",
        data: cancelledOrder,
      });
      return;
    } catch (error: any) {
      console.error("cancelOrder error:", error);
      res.status(500).json({ error: error.message });
      return;
    }
  }

  /**
   * PATCH /orders/:order_id/confirm
   * Contoh konfirmasi order (misal berpindah dari 'awaiting_payment' -> 'processing', dsb.).
   * Silakan sesuaikan logic sesuai flow Anda (mungkin perlu cek pembayaran, dsb.).
   */
  async confirmOrder(req: Request, res: Response): Promise<void> {
    try {
      const { order_id } = req.params;

      const order = await prisma.order.findUnique({
        where: { order_id: Number(order_id) },
      });
      if (!order) {
        res.status(404).json({ error: "Order tidak ditemukan." });
        return;
      }

      // Misal: hanya boleh confirm kalau status masih 'awaiting_payment'
      if (order.order_status !== OrderStatus.awaiting_payment) {
        res.status(400).json({
          error: `Order tidak berstatus 'awaiting_payment'. (Status saat ini: '${order.order_status}')`,
        });
        return;
      }

      // Ubah ke 'processing' (atau 'completed') sesuai kebutuhan
      const updatedOrder = await prisma.order.update({
        where: { order_id: Number(order_id) },
        data: {
          order_status: OrderStatus.processing,
        },
      });

      res.status(200).json({
        message: 'Order dikonfirmasi dan status diubah ke "processing".',
        data: updatedOrder,
      });
      return;
    } catch (error: any) {
      console.error("confirmOrder error:", error);
      res.status(500).json({ error: error.message });
      return;
    }
  }
}
