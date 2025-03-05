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
exports.RevenueStoreController = void 0;
var client_1 = require("../../prisma/generated/client");
var prisma = new client_1.PrismaClient();
var RevenueStoreController = /** @class */ (function () {
    function RevenueStoreController() {
    }
    RevenueStoreController.prototype.getOrderbyStore = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, _a, startDate, endDate, status_1, whereConditions, endDateTime, orders, totalRevenue, error_1, message;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, prisma.user.findUnique({
                                where: {
                                    user_id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
                                    role: "store_admin",
                                },
                                include: {
                                    Store: true,
                                },
                            })];
                    case 1:
                        user = _c.sent();
                        if (!user) {
                            return [2 /*return*/, res.status(403).json({ message: "Unauthorized access" })];
                        }
                        if (!user.Store) {
                            return [2 /*return*/, res.status(404).json({
                                    message: "No store found for this admin",
                                    totalOrders: 0,
                                    totalRevenue: 0,
                                    orders: [],
                                })];
                        }
                        _a = req.query, startDate = _a.startDate, endDate = _a.endDate, status_1 = _a.status;
                        whereConditions = {
                            store_id: user.Store.store_id,
                        };
                        if (startDate && endDate) {
                            endDateTime = new Date(endDate);
                            endDateTime.setHours(23, 59, 59, 999); // Set to end of day
                            whereConditions.updated_at = {
                                gte: new Date(startDate),
                                lte: endDateTime, // Use adjusted date to include the entire end date
                            };
                        }
                        if (status_1) {
                            whereConditions.order_status = status_1;
                        }
                        return [4 /*yield*/, prisma.order.findMany({
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
                            })];
                    case 2:
                        orders = _c.sent();
                        totalRevenue = orders
                            .filter(function (order) {
                            return order.order_status === "shipped" ||
                                order.order_status === "completed";
                        })
                            .reduce(function (sum, order) { return sum + order.total_price; }, 0);
                        return [2 /*return*/, res.status(200).json({
                                totalOrders: orders.length,
                                totalRevenue: totalRevenue,
                                orders: orders,
                            })];
                    case 3:
                        error_1 = _c.sent();
                        message = error_1 instanceof Error ? error_1.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RevenueStoreController.prototype.getRevenueByPeriod = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, _a, _b, period, year, startDate, endDate, currentYear, whereConditions, endDateTime, revenueData, results, monthlyData_1, results, yearlyMap_1, error_2, message;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, prisma.user.findUnique({
                                where: {
                                    user_id: (_c = req.user) === null || _c === void 0 ? void 0 : _c.id,
                                    role: "store_admin",
                                },
                                include: {
                                    Store: true,
                                },
                            })];
                    case 1:
                        user = _d.sent();
                        if (!user) {
                            return [2 /*return*/, res.status(403).json({ message: "Unauthorized access" })];
                        }
                        if (!user.Store) {
                            return [2 /*return*/, res.status(404).json({
                                    message: "No store found for this admin",
                                    revenue: [],
                                })];
                        }
                        _a = req.query, _b = _a.period, period = _b === void 0 ? "monthly" : _b, year = _a.year, startDate = _a.startDate, endDate = _a.endDate;
                        currentYear = year
                            ? parseInt(year)
                            : new Date().getFullYear();
                        whereConditions = {
                            store_id: user.Store.store_id,
                            order_status: { in: ["shipped", "completed"] },
                        };
                        // Add year condition for monthly period
                        if (period === "monthly") {
                            whereConditions.updated_at = {
                                gte: new Date("".concat(currentYear, "-01-01")),
                                lt: new Date("".concat(currentYear + 1, "-01-01")),
                            };
                        }
                        // Add date range if specified
                        if (startDate || endDate) {
                            endDateTime = void 0;
                            if (endDate) {
                                endDateTime = new Date(endDate);
                                endDateTime.setHours(23, 59, 59, 999); // Set to end of day
                            }
                            whereConditions.updated_at = __assign(__assign(__assign({}, (whereConditions.updated_at || {})), (startDate ? { gte: new Date(startDate) } : {})), (endDate ? { lte: endDateTime } : {}));
                        }
                        revenueData = void 0;
                        if (!(period === "monthly")) return [3 /*break*/, 3];
                        return [4 /*yield*/, prisma.order.groupBy({
                                by: ["updated_at"],
                                where: whereConditions,
                                _sum: {
                                    total_price: true,
                                },
                            })];
                    case 2:
                        results = _d.sent();
                        monthlyData_1 = new Array(12).fill(0).map(function (_, i) { return ({
                            month: i + 1,
                            total_revenue: 0,
                        }); });
                        results.forEach(function (result) {
                            var month = new Date(result.updated_at).getMonth();
                            if (result._sum.total_price) {
                                monthlyData_1[month].total_revenue += Number(result._sum.total_price);
                            }
                        });
                        revenueData = monthlyData_1.filter(function (item) { return item.total_revenue > 0; });
                        return [3 /*break*/, 6];
                    case 3:
                        if (!(period === "yearly")) return [3 /*break*/, 5];
                        return [4 /*yield*/, prisma.order.groupBy({
                                by: ["updated_at"],
                                where: whereConditions,
                                _sum: {
                                    total_price: true,
                                },
                            })];
                    case 4:
                        results = _d.sent();
                        yearlyMap_1 = new Map();
                        results.forEach(function (result) {
                            var year = new Date(result.updated_at).getFullYear();
                            if (!yearlyMap_1.has(year)) {
                                yearlyMap_1.set(year, 0);
                            }
                            if (result._sum.total_price) {
                                yearlyMap_1.set(year, yearlyMap_1.get(year) + Number(result._sum.total_price));
                            }
                        });
                        revenueData = Array.from(yearlyMap_1.entries())
                            .map(function (_a) {
                            var year = _a[0], total_revenue = _a[1];
                            return ({
                                year: year,
                                total_revenue: total_revenue,
                            });
                        })
                            .sort(function (a, b) { return a.year - b.year; });
                        return [3 /*break*/, 6];
                    case 5: return [2 /*return*/, res.status(400).json({
                            message: "Invalid period. Use 'monthly' or 'yearly'.",
                        })];
                    case 6: return [2 /*return*/, res.status(200).json({
                            period: period,
                            year: currentYear,
                            revenue: revenueData,
                        })];
                    case 7:
                        error_2 = _d.sent();
                        message = error_2 instanceof Error ? error_2.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return RevenueStoreController;
}());
exports.RevenueStoreController = RevenueStoreController;
