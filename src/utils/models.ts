import { PrismaClient } from "../../prisma/generated/client";

const prisma = new PrismaClient();

/**
 * Cek apakah stok produk "productId" mencukupi di keseluruhan store.
 * Mengembalikan total stok dari semua store. Jika stok < quantity, lempar error.
 */
export const checkProductAvailability = async (
  productId: number,
  quantity: number
) => {
  // Cari stok produk di seluruh store (Inventory)
  const inventories = await prisma.inventory.findMany({
    where: { product_id: productId },
  });

  let totalStock = 0;
  inventories.forEach((inv) => {
    totalStock += inv.qty; // Total stok dari seluruh store
  });

  if (totalStock < quantity) {
    throw new Error(
      `Stok produk dengan ID ${productId} tidak mencukupi. (required: ${quantity}, available: ${totalStock})`
    );
  }

  return true;
};

/**
 * Menghitung jarak antara dua titik (latitude, longitude) menggunakan rumus Haversine
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // radius bumi dalam KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
