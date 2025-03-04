import { Request, Response } from "express";
import {
  PrismaClient,
  ShippingStatus,
  OrderStatus,
} from "../../prisma/generated/client";
import { responseError } from "../helpers/responseError";

const prisma = new PrismaClient();

export class OrdersController {
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

  async createOrderFromCart(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.body;

      console.log("Creating order from cart for user:", user_id);

      // Find user with primary address
      const user = await prisma.user.findUnique({
        where: { user_id: Number(user_id) },
        include: {
          Address: {
            where: { is_primary: true },
            take: 1,
          },
        },
      });

      // Validate user and address
      if (!user) {
        responseError(res, "User tidak ditemukan / tidak terautentikasi.");
        return;
      }

      if (!user.Address || user.Address.length === 0) {
        responseError(res, "User tidak memiliki alamat pengiriman.");
        return;
      }

      const address = user.Address[0];

      // Get cart items with product and store info
      const cartItems = await prisma.cartItem.findMany({
        where: { user_id: Number(user_id) },
        include: {
          product: {
            include: {
              store: true,
            },
          },
        },
      });

      if (cartItems.length === 0) {
        responseError(res, "Keranjang belanja kosong.");
        return;
      }

      // Check if all products are from the same store
      const storeIds = new Set(cartItems.map((item) => item.product.store_id));

      if (storeIds.size > 1) {
        responseError(
          res,
          "Tidak dapat membuat pesanan, produk berasal dari toko yang berbeda. Harap hanya pilih produk dari toko yang sama."
        );
        return;
      }

      const storeId = cartItems[0].product.store_id;

      // Calculate total price
      let total_price = 0;
      for (const item of cartItems) {
        total_price += item.product.price * item.quantity;
      }

      // Check inventory for each item
      for (const item of cartItems) {
        const inventory = await prisma.inventory.findFirst({
          where: {
            product_id: item.product_id,
            store_id: storeId,
          },
        });

        if (!inventory || inventory.total_qty < item.quantity) {
          responseError(
            res,
            `Stok tidak cukup untuk produk "${item.product.name}". Tersedia: ${
              inventory ? inventory.total_qty : 0
            }, Dibutuhkan: ${item.quantity}`
          );
          return;
        }
      }

      // Create the order
      const newOrder = await prisma.order.create({
        data: {
          user_id: Number(user_id),
          store_id: storeId,
          total_price,
          order_status: OrderStatus.awaiting_payment,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Create order items and update inventory
      for (const item of cartItems) {
        await prisma.orderItem.create({
          data: {
            order_id: newOrder.order_id,
            product_id: item.product_id,
            qty: item.quantity,
            price: item.product.price,
            total_price: item.product.price * item.quantity,
          },
        });

        // Update inventory
        const inventory = await prisma.inventory.findFirst({
          where: {
            product_id: item.product_id,
            store_id: storeId,
          },
        });

        if (inventory) {
          console.log(
            `Updating inventory for product ${item.product_id}: Current total_qty=${inventory.total_qty}, reducing by ${item.quantity}`
          );

          await prisma.inventory.update({
            where: { inv_id: inventory.inv_id },
            data: {
              total_qty: inventory.total_qty - item.quantity,
              updated_at: new Date(),
            },
          });

          console.log(
            `Inventory updated for product ${item.product_id}: New total_qty=${
              inventory.total_qty - item.quantity
            }`
          );
        } else {
          console.error(
            `Critical error: Inventory record suddenly not found for product ${item.product_id} in store ${storeId}`
          );
        }
      }

      // Create shipping record
      await prisma.shipping.create({
        data: {
          order_id: newOrder.order_id,
          shipping_cost: 0,
          shipping_address: `${address.address}, ${address.city}, ${
            address.province
          }, ${address.postcode || ""}`,
          shipping_status: ShippingStatus.pending,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Set up auto-cancellation
      this.setupAutoCancellation(newOrder.order_id);

      // Get order details for response
      const orderWithDetails = await prisma.order.findUnique({
        where: { order_id: newOrder.order_id },
        include: {
          OrderItem: {
            include: {
              product: true,
            },
          },
          Shipping: true,
          store: true,
        },
      });

      // Clear user's cart after successful order creation
      await prisma.cartItem.deleteMany({
        where: { user_id: Number(user_id) },
      });

      res.status(201).json({
        message:
          "Order berhasil dibuat dari keranjang belanja. Pembayaran harus dilakukan dalam 1 jam.",
        data: orderWithDetails,
      });
    } catch (error: any) {
      console.error("createOrderFromCart error:", error);
      responseError(res, error.message);
    }
  }

  private setupAutoCancellation(orderId: number): void {
    setTimeout(async () => {
      try {
        const order = await prisma.order.findUnique({
          where: { order_id: orderId },
        });

        if (order && order.order_status === OrderStatus.awaiting_payment) {
          console.log(`Order ${orderId} payment time expired. Cancelling...`);
          const orderItems = await prisma.orderItem.findMany({
            where: { order_id: orderId },
          });
          for (const item of orderItems) {
            const inventory = await prisma.inventory.findFirst({
              where: {
                product_id: item.product_id,
                store_id: order.store_id,
              },
            });

            if (inventory) {
              await prisma.inventory.update({
                where: { inv_id: inventory.inv_id },
                data: {
                  total_qty: inventory.total_qty + item.qty,
                  updated_at: new Date(),
                },
              });
              console.log(
                `Restored ${item.qty} units to inventory total_qty for product ${item.product_id}`
              );
            } else {
              console.warn(
                `Cannot restore inventory for product ${item.product_id}: No inventory record found`
              );
            }
          }
          await prisma.orderItem.deleteMany({
            where: { order_id: orderId },
          });
          await prisma.shipping.deleteMany({
            where: { order_id: orderId },
          });
          await prisma.order.delete({
            where: { order_id: orderId },
          });

          console.log(`Order ${orderId} cancelled and inventory restored.`);
        }
      } catch (error) {
        console.error(
          `Error in auto-cancellation for order ${orderId}:`,
          error
        );
      }
    }, 60 * 60 * 1000);
  }

  async getMyOrders(req: Request, res: Response): Promise<void> {
    try {
      const user_id = req.user?.id;

      const { status } = req.query as { status?: string };

      // Validate user is authenticated
      if (!user_id) {
        responseError(res, "User tidak terautentikasi.");
        return;
      }

      // Build query conditions
      const where: any = {
        user_id: Number(user_id),
      };

      // Add status filter if provided
      if (
        status &&
        Object.values(OrderStatus).includes(status as OrderStatus)
      ) {
        where.order_status = status as OrderStatus;
      }

      // Get all orders for the authenticated user
      const orders = await prisma.order.findMany({
        where,
        include: {
          store: {
            select: {
              store_id: true,
              store_name: true,
              address: true,
              city: true,
              province: true,
            },
          },
          OrderItem: {
            include: {
              product: {
                include: {
                  ProductImage: {
                    take: 1, // Include just the first image
                  },
                },
              },
            },
          },
          Shipping: true,
        },
        orderBy: { created_at: "desc" },
      });

      if (orders.length === 0) {
        res.status(200).json({
          message: "Belum ada pesanan untuk akun Anda.",
          data: [],
        });
        return;
      }

      // Format the response to be more client-friendly
      const formattedOrders = orders.map((order) => {
        // Calculate total items in the order
        const totalItems = order.OrderItem.reduce(
          (sum, item) => sum + item.qty,
          0
        );

        // Format order items with essential details
        const items = order.OrderItem.map((item) => ({
          product_id: item.product_id,
          name: item.product.name,
          price: item.price,
          quantity: item.qty,
          total_price: item.total_price,
          image:
            item.product.ProductImage && item.product.ProductImage.length > 0
              ? item.product.ProductImage[0].url
              : null,
        }));

        return {
          order_id: order.order_id,
          order_date: order.created_at,
          status: order.order_status,
          total_price: order.total_price,
          total_items: totalItems,
          store: {
            store_id: order.store.store_id,
            store_name: order.store.store_name,
            location: `${order.store.city}, ${order.store.province}`,
          },
          shipping:
            order.Shipping.length > 0
              ? {
                  status: order.Shipping[0].shipping_status,
                  address: order.Shipping[0].shipping_address,
                  cost: order.Shipping[0].shipping_cost,
                }
              : null,
          items: items,
        };
      });

      res.status(200).json({
        message: "Daftar pesanan berhasil dimuat.",
        data: formattedOrders,
      });
      return;
    } catch (error: any) {
      console.error("getMyOrders error:", error);
      responseError(res, error.message);
      return;
    }
  }

  async deleteMyOrder(req: Request, res: Response): Promise<void> {
    try {
      // Get user_id from authenticated token
      const user_id = req.user?.id;

      // Get order_id from request parameters
      const { order_id } = req.params;

      // Validate user is authenticated
      if (!user_id) {
        responseError(res, "User tidak terautentikasi.");
        return;
      }

      // Validate order_id is provided and is a number
      if (!order_id || isNaN(Number(order_id))) {
        responseError(res, "ID pesanan tidak valid.");
        return;
      }

      // Find the order and make sure it belongs to the authenticated user
      const order = await prisma.order.findFirst({
        where: {
          order_id: Number(order_id),
          user_id: Number(user_id),
        },
        include: {
          OrderItem: true,
          Shipping: true,
        },
      });

      // Check if order exists and belongs to the user
      if (!order) {
        responseError(
          res,
          "Pesanan tidak ditemukan atau tidak memiliki akses."
        );
        return;
      }

      // Check if order can be deleted (only if status is awaiting_payment)
      if (order.order_status !== OrderStatus.awaiting_payment) {
        responseError(
          res,
          "Hanya pesanan dengan status menunggu pembayaran yang dapat dibatalkan."
        );
        return;
      }

      // Start a transaction to ensure all operations succeed or fail together
      await prisma.$transaction(async (prisma) => {
        // Restore inventory for each product in the order
        for (const item of order.OrderItem) {
          const inventory = await prisma.inventory.findFirst({
            where: {
              product_id: item.product_id,
              store_id: order.store_id,
            },
          });

          if (inventory) {
            // Restore total_qty quantity
            await prisma.inventory.update({
              where: { inv_id: inventory.inv_id },
              data: {
                total_qty: inventory.total_qty + item.qty,
                updated_at: new Date(),
              },
            });
            console.log(
              `Restored ${item.qty} units to inventory total_qty for product ${item.product_id}`
            );
          } else {
            console.warn(
              `Cannot restore inventory for product ${item.product_id}: No inventory record found`
            );
          }
        }

        // Delete order items
        await prisma.orderItem.deleteMany({
          where: { order_id: Number(order_id) },
        });

        // Delete shipping record
        await prisma.shipping.deleteMany({
          where: { order_id: Number(order_id) },
        });

        // Delete the order
        await prisma.order.delete({
          where: { order_id: Number(order_id) },
        });
      });

      res.status(200).json({
        message: "Pesanan berhasil dibatalkan dan dihapus.",
        data: { order_id: Number(order_id) },
      });
      return;
    } catch (error: any) {
      console.error("deleteMyOrder error:", error);
      responseError(res, error.message);
      return;
    }
  }
}
