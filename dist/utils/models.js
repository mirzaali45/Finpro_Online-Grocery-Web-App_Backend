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
exports.calculateDistance = exports.checkProductAvailability = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
/**
 * Cek apakah stok produk "productId" mencukupi di keseluruhan store.
 * Mengembalikan total stok dari semua store. Jika stok < quantity, lempar error.
 */
const checkProductAvailability = (productId, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    // Cari stok produk di seluruh store (Inventory)
    const inventories = yield prisma.inventory.findMany({
        where: { product_id: productId },
    });
    let totalStock = 0;
    inventories.forEach((inv) => {
        totalStock += inv.qty; // Total stok dari seluruh store
    });
    if (totalStock < quantity) {
        throw new Error(`Stok produk dengan ID ${productId} tidak mencukupi. (required: ${quantity}, available: ${totalStock})`);
    }
    return true;
});
exports.checkProductAvailability = checkProductAvailability;
/**
 * Menghitung jarak antara dua titik (latitude, longitude) menggunakan rumus Haversine
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // radius bumi dalam KM
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
exports.calculateDistance = calculateDistance;
