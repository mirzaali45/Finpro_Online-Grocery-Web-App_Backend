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
exports.ReportsController = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
class ReportsController {
    /**
     * Get monthly sales report for store admin's store
     */
    getMonthlySalesReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { month = new Date().getMonth() + 1, year = new Date().getFullYear(), } = req.query;
                const user = req.user;
                if (!user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                // Get store associated with the user
                const userStore = yield prisma.store.findUnique({
                    where: { user_id: user.id }, // Use id instead of user_id
                });
                if (!userStore) {
                    return res
                        .status(404)
                        .json({ message: "No store found for this user" });
                }
                // Define date range
                const startDate = new Date(Number(year), Number(month) - 1, 1);
                const endDate = new Date(Number(year), Number(month), 0); // Last day of month
                // Get monthly sales
                const monthlySales = yield prisma.order.findMany({
                    where: {
                        store_id: userStore.store_id,
                        created_at: {
                            gte: startDate,
                            lte: endDate,
                        },
                        order_status: {
                            in: ["completed", "shipped"],
                        },
                    },
                    include: {
                        OrderItem: true,
                    },
                });
                // Calculate totals and format response
                const totalSales = monthlySales.reduce((sum, order) => sum + order.total_price, 0);
                return res.status(200).json({
                    month: Number(month),
                    year: Number(year),
                    store_id: userStore.store_id,
                    store_name: userStore.store_name,
                    total_sales: totalSales,
                    order_count: monthlySales.length,
                });
            }
            catch (error) {
                console.error("Error getting sales report:", error);
                return res.status(500).json({ message: "Failed to get sales report" });
            }
        });
    }
    /**
     * Get monthly sales report by category for store admin's store
     */
    getMonthlySalesByCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { month = new Date().getMonth() + 1, year = new Date().getFullYear(), } = req.query;
                const user = req.user;
                if (!user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                // Get store associated with the user
                const userStore = yield prisma.store.findUnique({
                    where: { user_id: user.id }, // Use id instead of user_id
                });
                if (!userStore) {
                    return res
                        .status(404)
                        .json({ message: "No store found for this user" });
                }
                // Define date range
                const startDate = new Date(Number(year), Number(month) - 1, 1);
                const endDate = new Date(Number(year), Number(month), 0);
                // Get sales data with category details
                const salesData = yield prisma.orderItem.findMany({
                    where: {
                        order: {
                            store_id: userStore.store_id,
                            created_at: {
                                gte: startDate,
                                lte: endDate,
                            },
                            order_status: {
                                in: ["completed", "shipped"],
                            },
                        },
                    },
                    include: {
                        product: {
                            include: {
                                category: true,
                            },
                        },
                    },
                });
                // Group by category
                const salesByCategory = {};
                salesData.forEach((item) => {
                    const categoryId = item.product.category_id;
                    const categoryName = item.product.category.category_name;
                    if (!salesByCategory[categoryId]) {
                        salesByCategory[categoryId] = {
                            category_id: categoryId,
                            category_name: categoryName,
                            total_sales: 0,
                            item_count: 0,
                        };
                    }
                    salesByCategory[categoryId].total_sales += item.total_price;
                    salesByCategory[categoryId].item_count += item.qty;
                });
                return res.status(200).json({
                    month: Number(month),
                    year: Number(year),
                    store_id: userStore.store_id,
                    store_name: userStore.store_name,
                    categories: Object.values(salesByCategory),
                });
            }
            catch (error) {
                console.error("Error getting sales by category:", error);
                return res
                    .status(500)
                    .json({ message: "Failed to get sales by category" });
            }
        });
    }
    /**
     * Get monthly sales report by product for store admin's store
     */
    getMonthlySalesByProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { month = new Date().getMonth() + 1, year = new Date().getFullYear(), categoryId, } = req.query;
                const user = req.user;
                if (!user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                // Get store associated with the user
                const userStore = yield prisma.store.findUnique({
                    where: { user_id: user.id }, // Use id instead of user_id
                });
                if (!userStore) {
                    return res
                        .status(404)
                        .json({ message: "No store found for this user" });
                }
                // Define date range
                const startDate = new Date(Number(year), Number(month) - 1, 1);
                const endDate = new Date(Number(year), Number(month), 0);
                // Build where clause
                const whereClause = {
                    order: {
                        store_id: userStore.store_id,
                        created_at: {
                            gte: startDate,
                            lte: endDate,
                        },
                        order_status: {
                            in: ["completed", "shipped"],
                        },
                    },
                };
                // Add category filter if provided
                if (categoryId) {
                    whereClause.product = {
                        category_id: Number(categoryId),
                    };
                }
                // Get sales data with product details
                const salesData = yield prisma.orderItem.findMany({
                    where: whereClause,
                    include: {
                        product: {
                            include: {
                                category: true,
                                ProductImage: {
                                    take: 1,
                                },
                            },
                        },
                    },
                });
                // Group by product
                const salesByProduct = {};
                salesData.forEach((item) => {
                    const productId = item.product_id;
                    const productName = item.product.name;
                    const categoryName = item.product.category.category_name;
                    const imageUrl = item.product.ProductImage.length > 0
                        ? item.product.ProductImage[0].url
                        : null;
                    if (!salesByProduct[productId]) {
                        salesByProduct[productId] = {
                            product_id: productId,
                            product_name: productName,
                            category_name: categoryName,
                            image_url: imageUrl,
                            total_sales: 0,
                            item_count: 0,
                        };
                    }
                    salesByProduct[productId].total_sales += item.total_price;
                    salesByProduct[productId].item_count += item.qty;
                });
                return res.status(200).json({
                    month: Number(month),
                    year: Number(year),
                    store_id: userStore.store_id,
                    store_name: userStore.store_name,
                    category_id: categoryId ? Number(categoryId) : null,
                    products: Object.values(salesByProduct),
                });
            }
            catch (error) {
                console.error("Error getting sales by product:", error);
                return res
                    .status(500)
                    .json({ message: "Failed to get sales by product" });
            }
        });
    }
    /**
     * Get monthly stock summary report for store admin's store
     */
    getMonthlyStockSummaryReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { month = new Date().getMonth() + 1, year = new Date().getFullYear(), } = req.query;
                const user = req.user;
                if (!user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                // Get store associated with the user
                const userStore = yield prisma.store.findUnique({
                    where: { user_id: user.id }, // Use id instead of user_id
                });
                if (!userStore) {
                    return res
                        .status(404)
                        .json({ message: "No store found for this user" });
                }
                // Define date range
                const startDate = new Date(Number(year), Number(month) - 1, 1);
                const endDate = new Date(Number(year), Number(month), 0);
                // Get current inventory
                const currentInventory = yield prisma.inventory.findMany({
                    where: {
                        store_id: userStore.store_id,
                    },
                    include: {
                        product: {
                            include: {
                                category: true,
                                ProductImage: {
                                    take: 1,
                                },
                            },
                        },
                    },
                });
                // Get orders for the month to calculate outgoing stock
                const monthlyOrders = yield prisma.orderItem.findMany({
                    where: {
                        order: {
                            store_id: userStore.store_id,
                            created_at: {
                                gte: startDate,
                                lte: endDate,
                            },
                            order_status: {
                                in: ["completed", "shipped"],
                            },
                        },
                    },
                    include: {
                        product: true,
                    },
                });
                // Calculate stock changes
                const stockSummary = {};
                // Initialize with current inventory
                currentInventory.forEach((inv) => {
                    const productId = inv.product_id;
                    const productName = inv.product.name;
                    const categoryName = inv.product.category.category_name;
                    const imageUrl = inv.product.ProductImage.length > 0
                        ? inv.product.ProductImage[0].url
                        : null;
                    stockSummary[productId] = {
                        product_id: productId,
                        product_name: productName,
                        category_name: categoryName,
                        image_url: imageUrl,
                        reductions: 0,
                        current_stock: inv.qty,
                    };
                });
                // Calculate reductions from orders
                monthlyOrders.forEach((item) => {
                    const productId = item.product_id;
                    if (stockSummary[productId]) {
                        stockSummary[productId].reductions += item.qty;
                    }
                });
                return res.status(200).json({
                    month: Number(month),
                    year: Number(year),
                    store_id: userStore.store_id,
                    store_name: userStore.store_name,
                    products: Object.values(stockSummary),
                });
            }
            catch (error) {
                console.error("Error getting stock summary:", error);
                return res.status(500).json({ message: "Failed to get stock summary" });
            }
        });
    }
    /**
     * Get detailed stock report for a specific product
     */
    getDetailedProductStockReport(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { month = new Date().getMonth() + 1, year = new Date().getFullYear(), productId, } = req.query;
                if (!productId) {
                    return res.status(400).json({ message: "Product ID is required" });
                }
                const user = req.user;
                if (!user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                // Get store associated with the user
                const userStore = yield prisma.store.findUnique({
                    where: { user_id: user.id }, // Use id instead of user_id
                });
                if (!userStore) {
                    return res
                        .status(404)
                        .json({ message: "No store found for this user" });
                }
                // Define date range
                const startDate = new Date(Number(year), Number(month) - 1, 1);
                const endDate = new Date(Number(year), Number(month), 0);
                // Get product inventory
                const inventory = yield prisma.inventory.findFirst({
                    where: {
                        store_id: userStore.store_id,
                        product_id: Number(productId),
                    },
                    include: {
                        product: {
                            include: {
                                category: true,
                                ProductImage: {
                                    take: 1,
                                },
                            },
                        },
                    },
                });
                if (!inventory) {
                    return res
                        .status(404)
                        .json({ message: "Product not found in store inventory" });
                }
                // Get orders for this product in the month
                const orders = yield prisma.orderItem.findMany({
                    where: {
                        product_id: Number(productId),
                        order: {
                            store_id: userStore.store_id,
                            created_at: {
                                gte: startDate,
                                lte: endDate,
                            },
                        },
                    },
                    include: {
                        order: true,
                    },
                    orderBy: {
                        order: {
                            created_at: "asc",
                        },
                    },
                });
                // Create product stock details
                const productDetails = {
                    product_id: inventory.product_id,
                    product_name: inventory.product.name,
                    category_name: inventory.product.category.category_name,
                    image_url: inventory.product.ProductImage.length > 0
                        ? inventory.product.ProductImage[0].url
                        : null,
                    current_stock: inventory.qty,
                    orders: orders.map((order) => ({
                        order_id: order.order.order_id,
                        date: order.order.created_at,
                        quantity: order.qty,
                        status: order.order.order_status,
                    })),
                };
                return res.status(200).json({
                    month: Number(month),
                    year: Number(year),
                    store_id: userStore.store_id,
                    store_name: userStore.store_name,
                    product: productDetails,
                });
            }
            catch (error) {
                console.error("Error getting detailed product stock:", error);
                return res
                    .status(500)
                    .json({ message: "Failed to get detailed product stock" });
            }
        });
    }
}
exports.ReportsController = ReportsController;
