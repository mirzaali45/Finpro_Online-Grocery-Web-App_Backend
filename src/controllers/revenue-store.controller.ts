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
        const endDateTime = new Date(endDate as string);
        endDateTime.setHours(23, 59, 59, 999); // Set to end of day

        whereConditions.updated_at = {
          gte: new Date(startDate as string),
          lte: endDateTime, // Use adjusted date to include the entire end date
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
          updated_at: "desc",
        },
      });

      // Transform orders for frontend use
      const formattedOrders = orders.map((order) => ({
        id: order.order_id,
        order_id: `ORD-${order.order_id.toString().padStart(6, "0")}`,
        customer_name:
          `${order.user.first_name || ""} ${
            order.user.last_name || ""
          }`.trim() || order.user.email,
        order_date: order.updated_at.toISOString(),
        status: order.order_status,
        total_price: Number(order.total_price),
      }));

      const totalRevenue = orders
        .filter(
          (order) =>
            order.order_status === "shipped" ||
            order.order_status === "completed"
        )
        .reduce((sum, order) => sum + Number(order.total_price), 0);

      return res.status(200).json({
        totalOrders: orders.length,
        totalRevenue,
        orders: formattedOrders,
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
          gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
          lt: new Date(`${currentYear + 1}-01-01T00:00:00.000Z`),
        };
      }

      // Add date range if specified
      if (startDate || endDate) {
        let endDateTime;
        if (endDate) {
          endDateTime = new Date(endDate as string);
          endDateTime.setHours(23, 59, 59, 999); // Set to end of day
        }

        whereConditions.created_at = {
          ...(whereConditions.created_at || {}),
          ...(startDate ? { gte: new Date(startDate as string) } : {}),
          ...(endDate ? { lte: endDateTime } : {}),
        };
      }

      // Get all relevant orders
      const orders = await prisma.order.findMany({
        where: whereConditions,
        select: {
          order_id: true,
          total_price: true,
          created_at: true,
        },
      });

      let revenueData;

      if (period === "monthly") {
        // Initialize array with all 12 months
        const monthlyData = Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          total_revenue: 0,
        }));

        // Process orders into monthly buckets
        orders.forEach((order) => {
          const month = new Date(order.created_at).getMonth(); // 0-based index
          monthlyData[month].total_revenue += Number(order.total_price);
        });

        revenueData = monthlyData;
      } else if (period === "yearly") {
        // Create a map to aggregate by year
        const yearlyMap = new Map<number, number>();

        // Process orders into yearly buckets
        orders.forEach((order) => {
          const year = new Date(order.created_at).getFullYear();
          const currentAmount = yearlyMap.get(year) || 0;
          yearlyMap.set(year, currentAmount + Number(order.total_price));
        });

        // If no data exists for current year in yearly view, add it with zero
        if (!yearlyMap.has(currentYear)) {
          yearlyMap.set(currentYear, 0);
        }

        // Convert map to array of objects
        revenueData = Array.from(yearlyMap)
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
      console.error("Revenue error:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }
}
