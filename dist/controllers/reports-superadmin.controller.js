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
                const storeId = req.query.storeId
                    ? parseInt(req.query.storeId)
                    : undefined;
                const productId = req.query.productId
                    ? parseInt(req.query.productId)
                    : undefined;
                const lowStock = req.query.lowStock === "true";
                const threshold = req.query.threshold
                    ? parseInt(req.query.threshold)
                    : 5; // Default threshold
                // Store pagination parameters
                const storePage = Number(req.query.storePage) || 1;
                const storeLimit = Number(req.query.storeLimit) || 10;
                const storeSkip = (storePage - 1) * storeLimit;
                // Inventory pagination parameters - separate from store pagination
                const inventoryPage = Number(req.query.page) || 1;
                const inventoryLimit = Number(req.query.limit) || 10;
                const inventorySkip = (inventoryPage - 1) * inventoryLimit;
                // First, get ALL stores regardless of inventory (with counting)
                const storeFilter = {};
                if (storeId) {
                    storeFilter.store_id = storeId;
                }
                // Count total stores for pagination
                const totalStores = yield prisma.store.count({
                    where: storeFilter,
                });
                // Get stores for the current page
                const allStores = yield prisma.store.findMany({
                    where: storeFilter,
                    select: {
                        store_id: true,
                        store_name: true,
                        city: true,
                        province: true,
                    },
                    orderBy: {
                        store_id: "asc",
                    },
                    skip: storeSkip,
                    take: storeLimit,
                });
                // Get all store IDs for the current page to use in inventory filtering
                const storeIds = allStores.map((store) => store.store_id);
                // Build the inventory filter
                const inventoryFilter = {};
                // Only filter by store IDs if storeId isn't specifically provided
                if (storeId) {
                    inventoryFilter.store_id = storeId;
                }
                else {
                    inventoryFilter.store_id = { in: storeIds };
                }
                if (productId) {
                    inventoryFilter.product_id = productId;
                }
                // First, count total inventory items that match our filters for pagination
                let totalInventoryCount = yield prisma.inventory.count({
                    where: inventoryFilter,
                });
                // Apply low stock filter to the count if needed
                if (lowStock) {
                    // We need to get all the inventory items to check the qty
                    const allInventoryItems = yield prisma.inventory.findMany({
                        where: inventoryFilter,
                        select: { qty: true },
                    });
                    // Filter for low stock and count
                    totalInventoryCount = allInventoryItems.filter((item) => item.qty <= threshold).length;
                }
                // Get inventory summary data for all matching stores (for store summary)
                const inventorySummaryData = yield prisma.inventory.findMany({
                    where: inventoryFilter,
                    include: {
                        store: {
                            select: {
                                store_id: true,
                                store_name: true,
                                city: true,
                                province: true,
                            },
                        },
                        product: {
                            select: {
                                product_id: true,
                                name: true,
                                price: true,
                            },
                        },
                    },
                });
                // Filter for low stock if needed
                const filteredSummaryInventory = lowStock
                    ? inventorySummaryData.filter((item) => item.qty <= threshold)
                    : inventorySummaryData;
                // Now get paginated inventory items for detailed display
                const inventoryData = yield prisma.inventory.findMany({
                    where: inventoryFilter,
                    include: {
                        store: {
                            select: {
                                store_id: true,
                                store_name: true,
                                city: true,
                                province: true,
                            },
                        },
                        product: {
                            select: {
                                product_id: true,
                                name: true,
                                price: true,
                                category: {
                                    select: {
                                        category_id: true,
                                        category_name: true,
                                    },
                                },
                            },
                        },
                    },
                    orderBy: {
                        store_id: "asc",
                    },
                    skip: inventorySkip,
                    take: inventoryLimit,
                });
                // Filter for low stock items if requested
                const filteredInventory = lowStock
                    ? inventoryData.filter((item) => item.qty <= threshold)
                    : inventoryData;
                // Calculate aggregated statistics from the summary inventory (not paginated)
                const totalItems = filteredSummaryInventory.reduce((sum, item) => sum + item.qty, 0);
                const totalValue = filteredSummaryInventory.reduce((sum, item) => sum + item.qty * item.product.price, 0);
                // Initialize storesSummary with ALL stores (even those with no inventory)
                const storesSummary = {};
                // First, add all stores with zero values
                allStores.forEach((store) => {
                    storesSummary[store.store_id] = {
                        store_id: store.store_id,
                        store_name: store.store_name,
                        location: `${store.city || ""}, ${store.province || ""}`.trim(),
                        totalItems: 0,
                        totalValue: 0,
                        itemCount: 0,
                    };
                });
                // Then update with inventory summary data
                filteredSummaryInventory.forEach((item) => {
                    // Only include if this store is on the current page
                    if (storesSummary[item.store_id]) {
                        storesSummary[item.store_id].totalItems += item.qty;
                        storesSummary[item.store_id].totalValue +=
                            item.qty * item.product.price;
                        storesSummary[item.store_id].itemCount += 1;
                    }
                });
                // Calculate pagination metadata for stores
                const storeTotalPages = Math.ceil(totalStores / storeLimit);
                const storeHasNextPage = storePage < storeTotalPages;
                const storeHasPrevPage = storePage > 1;
                // Calculate pagination metadata for inventory
                const inventoryTotalPages = Math.ceil(totalInventoryCount / inventoryLimit);
                const inventoryHasNextPage = inventoryPage < inventoryTotalPages;
                const inventoryHasPrevPage = inventoryPage > 1;
                // Return the response
                return res.status(200).json({
                    status: "success",
                    message: "Inventory report retrieved successfully",
                    data: {
                        overview: {
                            totalStores, // Total count of ALL stores
                            displayedStores: allStores.length, // Count of stores on current page
                            storesWithInventory: Object.values(storesSummary).filter((s) => s.itemCount > 0).length,
                            totalItems,
                            totalValue,
                            averageItemsPerStore: totalItems /
                                Math.max(1, Object.values(storesSummary).filter((s) => s.itemCount > 0)
                                    .length),
                        },
                        storesSummary: Object.values(storesSummary),
                        inventory: filteredInventory.map((item) => ({
                            inventory_id: item.inv_id,
                            store: {
                                id: item.store_id,
                                name: item.store.store_name,
                            },
                            product: {
                                id: item.product_id,
                                name: item.product.name,
                                category: item.product.category.category_name,
                                price: item.product.price,
                            },
                            current_quantity: item.qty,
                            total_quantity: item.total_qty,
                            stockValue: item.qty * item.product.price,
                            lowStock: item.qty <= threshold,
                        })),
                        inventoryCount: totalInventoryCount, // Total count of inventory items
                    },
                    pagination: {
                        // Store pagination
                        store: {
                            total: totalStores,
                            page: storePage,
                            limit: storeLimit,
                            totalPages: storeTotalPages,
                            hasNextPage: storeHasNextPage,
                            hasPrevPage: storeHasPrevPage,
                        },
                        // Inventory pagination
                        inventory: {
                            total: totalInventoryCount,
                            page: inventoryPage,
                            limit: inventoryLimit,
                            totalPages: inventoryTotalPages,
                            hasNextPage: inventoryHasNextPage,
                            hasPrevPage: inventoryHasPrevPage,
                        },
                    },
                });
            }
            catch (error) {
                console.error("Error retrieving inventory report:", error);
                return res.status(500).json({
                    status: "error",
                    message: "Failed to retrieve inventory report",
                    error: error instanceof Error ? error.message : "Unknown error",
                });
            }
        });
    }
}
exports.ReportSuperAdmin = ReportSuperAdmin;
