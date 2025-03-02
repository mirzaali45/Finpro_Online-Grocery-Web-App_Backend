import { Request, Response } from "express";
import { PrismaClient, OrderStatus } from "../../prisma/generated/client";
import { checkProductAvailability, calculateDistance } from "../utils/models";
import { responseError } from "../helpers/responseError"; // Use your custom responseError

const prisma = new PrismaClient();

// export class OrdersController {
//   async createOrder(req: Request, res: Response): Promise<void> {
//     try {
//       const { user_id, products, address_id } = req.body;

//       const user = await prisma.user.findUnique({
//         where: { user_id: Number(user_id) },
//       });
//       if (!user) {
//         responseError(res, "User tidak ditemukan / tidak terautentikasi.");
//         return;
//       }

//       const address = await prisma.address.findUnique({
//         where: { address_id: Number(address_id) },
//       });
//       if (!address) {
//         responseError(res, "Alamat tidak ditemukan.");
//         return;
//       }

//       let total_price = 0;
//       for (const item of products) {
//         await checkProductAvailability(item.product_id, item.quantity);
//         const productData = await prisma.product.findUnique({
//           where: { product_id: item.product_id },
//         });
//         if (!productData) {
//           throw new Error(`Produk ID ${item.product_id} tidak ditemukan.`);
//         }
//         total_price += productData.price * item.quantity;
//       }

//       const stores = await prisma.store.findMany();
//       let closestStore = null;
//       let minDistance = Number.MAX_VALUE;

//       for (const store of stores) {
//         const distance = calculateDistance(
//           address.latitude,
//           address.longitude,
//           store.latitude,
//           store.longitude
//         );
//         if (distance < minDistance) {
//           minDistance = distance;
//           closestStore = store;
//         }
//       }

//       if (!closestStore) {
//         responseError(res, "Tidak ada store terdekat ditemukan.");
//         return;
//       }

//       const newOrder = await prisma.order.create({
//         data: {
//           user_id: Number(user_id),
//           store_id: closestStore.store_id,
//           total_price,
//           order_status: OrderStatus.awaiting_payment,
//           created_at: new Date(),
//           updated_at: new Date(),
//         },
//       });

//       for (const item of products) {
//         const productData = await prisma.product.findUnique({
//           where: { product_id: item.product_id },
//         });
//         await prisma.orderItem.create({
//           data: {
//             order_id: newOrder.order_id,
//             product_id: item.product_id,
//             qty: item.quantity,
//             price: productData!.price,
//             total_price: productData!.price * item.quantity,
//           },
//         });
//       }

//       res.status(201).json({
//         message: "Order berhasil dibuat.",
//         data: newOrder,
//       });
//     } catch (error: any) {
//       console.error("createOrder error:", error);
//       responseError(res, error.message); // Using the responseError with only two arguments
//       return;
//     }
//   }

//   async getOrders(req: Request, res: Response): Promise<void> {
//     try {
//       const { status, user_id, store_id, date } = req.query as {
//         status?: string;
//         user_id?: string;
//         store_id?: string;
//         date?: string;
//       };

//       const where: any = {};

//       if (
//         status &&
//         Object.values(OrderStatus).includes(status as OrderStatus)
//       ) {
//         where.order_status = status as OrderStatus;
//       }

//       if (user_id) {
//         where.user_id = Number(user_id);
//       }

//       if (store_id) {
//         where.store_id = Number(store_id);
//       }

//       if (date) {
//         const startDate = new Date(date);
//         if (!isNaN(startDate.getTime())) {
//           const endDate = new Date(startDate);
//           endDate.setDate(endDate.getDate() + 1);
//           where.created_at = {
//             gte: startDate,
//             lt: endDate,
//           };
//         }
//       }

//       const orders = await prisma.order.findMany({
//         where,
//         include: {
//           user: true,
//           store: true,
//           OrderItem: true,
//           Shipping: true,
//         },
//         orderBy: { created_at: "desc" },
//       });

//       res.status(200).json({
//         data: orders,
//       });
//     } catch (error: any) {
//       console.error("getOrders error:", error);
//       responseError(res, error.message); // Using the responseError with only two arguments
//       return;
//     }
//   }
// }
export class OrdersController {
  async createOrder(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, products, address_id } = req.body;

      console.log("Received order data:", req.body); // Log the request body to see the data

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { user_id: Number(user_id) },
      });
      if (!user) {
        responseError(res, "User tidak ditemukan / tidak terautentikasi.");
        return;
      }

      // Check if address exists
      const address = await prisma.address.findUnique({
        where: { address_id: Number(address_id) },
      });
      if (!address) {
        responseError(res, "Alamat tidak ditemukan.");
        return;
      }

      let total_price = 0;
      // Loop through the products to check availability and calculate the total price
      for (const item of products) {
        const productData = await prisma.product.findUnique({
          where: { product_id: item.product_id },
        });
        if (!productData) {
          responseError(res, `Produk ID ${item.product_id} tidak ditemukan.`);
          return;
        }
        total_price += productData.price * item.quantity;
      }

      // Find the closest store
      const stores = await prisma.store.findMany();
      let closestStore = null;
      let minDistance = Number.MAX_VALUE;
      for (const store of stores) {
        const distance = calculateDistance(
          address.latitude,
          address.longitude,
          store.latitude,
          store.longitude
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestStore = store;
        }
      }

      if (!closestStore) {
        responseError(res, "Tidak ada store terdekat ditemukan.");
        return;
      }

      // Create the new order
      const newOrder = await prisma.order.create({
        data: {
          user_id: Number(user_id),
          store_id: closestStore.store_id,
          total_price,
          order_status: OrderStatus.awaiting_payment,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Add OrderItems for each product
      for (const item of products) {
        const productData = await prisma.product.findUnique({
          where: { product_id: item.product_id },
        });
        await prisma.orderItem.create({
          data: {
            order_id: newOrder.order_id,
            product_id: item.product_id,
            qty: item.quantity,
            price: productData!.price,
            total_price: productData!.price * item.quantity,
          },
        });
      }

      res.status(201).json({
        message: "Order berhasil dibuat.",
        data: newOrder,
      });
      return;
    } catch (error: any) {
      console.error("createOrder error:", error);
      responseError(res, error.message);
      return;
    }
  }
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
}
