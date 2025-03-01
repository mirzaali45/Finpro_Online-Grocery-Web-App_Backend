import {
  PrismaClient,
  Prisma,
  Role,
  OrderStatus,
} from "../../prisma/generated/client";
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

      const { period = "monthly", year, startDate, endDate } = req.query;

      const currentYear = year
        ? parseInt(year as string)
        : new Date().getFullYear();

      // Build query conditions
      const whereConditions: any = {
        store_id: user.Store.store_id,
        order_status: { in: ["shipped", "completed"] },
      };

      // Add year condition for monthly period
      if (period === "monthly") {
        whereConditions.created_at = {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        };
      }

      // Add date range if specified
      if (startDate || endDate) {
        whereConditions.created_at = {
          ...(whereConditions.created_at || {}),
          ...(startDate ? { gte: new Date(startDate as string) } : {}),
          ...(endDate ? { lte: new Date(endDate as string) } : {}),
        };
      }

      let revenueData;

      if (period === "monthly") {
        // Monthly revenue aggregation
        const results = await prisma.order.groupBy({
          by: ["created_at"],
          where: whereConditions,
          _sum: {
            total_price: true,
          },
        });

        // Process results to get monthly data
        const monthlyData = new Array(12).fill(0).map((_, i) => ({
          month: i + 1,
          total_revenue: 0,
        }));

        results.forEach((result) => {
          const month = new Date(result.created_at).getMonth();
          if (result._sum.total_price) {
            monthlyData[month].total_revenue += Number(result._sum.total_price);
          }
        });

        revenueData = monthlyData.filter((item) => item.total_revenue > 0);
      } else if (period === "yearly") {
        // Yearly revenue aggregation
        const results = await prisma.order.groupBy({
          by: ["created_at"],
          where: whereConditions,
          _sum: {
            total_price: true,
          },
        });

        // Process results to get yearly data
        const yearlyMap = new Map();

        results.forEach((result) => {
          const year = new Date(result.created_at).getFullYear();
          if (!yearlyMap.has(year)) {
            yearlyMap.set(year, 0);
          }
          if (result._sum.total_price) {
            yearlyMap.set(
              year,
              yearlyMap.get(year) + Number(result._sum.total_price)
            );
          }
        });

        revenueData = Array.from(yearlyMap.entries())
          .map(([year, total_revenue]) => ({
            year,
            total_revenue,
          }))
          .sort((a, b) => a.year - b.year);
      } else {
        return res.status(400).json({
          message: "Invalid period. Use 'monthly' or 'yearly'.",
        });
      }

      return res.status(200).json({
        period,
        year: currentYear,
        revenue: revenueData,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }
}
