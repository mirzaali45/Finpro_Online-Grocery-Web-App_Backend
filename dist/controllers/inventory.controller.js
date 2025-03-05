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
exports.InventoryController = void 0;
var client_1 = require("../../prisma/generated/client");
var prisma = new client_1.PrismaClient();
var InventoryController = /** @class */ (function () {
    function InventoryController() {
    }
    InventoryController.prototype.createInventory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, store_id, product_id, qty, inventory, error_1, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, store_id = _a.store_id, product_id = _a.product_id, qty = _a.qty;
                        return [4 /*yield*/, prisma.inventory.create({
                                data: {
                                    store_id: store_id,
                                    product_id: product_id,
                                    qty: qty,
                                    total_qty: qty,
                                },
                            })];
                    case 1:
                        inventory = _b.sent();
                        return [2 /*return*/, res.status(201).json(inventory)];
                    case 2:
                        error_1 = _b.sent();
                        message = error_1 instanceof Error ? error_1.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    InventoryController.prototype.getInventory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, store_id, _b, page, pageNumber, pageSize, skip, totalCount, inventory, totalPages, error_2, message;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        _a = req.query, store_id = _a.store_id, _b = _a.page, page = _b === void 0 ? "1" : _b;
                        pageNumber = parseInt(page) || 1;
                        pageSize = 10;
                        skip = (pageNumber - 1) * pageSize;
                        return [4 /*yield*/, prisma.inventory.count({
                                where: store_id
                                    ? {
                                        store_id: parseInt(store_id),
                                    }
                                    : undefined,
                            })];
                    case 1:
                        totalCount = _c.sent();
                        return [4 /*yield*/, prisma.inventory.findMany({
                                where: store_id
                                    ? {
                                        store_id: parseInt(store_id),
                                    }
                                    : undefined,
                                include: {
                                    product: {
                                        include: {
                                            category: true,
                                        },
                                    },
                                    store: {
                                        select: {
                                            store_name: true,
                                            city: true,
                                        },
                                    },
                                },
                                skip: skip,
                                take: pageSize,
                            })];
                    case 2:
                        inventory = _c.sent();
                        totalPages = Math.ceil(totalCount / pageSize);
                        return [2 /*return*/, res.status(200).json({
                                data: inventory,
                                pagination: {
                                    total: totalCount,
                                    page: pageNumber,
                                    pageSize: pageSize,
                                    totalPages: totalPages,
                                    hasNextPage: pageNumber < totalPages,
                                    hasPrevPage: pageNumber > 1,
                                },
                            })];
                    case 3:
                        error_2 = _c.sent();
                        message = error_2 instanceof Error ? error_2.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    InventoryController.prototype.getInventoryById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var inv_id, inventory, error_3, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        inv_id = req.params.inv_id;
                        return [4 /*yield*/, prisma.inventory.findUnique({
                                where: {
                                    inv_id: parseInt(inv_id),
                                },
                                include: {
                                    product: {
                                        include: {
                                            category: true,
                                        },
                                    },
                                    store: {
                                        select: {
                                            store_name: true,
                                            city: true,
                                        },
                                    },
                                },
                            })];
                    case 1:
                        inventory = _a.sent();
                        if (!inventory) {
                            throw new Error("Inventory not found");
                        }
                        return [2 /*return*/, res.status(200).json(inventory)];
                    case 2:
                        error_3 = _a.sent();
                        message = error_3 instanceof Error ? error_3.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    InventoryController.prototype.updateInventory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var inv_id, _a, qty, operation, currentInventory, newQty, updatedInventory, error_4, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        inv_id = req.params.inv_id;
                        _a = req.body, qty = _a.qty, operation = _a.operation;
                        return [4 /*yield*/, prisma.inventory.findUnique({
                                where: { inv_id: parseInt(inv_id) },
                            })];
                    case 1:
                        currentInventory = _b.sent();
                        if (!currentInventory) {
                            throw new Error("Inventory not found");
                        }
                        newQty = operation === "add"
                            ? currentInventory.qty + qty
                            : currentInventory.qty - qty;
                        if (newQty < 0) {
                            throw new Error("Insufficient stock");
                        }
                        return [4 /*yield*/, prisma.inventory.update({
                                where: {
                                    inv_id: parseInt(inv_id),
                                },
                                data: {
                                    qty: newQty,
                                    total_qty: operation === "add"
                                        ? currentInventory.total_qty + qty
                                        : currentInventory.total_qty,
                                    updated_at: new Date(),
                                },
                            })];
                    case 2:
                        updatedInventory = _b.sent();
                        return [2 /*return*/, res.status(200).json(updatedInventory)];
                    case 3:
                        error_4 = _b.sent();
                        message = error_4 instanceof Error ? error_4.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    InventoryController.prototype.deleteInventory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var inv_id, error_5, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        inv_id = req.params.inv_id;
                        return [4 /*yield*/, prisma.inventory.delete({
                                where: {
                                    inv_id: parseInt(inv_id),
                                },
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, res
                                .status(200)
                                .json({ message: "Inventory deleted successfully" })];
                    case 2:
                        error_5 = _a.sent();
                        message = error_5 instanceof Error ? error_5.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Get low stock products across all stores or specific store
    InventoryController.prototype.getLowStockProducts = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, store_id, _b, threshold, lowStockProducts, error_6, message;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _a = req.query, store_id = _a.store_id, _b = _a.threshold, threshold = _b === void 0 ? 10 : _b;
                        return [4 /*yield*/, prisma.inventory.findMany({
                                where: __assign({ qty: {
                                        lt: parseInt(threshold),
                                    } }, (store_id && { store_id: parseInt(store_id) })),
                                include: {
                                    product: {
                                        include: {
                                            category: true,
                                        },
                                    },
                                    store: {
                                        select: {
                                            store_name: true,
                                            city: true,
                                        },
                                    },
                                },
                            })];
                    case 1:
                        lowStockProducts = _c.sent();
                        return [2 /*return*/, res.status(200).json(lowStockProducts)];
                    case 2:
                        error_6 = _c.sent();
                        message = error_6 instanceof Error ? error_6.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return InventoryController;
}());
exports.InventoryController = InventoryController;
