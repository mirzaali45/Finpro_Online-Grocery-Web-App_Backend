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

      const where: any = {};

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

      // Use Prisma transaction for all database operations
      const orderWithDetails = await prisma.$transaction(async (tx) => {
        // Find user with primary address
        const user = await tx.user.findUnique({
          where: { user_id: Number(user_id) },
          include: {
            Address: {
              where: { is_primary: true },
              take: 1,
            },
          },
        });

        // Validate user and address
        if (!user)
          throw new Error("User tidak ditemukan / tidak terautentikasi.");
        if (!user.Address || user.Address.length === 0)
          throw new Error("User tidak memiliki alamat pengiriman.");
        const address = user.Address[0];

        // Get cart items with product and store info
        const cartItems = await tx.cartItem.findMany({
          where: { user_id: Number(user_id) },
          include: { product: { include: { store: true } } },
        });

        if (cartItems.length === 0)
          throw new Error("Keranjang belanja kosong.");

        // Check if all products are from the same store
        const storeIds = new Set(
          cartItems.map((item) => item.product.store_id)
        );

        if (storeIds.size > 1) {
          throw new Error(
            "Tidak dapat membuat pesanan, produk berasal dari toko yang berbeda. Harap hanya pilih produk dari toko yang sama."
          );
        }

        const storeId = cartItems[0].product.store_id;

        // Calculate total price
        let total_price = cartItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        // Check all inventories at once
        const productIds = cartItems.map((item) => item.product_id);
        const inventories = await tx.inventory.findMany({
          where: {
            product_id: { in: productIds },
            store_id: storeId,
          },
        });

        // Create a map for quick lookup
        const inventoryMap = new Map();
        inventories.forEach((inv) => inventoryMap.set(inv.product_id, inv));

        // Check inventory for each item
        for (const item of cartItems) {
          const inventory = inventoryMap.get(item.product_id);
          if (!inventory || inventory.total_qty < item.quantity) {
            throw new Error(
              `Stok tidak cukup untuk produk "${
                item.product.name
              }". Tersedia: ${
                inventory ? inventory.total_qty : 0
              }, Dibutuhkan: ${item.quantity}`
            );
          }
        }

        // Create the order
        const newOrder = await tx.order.create({
          data: {
            user_id: Number(user_id),
            store_id: storeId,
            total_price,
            order_status: OrderStatus.awaiting_payment,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        // Create order items in parallel
        const orderItemPromises = cartItems.map((item) =>
          tx.orderItem.create({
            data: {
              order_id: newOrder.order_id,
              product_id: item.product_id,
              qty: item.quantity,
              price: item.product.price,
              total_price: item.product.price * item.quantity,
            },
          })
        );

        // Update inventory in parallel
        const inventoryUpdatePromises = cartItems.map((item) => {
          const inventory = inventoryMap.get(item.product_id);
          if (inventory) {
            return tx.inventory.update({
              where: { inv_id: inventory.inv_id },
              data: {
                total_qty: inventory.total_qty - item.quantity,
                updated_at: new Date(),
              },
            });
          }
          return Promise.resolve(); // For TypeScript happiness
        });

        // Wait for all promises to complete
        await Promise.all([...orderItemPromises, ...inventoryUpdatePromises]);

        // Create shipping record
        await tx.shipping.create({
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

        // Clear user's cart
        await tx.cartItem.deleteMany({
          where: { user_id: Number(user_id) },
        });

        // Get order details for response
        const orderDetails = await tx.order.findUnique({
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

        // Add null check inside transaction
        if (!orderDetails) {
          throw new Error("Failed to retrieve order details after creation");
        }

        return orderDetails;
      });

      // Add null check after transaction
      if (!orderWithDetails) {
        throw new Error("Failed to create order. No order details returned.");
      }

      // Log success
      console.log(`Order ${orderWithDetails.order_id} created successfully`);

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
  async checkExpiredOrders(req: Request, res: Response): Promise<void> {
    try {
      // Find orders created more than 1 hour ago that are still in awaiting_payment status
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      const expiredOrders = await prisma.order.findMany({
        where: {
          order_status: OrderStatus.awaiting_payment,
          created_at: {
            lt: oneHourAgo,
          },
        },
        include: {
          OrderItem: true,
        },
      });

      console.log(`Found ${expiredOrders.length} expired orders to process`);

      // Process each expired order
      const processedOrders = [];

      for (const order of expiredOrders) {
        try {
          await prisma.$transaction(async (tx) => {
            // Get order items to restore inventory
            const orderItems = order.OrderItem;

            // Restore inventory for each item
            for (const item of orderItems) {
              const inventory = await tx.inventory.findFirst({
                where: {
                  product_id: item.product_id,
                  store_id: order.store_id,
                },
              });

              if (inventory) {
                await tx.inventory.update({
                  where: { inv_id: inventory.inv_id },
                  data: {
                    total_qty: {
                      increment: item.qty,
                    },
                    updated_at: new Date(),
                  },
                });
                console.log(
                  `Restored ${item.qty} units to inventory for product ${item.product_id}`
                );
              }
            }

            // Update order status to cancelled
            await tx.order.update({
              where: { order_id: order.order_id },
              data: {
                order_status: OrderStatus.cancelled,
                updated_at: new Date(),
              },
            });
          });

          console.log(
            `Order ${order.order_id} has been cancelled due to payment timeout`
          );
          processedOrders.push(order.order_id);
        } catch (orderError) {
          console.error(
            `Error processing expired order ${order.order_id}:`,
            orderError
          );
          // Continue with other orders even if one fails
        }
      }

      res.status(200).json({
        status: "success",
        message: `Processed ${processedOrders.length} expired orders`,
        data: {
          processedCount: processedOrders.length,
          processedOrders,
        },
      });
    } catch (error) {
      console.error("Error processing expired orders:", error);
      responseError(
        res,
        error instanceof Error
          ? error.message
          : "Failed to process expired orders"
      );
    }
  }
}
