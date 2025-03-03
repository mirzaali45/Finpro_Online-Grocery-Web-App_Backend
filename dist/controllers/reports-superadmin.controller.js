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
exports.ReportSuperAdmin = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
class ReportSuperAdmin {
    getReportInventorySuperAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get query parameters for filtering
                const storeId = req.query.storeId ? parseInt(req.query.storeId) : undefined;
                const productId = req.query.productId ? parseInt(req.query.productId) : undefined;
                const lowStock = req.query.lowStock === 'true';
                const threshold = req.query.threshold ? parseInt(req.query.threshold) : 5; // Default threshold
                // Build the filter object
                const filter = {};
                if (storeId) {
                    filter.store_id = storeId;
                }
                if (productId) {
                    filter.product_id = productId;
                }
                // Get inventory data with related store and product information
                const inventoryData = yield prisma.inventory.findMany({
                    where: filter,
                    include: {
                        store: {
                            select: {
                                store_id: true,
                                store_name: true,
                                city: true,
                                province: true
                            }
                        },
                        product: {
                            select: {
                                product_id: true,
                                name: true,
                                price: true,
                                category: {
                                    select: {
                                        category_id: true,
                                        category_name: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        store_id: 'asc'
                    }
                });
                // Filter for low stock items if requested
                const filteredInventory = lowStock
                    ? inventoryData.filter(item => item.qty <= threshold)
                    : inventoryData;
                // Calculate aggregated statistics
                const totalItems = filteredInventory.reduce((sum, item) => sum + item.qty, 0);
                const totalValue = filteredInventory.reduce((sum, item) => sum + (item.qty * item.product.price), 0);
                // Group by store for summary
                const storesSummary = filteredInventory.reduce((acc, item) => {
                    const storeId = item.store_id;
                    if (!acc[storeId]) {
                        acc[storeId] = {
                            store_id: storeId,
                            store_name: item.store.store_name,
                            location: `${item.store.city}, ${item.store.province}`,
                            totalItems: 0,
                            totalValue: 0,
                            itemCount: 0
                        };
                    }
                    acc[storeId].totalItems += item.qty;
                    acc[storeId].totalValue += (item.qty * item.product.price);
                    acc[storeId].itemCount += 1;
                    return acc;
                }, {});
                // Return the response
                return res.status(200).json({
                    status: "success",
                    message: "Inventory report retrieved successfully",
                    data: {
                        overview: {
                            totalStores: Object.keys(storesSummary).length,
                            totalItems,
                            totalValue,
                            averageItemsPerStore: totalItems / Math.max(1, Object.keys(storesSummary).length)
                        },
                        storesSummary: Object.values(storesSummary),
                        inventory: filteredInventory.map(item => ({
                            inventory_id: item.inv_id,
                            store: {
                                id: item.store_id,
                                name: item.store.store_name
                            },
                            product: {
                                id: item.product_id,
                                name: item.product.name,
                                category: item.product.category.category_name,
                                price: item.product.price
                            },
                            current_quantity: item.qty,
                            total_quantity: item.total_qty,
                            stockValue: item.qty * item.product.price,
                            lowStock: item.qty <= threshold
                        }))
                    }
                });
            }
            catch (error) {
                console.error("Error retrieving inventory report:", error);
                return res.status(500).json({
                    status: "error",
                    message: "Failed to retrieve inventory report",
                    error: error instanceof Error ? error.message : "Unknown error"
                });
            }
        });
    }
}
exports.ReportSuperAdmin = ReportSuperAdmin;
