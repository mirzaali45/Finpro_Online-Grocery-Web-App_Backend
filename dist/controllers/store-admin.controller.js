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
exports.StoreAdminController = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
class StoreAdminController {
    // View-only Product Management
    getProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const store = yield prisma.store.findFirst({
                    where: { user_id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
                });
                if (!store)
                    throw new Error("Store not found");
                const products = yield prisma.product.findMany({
                    where: { store_id: store.store_id },
                    include: {
                        category: true,
                        Inventory: true,
                        ProductImage: true,
                    },
                });
                return res.status(200).json(products);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    getProductById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { product_id } = req.params;
                const store = yield prisma.store.findFirst({
                    where: { user_id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id },
                });
                if (!store)
                    throw new Error("Store not found");
                const product = yield prisma.product.findFirst({
                    where: {
                        product_id: parseInt(product_id),
                        store_id: store.store_id,
                    },
                    include: {
                        category: true,
                        Inventory: true,
                        ProductImage: true,
                    },
                });
                if (!product)
                    throw new Error("Product not found");
                return res.status(200).json(product);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
}
exports.StoreAdminController = StoreAdminController;
