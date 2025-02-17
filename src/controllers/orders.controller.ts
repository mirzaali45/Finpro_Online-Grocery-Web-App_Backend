import { OrderStatus, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class OrdersController {
  //   async getOrders(req: Request, res: Response) {
  //     try {
  //         if (!req.user) {
  //           return res.status(401).json({ error: "Unauthorized" });
  //         }

  //         const { store_id } = req.query;

  //         const orders = await prisma.order.findMany({
  //             where: { user_id: req.user.id },
  //             include: {
  //                 OrderItem: {  // Mengambil semua item terkait dengan order
  //                     include: {
  //                         product: true, // Menyertakan informasi produk jika ada relasi
  //                     },
  //                 },
  //                 store: {
  //                     select: {
  //                         store_name: true,
  //                         city: true,
  //                     },
  //                 },
  //             },
  //         });

  //         return res.status(200).json(orders);
  //     } catch (error) {
  //         console.error("Error fetching orders:", error);
  //         return res.status(500).json({ error: "Could not fetch orders" });
  //     }
  //   }
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, store_id, items } = req.body;

      if (!user_id || !store_id || !items || items.length === 0) {
        res.status(400).json({ message: "Invalid request data" });
        return;
      }

      // Hitung total harga
      let totalPrice = 0;
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { product_id: item.product_id },
        });

        // Jika produk tidak ditemukan, hentikan eksekusi dan kirim response
        if (!product) {
          res
            .status(404)
            .json({ message: `Product with ID ${item.product_id} not found` });
          return;
        }

        // Tambahkan harga produk ke total harga
        totalPrice += product.price * item.quantity;
      }

      // Buat pesanan baru
      const order = await prisma.order.create({
        data: {
          user_id,
          store_id,
          order_status: OrderStatus.awaiting_payment,
          total_price: totalPrice,
          OrderItem: {
            create: items.map((item: any) => ({
              product_id: item.product_id,
              qty: item.quantity,
              price: item.price,
              total_price: item.price * item.quantity,
            })),
          },
        },
      });

      res.status(201).json({ message: "Order created successfully", order });
      return;
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Mendapatkan daftar pesanan pengguna
  async getOrders(req: Request, res: Response) {
    try {
      const { user_id } = req.params;

      const orders = await prisma.order.findMany({
        where: { user_id: Number(user_id) },
        include: { OrderItem: true },
      });

      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Membatalkan pesanan sebelum upload bukti bayar
  async cancelOrder(req: Request, res: Response): Promise<void> {
    try {
      const { order_id } = req.params;

      const order = await prisma.order.findUnique({
        where: { order_id: Number(order_id) },
      });

      // Jika order tidak ditemukan, hentikan eksekusi
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      // Jika order status bukan "awaiting_payment", hentikan eksekusi
      if (order.order_status !== OrderStatus.awaiting_payment) {
        res.status(400).json({ message: "Order cannot be canceled" });
        return;
      }

      // Update status order menjadi "cancelled"
      await prisma.order.update({
        where: { order_id: Number(order_id) },
        data: { order_status: OrderStatus.cancelled },
      });

      res.json({ message: "Order canceled successfully" });
    } catch (error) {
      console.error("Error canceling order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async confirmOrder(req: Request, res: Response) {
    try {
      const { order_id } = req.params;

      const order = await prisma.order.update({
        where: { order_id: Number(order_id) },
        data: { order_status: "completed" },
      });

      res.status(200).json({ message: "Pesanan dikonfirmasi", order });
    } catch (error) {
      console.error("Error confirming order:", error);
      res.status(500).json({ message: "Gagal mengonfirmasi pesanan" });
    }
  }
}
