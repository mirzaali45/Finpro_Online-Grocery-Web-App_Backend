"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueSuperAdminController = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
class RevenueSuperAdminController {
    getAllOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Extract query parameters for pagination and filtering
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                const storeId = req.query.storeId
                    ? parseInt(req.query.storeId)
                    : undefined;
                const status = req.query.status;
                // Build filter object based on provided parameters
                const filter = {};
                if (storeId) {
                    filter.store_id = storeId;
                }
                if (status) {
                    filter.order_status = status;
                }
                // Get total count of orders matching filter
                const totalOrders = yield prisma.order.count({
                    where: filter,
                });
                // Get orders with pagination and include related data
                const orders = yield prisma.order.findMany({
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
            }
            catch (error) {
                console.error("Error retrieving orders:", error);
                return res.status(500).json({
                    status: "error",
                    message: "Failed to retrieve orders",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    getRevenueByPeriod(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Extract query parameters
                const period = req.query.period || "daily"; // 'daily', 'weekly', 'monthly', 'yearly'
                const startDate = req.query.startDate
                    ? new Date(req.query.startDate)
                    : new Date(new Date().setDate(new Date().getDate() - 30)); // Default: last 30 days
                const endDate = req.query.endDate
                    ? new Date(req.query.endDate)
                    : new Date();
                const storeId = req.query.storeId
                    ? parseInt(req.query.storeId)
                    : undefined;
                // Validate date range
                if (startDate > endDate) {
                    return res.status(400).json({
                        status: "error",
                        message: "Start date cannot be after end date",
                    });
                }
                // Build base filter for orders
                const filter = {
                    created_at: {
                        gte: startDate,
                        lte: endDate,
                    },
                    order_status: {
                        not: client_1.OrderStatus.cancelled,
                    },
                };
                if (storeId) {
                    filter.store_id = storeId;
                }
                // Get all orders in the date range
                const orders = yield prisma.order.findMany({
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
                const formatDate = (date) => {
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
                const getWeekNumber = (date) => {
                    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
                    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
                    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
                };
                // Group orders by period
                const revenueByPeriod = {};
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
                        if (!revenueByPeriod[periodKey].stores[storeName]) {
                            revenueByPeriod[periodKey].stores[storeName] = {
                                revenue: 0,
                                orderCount: 0,
                            };
                        }
                        revenueByPeriod[periodKey].stores[storeName].revenue += Number(order.total_price);
                        revenueByPeriod[periodKey].stores[storeName].orderCount += 1;
                    }
                });
                // Calculate summary statistics
                const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_price), 0);
                const totalOrders = orders.length;
                const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
                // Transform to array for easier frontend processing
                const revenueData = Object.entries(revenueByPeriod).map(([period, data]) => (Object.assign({ period }, data)));
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
            }
            catch (error) {
                console.error("Error retrieving revenue data:", error);
                return res.status(500).json({
                    status: "error",
                    message: "Failed to retrieve revenue data",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
    // Add a method to get dashboard statistics for super admin
    getDashboardStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get current date and date for 30 days ago
                const today = new Date();
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                // Get previous period for comparison
                const sixtyDaysAgo = new Date(today);
                sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
                // Get total users count
                const totalUsers = yield prisma.user.count({
                    where: {
                        role: client_1.Role.customer,
                    },
                });
                // Get new users in last 30 days
                const newUsers = yield prisma.user.count({
                    where: {
                        role: client_1.Role.customer,
                        created_at: {
                            gte: thirtyDaysAgo,
                        },
                    },
                });
                // Get new users in previous 30 days for growth calculation
                const previousPeriodNewUsers = yield prisma.user.count({
                    where: {
                        role: client_1.Role.customer,
                        created_at: {
                            gte: sixtyDaysAgo,
                            lt: thirtyDaysAgo,
                        },
                    },
                });
                // Calculate user growth percentage
                const userGrowthRate = previousPeriodNewUsers > 0
                    ? ((newUsers - previousPeriodNewUsers) / previousPeriodNewUsers) * 100
                    : newUsers > 0
                        ? 100
                        : 0;
                // Get total stores count
                const totalStores = yield prisma.store.count();
                // Get total products count
                const totalProducts = yield prisma.product.count();
                // Get total orders
                const totalOrders = yield prisma.order.count();
                // Get total revenue
                const revenueResult = yield prisma.order.aggregate({
                    where: {
                        order_status: {
                            not: client_1.OrderStatus.cancelled,
                        },
                    },
                    _sum: {
                        total_price: true,
                    },
                });
                const totalRevenue = revenueResult._sum.total_price || 0;
                // Get revenue for last 30 days
                const recentRevenueResult = yield prisma.order.aggregate({
                    where: {
                        created_at: {
                            gte: thirtyDaysAgo,
                        },
                        order_status: {
                            not: client_1.OrderStatus.cancelled,
                        },
                    },
                    _sum: {
                        total_price: true,
                    },
                });
                const recentRevenue = recentRevenueResult._sum.total_price || 0;
                // Get revenue for previous 30 days
                const previousRevenueResult = yield prisma.order.aggregate({
                    where: {
                        created_at: {
                            gte: sixtyDaysAgo,
                            lt: thirtyDaysAgo,
                        },
                        order_status: {
                            not: client_1.OrderStatus.cancelled,
                        },
                    },
                    _sum: {
                        total_price: true,
                    },
                });
                const previousRevenue = previousRevenueResult._sum.total_price || 0;
                // Calculate revenue growth percentage
                const revenueGrowthRate = previousRevenue > 0
                    ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
                    : recentRevenue > 0
                        ? 100
                        : 0;
                // Get top performing stores
                const topStores = yield prisma.order.groupBy({
                    by: ["store_id"],
                    where: {
                        created_at: {
                            gte: thirtyDaysAgo,
                        },
                        order_status: {
                            not: client_1.OrderStatus.cancelled,
                        },
                    },
                    _sum: {
                        total_price: true,
                    },
                    orderBy: {
                        _sum: {
                            total_price: "desc",
                        },
                    },
                    take: 5,
                });
                // Get store details for the top stores
                const topStoresWithDetails = yield Promise.all(topStores.map((store) => __awaiter(this, void 0, void 0, function* () {
                    const storeDetails = yield prisma.store.findUnique({
                        where: {
                            store_id: store.store_id,
                        },
                        select: {
                            store_id: true,
                            store_name: true,
                        },
                    });
                    return {
                        store_id: store.store_id,
                        store_name: storeDetails === null || storeDetails === void 0 ? void 0 : storeDetails.store_name,
                        revenue: store._sum.total_price,
                    };
                })));
                // Get top categories by sales
                const topCategories = yield prisma.orderItem.groupBy({
                    by: ["product_id"],
                    _sum: {
                        qty: true,
                        total_price: true,
                    },
                    orderBy: {
                        _sum: {
                            total_price: "desc",
                        },
                    },
                    take: 5,
                });
                const topCategoriesWithDetails = yield Promise.all(topCategories.map((item) => __awaiter(this, void 0, void 0, function* () {
                    const product = yield prisma.product.findUnique({
                        where: {
                            product_id: item.product_id,
                        },
                        include: {
                            category: true,
                        },
                    });
                    return {
                        category_id: product === null || product === void 0 ? void 0 : product.category.category_id,
                        category_name: product === null || product === void 0 ? void 0 : product.category.category_name,
                        sales: item._sum.total_price,
                        units_sold: item._sum.qty,
                    };
                })));
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
                            stores: topStoresWithDetails,
                            categories: topCategoriesWithDetails,
                        },
                    },
                });
            }
            catch (error) {
                console.error("Error retrieving dashboard stats:", error);
                return res.status(500).json({
                    status: "error",
                    message: "Failed to retrieve dashboard statistics",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
}
exports.RevenueSuperAdminController = RevenueSuperAdminController;
