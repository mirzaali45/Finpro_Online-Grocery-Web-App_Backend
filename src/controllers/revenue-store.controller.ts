import { PrismaClient, Role, OrderStatus } from "../../prisma/generated/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class RevenueStoreController {
  async getOrderbyStore(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          user_id: req.user?.id,
          role: "store_admin",
        },
        include: {
          Store: true,
        },
      });
      if (!user) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      if (!user.Store) {
        return res.status(404).json({
          message: "No store found for this admin",
          totalOrders: 0,
          totalRevenue: 0,
          orders: [],
        });
      }

      const { startDate, endDate, status } = req.query;

      const whereConditions: any = {
        store_id: user.Store.store_id,
      };

      if (startDate && endDate) {
        whereConditions.created_at = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string),
        };
      }

      if (status) {
        whereConditions.order_status = status as OrderStatus;
      }

      const orders = await prisma.order.findMany({
        where: whereConditions,
        include: {
          OrderItem: {
            include: {
              product: true,
            },
          },
          user: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      const totalRevenue = orders
        .filter(
          (order) =>
            order.order_status === "shipped" ||
            order.order_status === "completed"
        )
        .reduce((sum, order) => sum + order.total_price, 0);

      return res.status(200).json({
        totalOrders: orders.length,
        totalRevenue,
        orders,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  //Rentan Waktu
  async getRevenueByPeriod(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: {
          user_id: req.user?.id,
          role: "store_admin",
        },
        include: {
          Store: true,
        },
      });

      if (!user) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      if (!user.Store) {
        return res.status(404).json({
          message: "No store found for this admin",
          revenue: [],
        });
      }

      const { period = "monthly", year } = req.query;

      const currentYear = year
        ? parseInt(year as string)
        : new Date().getFullYear();

      let revenueData;

      if (period === "monthly") {
        revenueData = await prisma.$queryRaw`
        SELECT 
          EXTRACT(MONTH FROM created_at) AS month,
          SUM(total_price) AS total_revenue
        FROM 
          "Order"
        WHERE 
          store_id = ${user.Store.store_id}
          AND EXTRACT(YEAR FROM created_at) = ${currentYear}
          AND (order_status = 'shipped' OR order_status = 'completed')
        GROUP BY 
          EXTRACT(MONTH FROM created_at)
        ORDER BY 
          month
      `;
      } else if (period === "yearly") {
        // Calculate yearly revenue
        revenueData = await prisma.$queryRaw`
        SELECT 
          EXTRACT(YEAR FROM created_at) AS year,
          SUM(total_price) AS total_revenue
        FROM 
          "Order"
        WHERE 
          store_id = ${user.Store.store_id}
          AND (order_status = 'shipped' OR order_status = 'completed')
        GROUP BY 
          EXTRACT(YEAR FROM created_at)
        ORDER BY 
          year
      `;
      } else {
        return res.status(400).json({
          message: "Invalid period. Use 'monthly' or 'yearly'.",
        });
      }
      const formattedRevenueData = (revenueData as any[]).map((item) => ({
        ...item,
        total_revenue: Number(item.total_revenue),
      }));

      return res.status(200).json({
        period,
        year: currentYear,
        revenue: formattedRevenueData,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }
}