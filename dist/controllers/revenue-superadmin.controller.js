"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenueSuperAdminController = void 0;
var client_1 = require("../../prisma/generated/client");
var prisma = new client_1.PrismaClient();
var RevenueSuperAdminController = /** @class */ (function () {
    function RevenueSuperAdminController() {
    }
    RevenueSuperAdminController.prototype.getAllOrder = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, skip, storeId, status_1, filter, totalOrders, orders, totalPages, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        page = parseInt(req.query.page) || 1;
                        limit = parseInt(req.query.limit) || 10;
                        skip = (page - 1) * limit;
                        storeId = req.query.storeId
                            ? parseInt(req.query.storeId)
                            : undefined;
                        status_1 = req.query.status;
                        filter = {};
                        if (storeId) {
                            filter.store_id = storeId;
                        }
                        if (status_1) {
                            filter.order_status = status_1;
                        }
                        return [4 /*yield*/, prisma.order.count({
                                where: filter,
                            })];
                    case 1:
                        totalOrders = _a.sent();
                        return [4 /*yield*/, prisma.order.findMany({
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
                                skip: skip,
                                take: limit,
                                orderBy: {
                                    created_at: "desc",
                                },
                            })];
                    case 2:
                        orders = _a.sent();
                        totalPages = Math.ceil(totalOrders / limit);
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                message: "Orders retrieved successfully",
                                data: {
                                    orders: orders,
                                    pagination: {
                                        total: totalOrders,
                                        page: page,
                                        limit: limit,
                                        totalPages: totalPages,
                                    },
                                },
                            })];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Error retrieving orders:", error_1);
                        return [2 /*return*/, res.status(500).json({
                                status: "error",
                                message: "Failed to retrieve orders",
                                error: error_1 instanceof Error ? error_1.message : "Unknown error",
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RevenueSuperAdminController.prototype.getRevenueByPeriod = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var period_1, startDate, endDate, storeId_1, filter, orders, formatDate_1, getWeekNumber_1, revenueByPeriod_1, totalRevenue, totalOrders, averageOrderValue, revenueData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        period_1 = req.query.period || "daily";
                        startDate = req.query.startDate
                            ? new Date(req.query.startDate)
                            : new Date(new Date().setDate(new Date().getDate() - 30));
                        endDate = req.query.endDate
                            ? new Date(req.query.endDate)
                            : new Date();
                        storeId_1 = req.query.storeId
                            ? parseInt(req.query.storeId)
                            : undefined;
                        // Validate date range
                        if (startDate > endDate) {
                            return [2 /*return*/, res.status(400).json({
                                    status: "error",
                                    message: "Start date cannot be after end date",
                                })];
                        }
                        filter = {
                            created_at: {
                                gte: startDate,
                                lte: endDate,
                            },
                            order_status: {
                                not: client_1.OrderStatus.cancelled,
                            },
                        };
                        if (storeId_1) {
                            filter.store_id = storeId_1;
                        }
                        return [4 /*yield*/, prisma.order.findMany({
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
                            })];
                    case 1:
                        orders = _a.sent();
                        formatDate_1 = function (date) {
                            var year = date.getFullYear();
                            var month = (date.getMonth() + 1).toString().padStart(2, "0");
                            var day = date.getDate().toString().padStart(2, "0");
                            var week = getWeekNumber_1(date);
                            switch (period_1) {
                                case "daily":
                                    return "".concat(year, "-").concat(month, "-").concat(day);
                                case "weekly":
                                    return "".concat(year, "-W").concat(week);
                                case "monthly":
                                    return "".concat(year, "-").concat(month);
                                case "yearly":
                                    return "".concat(year);
                                default:
                                    return "".concat(year, "-").concat(month, "-").concat(day);
                            }
                        };
                        getWeekNumber_1 = function (date) {
                            var firstDayOfYear = new Date(date.getFullYear(), 0, 1);
                            var pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
                            return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
                        };
                        revenueByPeriod_1 = {};
                        orders.forEach(function (order) {
                            var periodKey = formatDate_1(new Date(order.created_at));
                            if (!revenueByPeriod_1[periodKey]) {
                                revenueByPeriod_1[periodKey] = {
                                    revenue: 0,
                                    orderCount: 0,
                                    stores: {},
                                };
                            }
                            revenueByPeriod_1[periodKey].revenue += Number(order.total_price);
                            revenueByPeriod_1[periodKey].orderCount += 1;
                            // Track per-store revenue if requested
                            if (order.store && !storeId_1) {
                                var storeName = order.store.store_name;
                                if (!revenueByPeriod_1[periodKey].stores[storeName]) {
                                    revenueByPeriod_1[periodKey].stores[storeName] = {
                                        revenue: 0,
                                        orderCount: 0,
                                    };
                                }
                                revenueByPeriod_1[periodKey].stores[storeName].revenue += Number(order.total_price);
                                revenueByPeriod_1[periodKey].stores[storeName].orderCount += 1;
                            }
                        });
                        totalRevenue = orders.reduce(function (sum, order) { return sum + Number(order.total_price); }, 0);
                        totalOrders = orders.length;
                        averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
                        revenueData = Object.entries(revenueByPeriod_1).map(function (_a) {
                            var period = _a[0], data = _a[1];
                            return (__assign({ period: period }, data));
                        });
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                message: "Revenue data retrieved successfully",
                                data: {
                                    revenueByPeriod: revenueData,
                                    summary: {
                                        totalRevenue: totalRevenue,
                                        totalOrders: totalOrders,
                                        averageOrderValue: averageOrderValue,
                                        startDate: startDate,
                                        endDate: endDate,
                                        period: period_1,
                                    },
                                },
                            })];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error retrieving revenue data:", error_2);
                        return [2 /*return*/, res.status(500).json({
                                status: "error",
                                message: "Failed to retrieve revenue data",
                                error: error_2 instanceof Error ? error_2.message : "Unknown error",
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Add a method to get dashboard statistics for super admin
    RevenueSuperAdminController.prototype.getDashboardStats = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var today, thirtyDaysAgo, sixtyDaysAgo, _a, userCounts, totalStores, totalProducts, totalOrders, revenueStats, topStores, topCategories, totalUsers, newUsers, previousPeriodNewUsers, totalRevenueResult, recentRevenueResult, previousRevenueResult, totalRevenue, recentRevenue, previousRevenue, userGrowthRate, revenueGrowthRate, error_3;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        today = new Date();
                        thirtyDaysAgo = new Date(today);
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        sixtyDaysAgo = new Date(today);
                        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
                        return [4 /*yield*/, Promise.all([
                                // Query 1: Get user counts (total, new, previous period)
                                prisma.$transaction([
                                    prisma.user.count({
                                        where: { role: client_1.Role.customer },
                                    }),
                                    prisma.user.count({
                                        where: {
                                            role: client_1.Role.customer,
                                            created_at: { gte: thirtyDaysAgo },
                                        },
                                    }),
                                    prisma.user.count({
                                        where: {
                                            role: client_1.Role.customer,
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
                                            order_status: { not: client_1.OrderStatus.cancelled },
                                        },
                                        _sum: { total_price: true },
                                    }),
                                    prisma.order.aggregate({
                                        where: {
                                            created_at: { gte: thirtyDaysAgo },
                                            order_status: { not: client_1.OrderStatus.cancelled },
                                        },
                                        _sum: { total_price: true },
                                    }),
                                    prisma.order.aggregate({
                                        where: {
                                            created_at: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
                                            order_status: { not: client_1.OrderStatus.cancelled },
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
                                        order_status: { not: client_1.OrderStatus.cancelled },
                                    },
                                    _sum: { total_price: true },
                                    orderBy: { _sum: { total_price: "desc" } },
                                    take: 5,
                                })
                                    .then(function (stores) { return __awaiter(_this, void 0, void 0, function () {
                                    var storeIds, storeDetails;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                storeIds = stores.map(function (store) { return store.store_id; });
                                                return [4 /*yield*/, prisma.store.findMany({
                                                        where: { store_id: { in: storeIds } },
                                                        select: { store_id: true, store_name: true },
                                                    })];
                                            case 1:
                                                storeDetails = _a.sent();
                                                return [2 /*return*/, stores.map(function (store) {
                                                        var details = storeDetails.find(function (s) { return s.store_id === store.store_id; });
                                                        return {
                                                            store_id: store.store_id,
                                                            store_name: details === null || details === void 0 ? void 0 : details.store_name,
                                                            revenue: store._sum.total_price,
                                                        };
                                                    })];
                                        }
                                    });
                                }); }),
                                // Query 7: Top categories by sales
                                prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                    var topItems, productIds, products;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, tx.orderItem.groupBy({
                                                    by: ["product_id"],
                                                    _sum: { qty: true, total_price: true },
                                                    orderBy: { _sum: { total_price: "desc" } },
                                                    take: 5,
                                                })];
                                            case 1:
                                                topItems = _a.sent();
                                                productIds = topItems.map(function (item) { return item.product_id; });
                                                return [4 /*yield*/, tx.product.findMany({
                                                        where: { product_id: { in: productIds } },
                                                        include: { category: true },
                                                    })];
                                            case 2:
                                                products = _a.sent();
                                                return [2 /*return*/, topItems.map(function (item) {
                                                        var product = products.find(function (p) { return p.product_id === item.product_id; });
                                                        return {
                                                            category_id: product === null || product === void 0 ? void 0 : product.category.category_id,
                                                            category_name: product === null || product === void 0 ? void 0 : product.category.category_name,
                                                            sales: item._sum.total_price,
                                                            units_sold: item._sum.qty,
                                                        };
                                                    })];
                                        }
                                    });
                                }); }),
                            ])];
                    case 1:
                        _a = _b.sent(), userCounts = _a[0], totalStores = _a[1], totalProducts = _a[2], totalOrders = _a[3], revenueStats = _a[4], topStores = _a[5], topCategories = _a[6];
                        totalUsers = userCounts[0], newUsers = userCounts[1], previousPeriodNewUsers = userCounts[2];
                        totalRevenueResult = revenueStats[0], recentRevenueResult = revenueStats[1], previousRevenueResult = revenueStats[2];
                        totalRevenue = totalRevenueResult._sum.total_price || 0;
                        recentRevenue = recentRevenueResult._sum.total_price || 0;
                        previousRevenue = previousRevenueResult._sum.total_price || 0;
                        userGrowthRate = previousPeriodNewUsers > 0
                            ? ((newUsers - previousPeriodNewUsers) / previousPeriodNewUsers) * 100
                            : newUsers > 0
                                ? 100
                                : 0;
                        revenueGrowthRate = previousRevenue > 0
                            ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
                            : recentRevenue > 0
                                ? 100
                                : 0;
                        return [2 /*return*/, res.status(200).json({
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
                            })];
                    case 2:
                        error_3 = _b.sent();
                        console.error("Error retrieving dashboard stats:", error_3);
                        return [2 /*return*/, res.status(500).json({
                                status: "error",
                                message: "Failed to retrieve dashboard statistics",
                                error: error_3 instanceof Error ? error_3.message : "Unknown error",
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return RevenueSuperAdminController;
}());
exports.RevenueSuperAdminController = RevenueSuperAdminController;
