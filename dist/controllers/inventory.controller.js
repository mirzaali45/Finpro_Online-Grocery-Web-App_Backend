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
exports.InventoryController = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
class InventoryController {
    createInventory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { store_id, product_id, qty } = req.body;
                const inventory = yield prisma.inventory.create({
                    data: {
                        store_id,
                        product_id,
                        qty,
                        total_qty: qty,
                    },
                });
                return res.status(201).json(inventory);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    getInventory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { store_id, page = "1" } = req.query;
                // Convert page to number and handle pagination
                const pageNumber = parseInt(page) || 1;
                const pageSize = 10;
                const skip = (pageNumber - 1) * pageSize;
                // Get total count for pagination metadata
                const totalCount = yield prisma.inventory.count({
                    where: store_id
                        ? {
                            store_id: parseInt(store_id),
                        }
                        : undefined,
                });
                // Get paginated inventory data
                const inventory = yield prisma.inventory.findMany({
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
                    skip,
                    take: pageSize,
                });
                // Calculate pagination metadata
                const totalPages = Math.ceil(totalCount / pageSize);
                return res.status(200).json({
                    data: inventory,
                    pagination: {
                        total: totalCount,
                        page: pageNumber,
                        pageSize,
                        totalPages,
                        hasNextPage: pageNumber < totalPages,
                        hasPrevPage: pageNumber > 1,
                    },
                });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    getInventoryById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { inv_id } = req.params;
                const inventory = yield prisma.inventory.findUnique({
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
                });
                if (!inventory) {
                    throw new Error("Inventory not found");
                }
                return res.status(200).json(inventory);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    updateInventory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { inv_id } = req.params;
                const { qty, operation } = req.body;
                const currentInventory = yield prisma.inventory.findUnique({
                    where: { inv_id: parseInt(inv_id) },
                });
                if (!currentInventory) {
                    throw new Error("Inventory not found");
                }
                const newQty = operation === "add"
                    ? currentInventory.qty + qty
                    : currentInventory.qty - qty;
                if (newQty < 0) {
                    throw new Error("Insufficient stock");
                }
                const updatedInventory = yield prisma.inventory.update({
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
                });
                return res.status(200).json(updatedInventory);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    deleteInventory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { inv_id } = req.params;
                yield prisma.inventory.delete({
                    where: {
                        inv_id: parseInt(inv_id),
                    },
                });
                return res
                    .status(200)
                    .json({ message: "Inventory deleted successfully" });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    // Get low stock products across all stores or specific store
    getLowStockProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { store_id, threshold = 10 } = req.query;
                const lowStockProducts = yield prisma.inventory.findMany({
                    where: Object.assign({ qty: {
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
                });
                return res.status(200).json(lowStockProducts);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
}
exports.InventoryController = InventoryController;
