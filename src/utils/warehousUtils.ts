// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// // Fungsi menghitung jarak dengan Haversine Formula
// const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
//     const R = 6371; // Radius bumi dalam km
//     const dLat = (lat2 - lat1) * (Math.PI / 180);
//     const dLon = (lon2 - lon1) * (Math.PI / 180);
//     const a =
//         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//         Math.cos(lat1 * (Math.PI / 180)) *
//             Math.cos(lat2 * (Math.PI / 180)) *
//             Math.sin(dLon / 2) *
//             Math.sin(dLon / 2);
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//     return R * c; // Jarak dalam km
// };

// export const findNearestWarehouse = async (lat: number, lon: number) => {
//     const warehouses = await prisma.warehouse.findMany();
//     let nearest = warehouses[0];
//     let minDistance = calculateDistance(lat, lon, nearest.latitude, nearest.longitude);

//     warehouses.forEach((warehouse) => {
//         const distance = calculateDistance(lat, lon, warehouse.latitude, warehouse.longitude);
//         if (distance < minDistance) {
//             nearest = warehouse;
//             minDistance = distance;
//         }
//     });

//     return nearest;
// };
