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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
=======
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                const storeId = req.query.storeId ? parseInt(req.query.storeId) : undefined;
                const productId = req.query.productId ? parseInt(req.query.productId) : undefined;
                const lowStock = req.query.lowStock === 'true';
                const threshold = req.query.threshold ? parseInt(req.query.threshold) : 5; // Default threshold
                // Build the filter object
                const filter = {};
<<<<<<< HEAD
<<<<<<< HEAD
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
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
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
<<<<<<< HEAD
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
=======
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                if (storeId) {
                    filter.store_id = storeId;
                }
                if (productId) {
                    filter.product_id = productId;
                }
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
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
<<<<<<< HEAD
>>>>>>> b0ae97aa709b9db278bccab6cdcf5c196ae71e70
=======
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
                    include: {
                        store: {
                            select: {
                                store_id: true,
                                store_name: true,
                                city: true,
<<<<<<< HEAD
<<<<<<< HEAD
                                province: true
                            }
=======
=======
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
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
<<<<<<< HEAD
=======
                // Get inventory data with related store and product information
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
=======
                // Get inventory data with related store and product information
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                const inventoryData = yield prisma.inventory.findMany({
                    where: filter,
=======
                const inventoryData = yield prisma.inventory.findMany({
                    where: inventoryFilter,
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
                    include: {
                        store: {
                            select: {
                                store_id: true,
                                store_name: true,
                                city: true,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                                province: true,
                            },
>>>>>>> b0ae97aa709b9db278bccab6cdcf5c196ae71e70
=======
                                province: true
                            }
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
=======
                                province: true
                            }
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
=======
                                province: true,
                            },
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
=======
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                                        category_name: true
                                    }
                                }
                            }
                        }
<<<<<<< HEAD
<<<<<<< HEAD
=======
                                        category_name: true,
                                    },
                                },
                            },
                        },
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
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
<<<<<<< HEAD
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
<<<<<<< HEAD
=======
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
                });
                // Calculate pagination metadata for stores
                const storeTotalPages = Math.ceil(totalStores / storeLimit);
                const storeHasNextPage = storePage < storeTotalPages;
                const storeHasPrevPage = storePage > 1;
                // Calculate pagination metadata for inventory
                const inventoryTotalPages = Math.ceil(totalInventoryCount / inventoryLimit);
                const inventoryHasNextPage = inventoryPage < inventoryTotalPages;
                const inventoryHasPrevPage = inventoryPage > 1;
<<<<<<< HEAD
>>>>>>> b0ae97aa709b9db278bccab6cdcf5c196ae71e70
=======
=======
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                    acc[storeId].totalItems += item.qty;
                    acc[storeId].totalValue += (item.qty * item.product.price);
                    acc[storeId].itemCount += 1;
                    return acc;
                }, {});
<<<<<<< HEAD
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
=======
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
=======
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
                // Return the response
                return res.status(200).json({
                    status: "success",
                    message: "Inventory report retrieved successfully",
                    data: {
                        overview: {
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
                            totalStores: Object.keys(storesSummary).length,
=======
                            totalStores, // Total count of ALL stores
                            displayedStores: allStores.length, // Count of stores on current page
                            storesWithInventory: Object.values(storesSummary).filter((s) => s.itemCount > 0).length,
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
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
<<<<<<< HEAD
                                name: item.store.store_name
<<<<<<< HEAD
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
=======
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
=======
                                name: item.store.store_name,
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
                            },
                            product: {
                                id: item.product_id,
                                name: item.product.name,
                                category: item.product.category.category_name,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                                price: item.product.price
=======
                                price: item.product.price,
>>>>>>> b0ae97aa709b9db278bccab6cdcf5c196ae71e70
=======
                                price: item.product.price
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
=======
                                price: item.product.price
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
=======
                                price: item.product.price,
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
                            },
                            current_quantity: item.qty,
                            total_quantity: item.total_qty,
                            stockValue: item.qty * item.product.price,
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                            lowStock: item.qty <= threshold
                        }))
                    }
=======
=======
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
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
<<<<<<< HEAD
>>>>>>> b0ae97aa709b9db278bccab6cdcf5c196ae71e70
=======
                            lowStock: item.qty <= threshold
                        }))
                    }
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
=======
                            lowStock: item.qty <= threshold
                        }))
                    }
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
=======
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
                });
            }
            catch (error) {
                console.error("Error retrieving inventory report:", error);
                return res.status(500).json({
                    status: "error",
                    message: "Failed to retrieve inventory report",
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
                    error: error instanceof Error ? error.message : "Unknown error"
=======
                    error: error instanceof Error ? error.message : "Unknown error",
>>>>>>> b0ae97aa709b9db278bccab6cdcf5c196ae71e70
=======
                    error: error instanceof Error ? error.message : "Unknown error"
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
=======
                    error: error instanceof Error ? error.message : "Unknown error"
>>>>>>> 61002e687c9e70025e37606d3111acf5333b5fde
=======
                    error: error instanceof Error ? error.message : "Unknown error",
>>>>>>> 506b755e4a59dae7458f61fc9b2766e5a49f0a90
                });
            }
        });
    }
}
exports.ReportSuperAdmin = ReportSuperAdmin;
