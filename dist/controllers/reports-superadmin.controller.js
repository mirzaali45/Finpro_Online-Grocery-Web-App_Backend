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
exports.ReportSuperAdmin = void 0;
var client_1 = require("../../prisma/generated/client");
var prisma = new client_1.PrismaClient();
var ReportSuperAdmin = /** @class */ (function () {
    function ReportSuperAdmin() {
    }
    ReportSuperAdmin.prototype.getReportInventorySuperAdmin = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var storeId, productId, lowStock, threshold_1, storePage, storeLimit, storeSkip, inventoryPage, inventoryLimit, inventorySkip, storeFilter, totalStores, allStores, storeIds, inventoryFilter, totalInventoryCount, allInventoryItems, inventorySummaryData, filteredSummaryInventory, inventoryData, filteredInventory, totalItems, totalValue, storesSummary_1, storeTotalPages, storeHasNextPage, storeHasPrevPage, inventoryTotalPages, inventoryHasNextPage, inventoryHasPrevPage, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        storeId = req.query.storeId
                            ? parseInt(req.query.storeId)
                            : undefined;
                        productId = req.query.productId
                            ? parseInt(req.query.productId)
                            : undefined;
                        lowStock = req.query.lowStock === "true";
                        threshold_1 = req.query.threshold
                            ? parseInt(req.query.threshold)
                            : 5;
                        storePage = Number(req.query.storePage) || 1;
                        storeLimit = Number(req.query.storeLimit) || 10;
                        storeSkip = (storePage - 1) * storeLimit;
                        inventoryPage = Number(req.query.page) || 1;
                        inventoryLimit = Number(req.query.limit) || 10;
                        inventorySkip = (inventoryPage - 1) * inventoryLimit;
                        storeFilter = {};
                        if (storeId) {
                            storeFilter.store_id = storeId;
                        }
                        return [4 /*yield*/, prisma.store.count({
                                where: storeFilter,
                            })];
                    case 1:
                        totalStores = _a.sent();
                        return [4 /*yield*/, prisma.store.findMany({
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
                            })];
                    case 2:
                        allStores = _a.sent();
                        storeIds = allStores.map(function (store) { return store.store_id; });
                        inventoryFilter = {};
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
                        return [4 /*yield*/, prisma.inventory.count({
                                where: inventoryFilter,
                            })];
                    case 3:
                        totalInventoryCount = _a.sent();
                        if (!lowStock) return [3 /*break*/, 5];
                        return [4 /*yield*/, prisma.inventory.findMany({
                                where: inventoryFilter,
                                select: { qty: true },
                            })];
                    case 4:
                        allInventoryItems = _a.sent();
                        // Filter for low stock and count
                        totalInventoryCount = allInventoryItems.filter(function (item) { return item.qty <= threshold_1; }).length;
                        _a.label = 5;
                    case 5: return [4 /*yield*/, prisma.inventory.findMany({
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
                        })];
                    case 6:
                        inventorySummaryData = _a.sent();
                        filteredSummaryInventory = lowStock
                            ? inventorySummaryData.filter(function (item) { return item.qty <= threshold_1; })
                            : inventorySummaryData;
                        return [4 /*yield*/, prisma.inventory.findMany({
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
                            })];
                    case 7:
                        inventoryData = _a.sent();
                        filteredInventory = lowStock
                            ? inventoryData.filter(function (item) { return item.qty <= threshold_1; })
                            : inventoryData;
                        totalItems = filteredSummaryInventory.reduce(function (sum, item) { return sum + item.qty; }, 0);
                        totalValue = filteredSummaryInventory.reduce(function (sum, item) { return sum + item.qty * item.product.price; }, 0);
                        storesSummary_1 = {};
                        // First, add all stores with zero values
                        allStores.forEach(function (store) {
                            storesSummary_1[store.store_id] = {
                                store_id: store.store_id,
                                store_name: store.store_name,
                                location: "".concat(store.city || "", ", ").concat(store.province || "").trim(),
                                totalItems: 0,
                                totalValue: 0,
                                itemCount: 0,
                            };
                        });
                        // Then update with inventory summary data
                        filteredSummaryInventory.forEach(function (item) {
                            // Only include if this store is on the current page
                            if (storesSummary_1[item.store_id]) {
                                storesSummary_1[item.store_id].totalItems += item.qty;
                                storesSummary_1[item.store_id].totalValue +=
                                    item.qty * item.product.price;
                                storesSummary_1[item.store_id].itemCount += 1;
                            }
                        });
                        storeTotalPages = Math.ceil(totalStores / storeLimit);
                        storeHasNextPage = storePage < storeTotalPages;
                        storeHasPrevPage = storePage > 1;
                        inventoryTotalPages = Math.ceil(totalInventoryCount / inventoryLimit);
                        inventoryHasNextPage = inventoryPage < inventoryTotalPages;
                        inventoryHasPrevPage = inventoryPage > 1;
                        // Return the response
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                message: "Inventory report retrieved successfully",
                                data: {
                                    overview: {
                                        totalStores: totalStores, // Total count of ALL stores
                                        displayedStores: allStores.length, // Count of stores on current page
                                        storesWithInventory: Object.values(storesSummary_1).filter(function (s) { return s.itemCount > 0; }).length,
                                        totalItems: totalItems,
                                        totalValue: totalValue,
                                        averageItemsPerStore: totalItems /
                                            Math.max(1, Object.values(storesSummary_1).filter(function (s) { return s.itemCount > 0; })
                                                .length),
                                    },
                                    storesSummary: Object.values(storesSummary_1),
                                    inventory: filteredInventory.map(function (item) { return ({
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
                                        lowStock: item.qty <= threshold_1,
                                    }); }),
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
                            })];
                    case 8:
                        error_1 = _a.sent();
                        console.error("Error retrieving inventory report:", error_1);
                        return [2 /*return*/, res.status(500).json({
                                status: "error",
                                message: "Failed to retrieve inventory report",
                                error: error_1 instanceof Error ? error_1.message : "Unknown error",
                            })];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return ReportSuperAdmin;
}());
exports.ReportSuperAdmin = ReportSuperAdmin;
