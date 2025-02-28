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
exports.StoreController = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
class StoreController {
    createStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { store_name, address, subdistrict, city, province, postcode, latitude, longitude, user_id, } = req.body;
                const existingStore = yield prisma.store.findUnique({
                    where: { store_name },
                });
                if (existingStore) {
                    throw new Error("Store name already exists");
                }
                if (user_id) {
                    const existingUserStore = yield prisma.store.findUnique({
                        where: { user_id },
                    });
                    if (existingUserStore) {
                        throw new Error("User already has a store");
                    }
                }
                const store = yield prisma.store.create({
                    data: {
                        store_name,
                        address,
                        subdistrict,
                        city,
                        province,
                        postcode,
                        latitude,
                        longitude,
                        user_id,
                    },
                });
                return res.status(201).json(store);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    getStores(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stores = yield prisma.store.findMany({
                    include: {
                        User: {
                            select: {
                                email: true,
                                username: true,
                                phone: true,
                            },
                        },
                        Product: true,
                        Inventory: true,
                    },
                });
                return res.status(200).json(stores);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    getStoreById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { store_id } = req.params;
                const store = yield prisma.store.findUnique({
                    where: { store_id: parseInt(store_id) },
                    include: {
                        User: {
                            select: {
                                email: true,
                                username: true,
                                phone: true,
                            },
                        },
                        Product: true,
                        Inventory: true,
                    },
                });
                if (!store) {
                    throw new Error("Store not found");
                }
                return res.status(200).json(store);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    updateStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { store_id } = req.params;
                const { store_name, address, subdistrict, city, province, postcode, latitude, longitude, user_id, } = req.body;
                if (store_name) {
                    const existingStore = yield prisma.store.findFirst({
                        where: {
                            store_name,
                            store_id: { not: parseInt(store_id) },
                        },
                    });
                    if (existingStore) {
                        throw new Error("Store name already exists");
                    }
                }
                if (user_id) {
                    const existingUserStore = yield prisma.store.findFirst({
                        where: {
                            user_id,
                            store_id: { not: parseInt(store_id) },
                        },
                    });
                    if (existingUserStore) {
                        throw new Error("User already has a store");
                    }
                }
                const store = yield prisma.store.update({
                    where: { store_id: parseInt(store_id) },
                    data: {
                        store_name,
                        address,
                        subdistrict,
                        city,
                        province,
                        postcode,
                        latitude,
                        longitude,
                        user_id,
                    },
                });
                return res.status(200).json(store);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    deleteStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { store_id } = req.params;
                yield prisma.store.delete({
                    where: { store_id: parseInt(store_id) },
                });
                return res.status(200).json({ message: "Store deleted successfully" });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
}
exports.StoreController = StoreController;
