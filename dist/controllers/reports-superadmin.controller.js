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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                const storeId = req.query.storeId ? parseInt(req.query.storeId) : undefined;
                const productId = req.query.productId ? parseInt(req.query.productId) : undefined;
                const lowStock = req.query.lowStock === 'true';
                const threshold = req.query.threshold ? parseInt(req.query.threshold) : 5; // Default threshold
                // Build the filter object
                const filter = {};
<<<<<<< HEAD
                if (storeId) {
                    filter.store_id = storeId;
                }
                if (productId) {
                    filter.product_id = productId;
                }
                // Get inventory data with related store and product information
                const inventoryData = yield prisma.inventory.findMany({
                    where: filter,
=======
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
=======
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                if (storeId) {
                    filter.store_id = storeId;
                }
                if (productId) {
                    filter.product_id = productId;
                }
<<<<<<< HEAD
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
>>>>>>> b0ae97aa709b9db278bccab6cdcf5c196ae71e70
                    include: {
                        store: {
                            select: {
                                store_id: true,
                                store_name: true,
                                city: true,
<<<<<<< HEAD
                                province: true
                            }
=======
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
=======
                // Get inventory data with related store and product information
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                const inventoryData = yield prisma.inventory.findMany({
                    where: filter,
                    include: {
                        store: {
                            select: {
                                store_id: true,
                                store_name: true,
                                city: true,
<<<<<<< HEAD
                                province: true,
                            },
>>>>>>> b0ae97aa709b9db278bccab6cdcf5c196ae71e70
=======
                                province: true
                            }
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                        },
                        product: {
                            select: {
                                product_id: true,
                                name: true,
                                price: true,
                                category: {
                                    select: {
                                        category_id: true,
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                                        category_name: true
                                    }
                                }
                            }
                        }
<<<<<<< HEAD
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
=======
                                        category_name: true,
                                    },
                                },
                            },
                        },
=======
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
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
<<<<<<< HEAD
                });
                // Calculate pagination metadata for stores
                const storeTotalPages = Math.ceil(totalStores / storeLimit);
                const storeHasNextPage = storePage < storeTotalPages;
                const storeHasPrevPage = storePage > 1;
                // Calculate pagination metadata for inventory
                const inventoryTotalPages = Math.ceil(totalInventoryCount / inventoryLimit);
                const inventoryHasNextPage = inventoryPage < inventoryTotalPages;
                const inventoryHasPrevPage = inventoryPage > 1;
>>>>>>> b0ae97aa709b9db278bccab6cdcf5c196ae71e70
=======
                    acc[storeId].totalItems += item.qty;
                    acc[storeId].totalValue += (item.qty * item.product.price);
                    acc[storeId].itemCount += 1;
                    return acc;
                }, {});
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                // Return the response
                return res.status(200).json({
                    status: "success",
                    message: "Inventory report retrieved successfully",
                    data: {
                        overview: {
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
                            totalStores, // Total count of ALL stores
                            displayedStores: allStores.length, // Count of stores on current page
                            storesWithInventory: Object.values(storesSummary).filter((s) => s.itemCount > 0).length,
=======
                            totalStores: Object.keys(storesSummary).length,
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                            totalItems,
                            totalValue,
                            averageItemsPerStore: totalItems / Math.max(1, Object.keys(storesSummary).length)
                        },
                        storesSummary: Object.values(storesSummary),
                        inventory: filteredInventory.map(item => ({
                            inventory_id: item.inv_id,
                            store: {
                                id: item.store_id,
<<<<<<< HEAD
                                name: item.store.store_name,
>>>>>>> b0ae97aa709b9db278bccab6cdcf5c196ae71e70
=======
                                name: item.store.store_name
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                            },
                            product: {
                                id: item.product_id,
                                name: item.product.name,
                                category: item.product.category.category_name,
<<<<<<< HEAD
<<<<<<< HEAD
                                price: item.product.price
=======
                                price: item.product.price,
>>>>>>> b0ae97aa709b9db278bccab6cdcf5c196ae71e70
=======
                                price: item.product.price
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                            },
                            current_quantity: item.qty,
                            total_quantity: item.total_qty,
                            stockValue: item.qty * item.product.price,
<<<<<<< HEAD
<<<<<<< HEAD
                            lowStock: item.qty <= threshold
                        }))
                    }
=======
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
>>>>>>> b0ae97aa709b9db278bccab6cdcf5c196ae71e70
=======
                            lowStock: item.qty <= threshold
                        }))
                    }
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                });
            }
            catch (error) {
                console.error("Error retrieving inventory report:", error);
                return res.status(500).json({
                    status: "error",
                    message: "Failed to retrieve inventory report",
<<<<<<< HEAD
<<<<<<< HEAD
                    error: error instanceof Error ? error.message : "Unknown error"
=======
                    error: error instanceof Error ? error.message : "Unknown error",
>>>>>>> b0ae97aa709b9db278bccab6cdcf5c196ae71e70
=======
                    error: error instanceof Error ? error.message : "Unknown error"
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                });
            }
        });
    }
}
exports.ReportSuperAdmin = ReportSuperAdmin;