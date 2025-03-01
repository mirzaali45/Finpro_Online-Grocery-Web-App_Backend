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
exports.RevenueStoreController = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
class RevenueStoreController {
    getOrderbyStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user = yield prisma.user.findUnique({
                    where: {
                        user_id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
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
                const whereConditions = {
                    store_id: user.Store.store_id,
                };
                if (startDate && endDate) {
                    whereConditions.created_at = {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    };
                }
                if (status) {
                    whereConditions.order_status = status;
                }
                const orders = yield prisma.order.findMany({
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
                    .filter((order) => order.order_status === "shipped" ||
                    order.order_status === "completed")
                    .reduce((sum, order) => sum + order.total_price, 0);
                return res.status(200).json({
                    totalOrders: orders.length,
                    totalRevenue,
                    orders,
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    //Rentan Waktu
    getRevenueByPeriod(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user = yield prisma.user.findUnique({
                    where: {
                        user_id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
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
                    ? parseInt(year)
                    : new Date().getFullYear();
                let revenueData;
                if (period === "monthly") {
                    revenueData = yield prisma.$queryRaw `
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
                }
                else if (period === "yearly") {
                    // Calculate yearly revenue
                    revenueData = yield prisma.$queryRaw `
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
                }
                else {
                    return res.status(400).json({
                        message: "Invalid period. Use 'monthly' or 'yearly'.",
                    });
                }
                const formattedRevenueData = revenueData.map((item) => (Object.assign(Object.assign({}, item), { total_revenue: Number(item.total_revenue) })));
                return res.status(200).json({
                    period,
                    year: currentYear,
                    revenue: formattedRevenueData,
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
}
exports.RevenueStoreController = RevenueStoreController;
