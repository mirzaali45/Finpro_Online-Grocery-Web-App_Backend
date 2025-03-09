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
exports.GetStoreCustomer = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
class GetStoreCustomer {
    getStoreById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { store_id } = req.params;
                // Get pagination parameters from query
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 8;
                const skip = (page - 1) * limit;
                // Convert store_id to integer
                const storeId = parseInt(store_id, 10);
                if (isNaN(storeId)) {
                    res.status(400).json({
                        status: "error",
                        message: "Invalid store ID format",
                    });
                    return;
                }
                // Get total product count for pagination
                const totalProducts = yield prisma.product.count({
                    where: {
                        store_id: storeId,
                    },
                });
                const store = yield prisma.store.findUnique({
                    where: {
                        store_id: storeId,
                    },
                    include: {
                        User: {
                            select: {
                                user_id: true,
                                avatar: true,
                                first_name: true,
                                last_name: true,
                                username: true,
                            },
                        },
                        Product: {
                            select: {
                                product_id: true,
                                name: true,
                                price: true,
                                ProductImage: {
                                    take: 1, // Only get primary image
                                },
                            },
                            skip: skip,
                            take: limit, // Use the limit from query params
                        },
                    },
                });
                if (!store) {
                    res.status(404).json({
                        status: "error",
                        message: "Store not found",
                    });
                    return;
                }
                res.status(200).json({
                    status: "success",
                    data: store,
                    pagination: {
                        total: totalProducts,
                        page,
                        limit,
                        pages: Math.ceil(totalProducts / limit),
                    },
                });
            }
            catch (error) {
                console.error("Error fetching store:", error);
                res.status(500).json({
                    status: "error",
                    message: "An error occurred while fetching the store",
                });
            }
        });
    }
    getAllStores(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                // Get total count for pagination
                const totalStores = yield prisma.store.count();
                // Fetch stores with owner details
                const stores = yield prisma.store.findMany({
                    skip,
                    take: limit,
                    include: {
                        User: {
                            select: {
                                avatar: true,
                                username: true,
                            },
                        },
                        Product: {
                            select: {
                                product_id: true,
                                name: true,
                            },
                            take: 3, // Just a preview of products
                        },
                    },
                });
                res.status(200).json({
                    status: "success",
                    data: stores,
                    pagination: {
                        total: totalStores,
                        page,
                        limit,
                        pages: Math.ceil(totalStores / limit),
                    },
                });
            }
            catch (error) {
                console.error("Error fetching stores:", error);
                res.status(500).json({
                    status: "error",
                    message: "An error occurred while fetching stores",
                });
            }
        });
    }
    searchStores(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { query } = req.query;
                if (!query || typeof query !== "string") {
                    res.status(400).json({
                        status: "error",
                        message: "Search query is required",
                    });
                    return;
                }
                const stores = yield prisma.store.findMany({
                    where: {
                        store_name: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    include: {
                        User: {
                            select: {
                                avatar: true,
                            },
                        },
                    },
                });
                res.status(200).json({
                    status: "success",
                    data: stores,
                });
            }
            catch (error) {
                console.error("Error searching stores:", error);
                res.status(500).json({
                    status: "error",
                    message: "An error occurred while searching stores",
                });
            }
        });
    }
}
exports.GetStoreCustomer = GetStoreCustomer;
