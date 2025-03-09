import {
  PrismaClient,
  Prisma,
  Role,
  OrderStatus,
} from "../../prisma/generated/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class RevenueSuperAdminController {
  async getAllOrder(req: Request, res: Response) {
    try {
      // Extract query parameters for pagination and filtering
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const storeId = req.query.storeId
        ? parseInt(req.query.storeId as string)
        : undefined;
      const status = req.query.status as OrderStatus | undefined;

      // Build filter object based on provided parameters
      const filter: Prisma.OrderWhereInput = {};

      if (storeId) {
        filter.store_id = storeId;
      }

      if (status) {
        filter.order_status = status;
      }

      // Get total count of orders matching filter
      const totalOrders = await prisma.order.count({
        where: filter,
      });

      // Get orders with pagination and include related data
      const orders = await prisma.order.findMany({
        where: filter,
        include: {
          user: {
            select: {
              user_id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          store: {
            select: {
              store_id: true,
              store_name: true,
            },
          },
          OrderItem: {
            include: {
              product: true,
            },
          },
          Shipping: true,
        },
        skip,
        take: limit,
        orderBy: {
          created_at: "desc",
        },
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalOrders / limit);

      return res.status(200).json({
        status: "success",
        message: "Orders retrieved successfully",
        data: {
          orders,
          pagination: {
            total: totalOrders,
            page,
            limit,
            totalPages,
          },
        },
      });
    } catch (error) {
      console.error("Error retrieving orders:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve orders",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getRevenueByPeriod(req: Request, res: Response) {
    try {
      // Extract query parameters
      const period = (req.query.period as string) || "daily"; // 'daily', 'weekly', 'monthly', 'yearly'
      const startDate = req.query.startDate
        ? new Date(req.query.startDate as string)
        : new Date(new Date().setDate(new Date().getDate() - 30)); // Default: last 30 days
      const endDate = req.query.endDate
        ? new Date(req.query.endDate as string)
        : new Date();
      const storeId = req.query.storeId
        ? parseInt(req.query.storeId as string)
        : undefined;

      // Validate date range
      if (startDate > endDate) {
        return res.status(400).json({
          status: "error",
          message: "Start date cannot be after end date",
        });
      }

      // Build base filter for orders
      const filter: Prisma.OrderWhereInput = {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        order_status: {
          in: ["completed", "shipped"],
        },
      };

      if (storeId) {
        filter.store_id = storeId;
      }

      // Get all orders in the date range
      const orders = await prisma.order.findMany({
        where: filter,
        select: {
          order_id: true,
          total_price: true,
          created_at: true,
          store_id: true,
          store: {
            select: {
              store_name: true,
            },
          },
        },
        orderBy: {
          created_at: "asc",
        },
      });

      // Function to format date based on period
      const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const week = getWeekNumber(date);

        switch (period) {
          case "daily":
            return `${year}-${month}-${day}`;
          case "weekly":
            return `${year}-W${week}`;
          case "monthly":
            return `${year}-${month}`;
          case "yearly":
            return `${year}`;
          default:
            return `${year}-${month}-${day}`;
        }
      };

      // Helper function to get week number
      const getWeekNumber = (date: Date): number => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear =
          (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
      };

      // Group orders by period
      const revenueByPeriod: {
        [key: string]: {
          revenue: number;
          orderCount: number;
          stores?: { [key: string]: { revenue: number; orderCount: number } };
        };
      } = {};

      orders.forEach((order) => {
        const periodKey = formatDate(new Date(order.created_at));

        if (!revenueByPeriod[periodKey]) {
          revenueByPeriod[periodKey] = {
            revenue: 0,
            orderCount: 0,
            stores: {},
          };
        }

        revenueByPeriod[periodKey].revenue += Number(order.total_price);
        revenueByPeriod[periodKey].orderCount += 1;

        // Track per-store revenue if requested
        if (order.store && !storeId) {
          const storeName = order.store.store_name;
          if (!revenueByPeriod[periodKey].stores![storeName]) {
            revenueByPeriod[periodKey].stores![storeName] = {
              revenue: 0,
              orderCount: 0,
            };
          }

          revenueByPeriod[periodKey].stores![storeName].revenue += Number(
            order.total_price
          );
          revenueByPeriod[periodKey].stores![storeName].orderCount += 1;
        }
      });

      // Calculate summary statistics
      const totalRevenue = orders.reduce(
        (sum, order) => sum + Number(order.total_price),
        0
      );
      const totalOrders = orders.length;
      const averageOrderValue =
        totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Transform to array for easier frontend processing
      const revenueData = Object.entries(revenueByPeriod).map(
        ([period, data]) => ({
          period,
          ...data,
        })
      );

      return res.status(200).json({
        status: "success",
        message: "Revenue data retrieved successfully",
        data: {
          revenueByPeriod: revenueData,
          summary: {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            startDate,
            endDate,
            period,
          },
        },
      });
    } catch (error) {
      console.error("Error retrieving revenue data:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve revenue data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Add a method to get dashboard statistics for super admin
  async getDashboardStats(req: Request, res: Response) {
    try {
      // Get current date and date for 30 days ago
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date(today);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      // Run all queries in parallel
      const [
        userCounts,
        totalStores,
        totalProducts,
        totalOrders,
        revenueStats,
        topStores,
        topCategories,
      ] = await Promise.all([
        // Query 1: Get user counts (total, new, previous period)
        prisma.$transaction([
          prisma.user.count({
            where: { role: Role.customer },
          }),
          prisma.user.count({
            where: {
              role: Role.customer,
              created_at: { gte: thirtyDaysAgo },
            },
          }),
          prisma.user.count({
            where: {
              role: Role.customer,
              created_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
            },
          }),
        ]),

        // Query 2: Total stores count
        prisma.store.count(),

        // Query 3: Total products count
        prisma.product.count(),

        // Query 4: Total orders count
        prisma.order.count(),

        // Query 5: Revenue statistics (all, recent, previous)
        prisma.$transaction([
          prisma.order.aggregate({
            where: {
              order_status: { in: ["completed", "shipped"] },
            },
            _sum: { total_price: true },
          }),
          prisma.order.aggregate({
            where: {
              created_at: { gte: thirtyDaysAgo },
              order_status: { in: ["completed", "shipped"] },
            },
            _sum: { total_price: true },
          }),
          prisma.order.aggregate({
            where: {
              created_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
              order_status: { in: ["completed", "shipped"] },
            },
            _sum: { total_price: true },
          }),
        ]),

        // Query 6: Top performing stores with details in one query
        prisma.order
          .groupBy({
            by: ["store_id"],
            where: {
              created_at: { gte: thirtyDaysAgo },
              order_status: { in: ["completed", "shipped"] },
            },
            _sum: { total_price: true },
            orderBy: { _sum: { total_price: "desc" } },
            take: 5,
          })
          .then(async (stores) => {
            // Get all store details in one query instead of multiple
            const storeIds = stores.map((store) => store.store_id);
            const storeDetails = await prisma.store.findMany({
              where: { store_id: { in: storeIds } },
              select: { store_id: true, store_name: true },
            });

            return stores.map((store) => {
              const details = storeDetails.find(
                (s) => s.store_id === store.store_id
              );
              return {
                store_id: store.store_id,
                store_name: details?.store_name,
                revenue: store._sum.total_price,
              };
            });
          }),

        // Query 7: Top categories by sales
        prisma.$transaction(async (tx) => {
          const topItems = await tx.orderItem.groupBy({
            by: ["product_id"],
            _sum: { qty: true, total_price: true },
            orderBy: { _sum: { total_price: "desc" } },
            take: 5,
          });

          const productIds = topItems.map((item) => item.product_id);

          // Get all products with their categories in one query
          const products = await tx.product.findMany({
            where: { product_id: { in: productIds } },
            include: { category: true },
          });

          return topItems.map((item) => {
            const product = products.find(
              (p) => p.product_id === item.product_id
            );
            return {
              category_id: product?.category.category_id,
              category_name: product?.category.category_name,
              sales: item._sum.total_price,
              units_sold: item._sum.qty,
            };
          });
        }),
      ]);

      // Extract values from results
      const [totalUsers, newUsers, previousPeriodNewUsers] = userCounts;
      const [totalRevenueResult, recentRevenueResult, previousRevenueResult] =
        revenueStats;

      const totalRevenue = totalRevenueResult._sum.total_price || 0;
      const recentRevenue = recentRevenueResult._sum.total_price || 0;
      const previousRevenue = previousRevenueResult._sum.total_price || 0;

      // Calculate growth rates
      const userGrowthRate =
        previousPeriodNewUsers > 0
          ? ((newUsers - previousPeriodNewUsers) / previousPeriodNewUsers) * 100
          : newUsers > 0
          ? 100
          : 0;

      const revenueGrowthRate =
        previousRevenue > 0
          ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
          : recentRevenue > 0
          ? 100
          : 0;

      return res.status(200).json({
        status: "success",
        message: "Dashboard statistics retrieved successfully",
        data: {
          users: {
            total: totalUsers,
            new: newUsers,
            growthRate: userGrowthRate.toFixed(2),
          },
          stores: {
            total: totalStores,
          },
          products: {
            total: totalProducts,
          },
          orders: {
            total: totalOrders,
          },
          revenue: {
            total: totalRevenue,
            recent: recentRevenue,
            growthRate: revenueGrowthRate.toFixed(2),
          },
          topPerformers: {
            stores: topStores,
            categories: topCategories,
          },
        },
      });
    } catch (error) {
      console.error("Error retrieving dashboard stats:", error);
      return res.status(500).json({
        status: "error",
        message: "Failed to retrieve dashboard statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
