import { PrismaClient } from "../../prisma/generated/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class StoreController {
  async createStore(req: Request, res: Response) {
    try {
      const {
        store_name,
        address,
        subdistrict,
        city,
        province,
        postcode,
        latitude,
        longitude,
        user_id,
      } = req.body;

      const currentUser = req.user;
      const isSuperAdmin = currentUser?.role === "super_admin";
      const userId = user_id ? Number(user_id) : null;

      if (userId && isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      // Cek apakah nama store sudah digunakan
      const existingStore = await prisma.store.findUnique({
        where: { store_name },
      });

      if (existingStore) {
        return res.status(400).json({ error: "Store name already exists" });
      }

      // Jika ada user_id (store_admin) yang akan di-assign, cek apakah sudah punya store
      if (userId) {
        const assignedUser = await prisma.store.findFirst({
          where: { user_id: userId },
        });

        if (assignedUser) {
          return res
            .status(400)
            .json({ error: "User already owns another store" });
        }
      }

      // Buat store baru
      const store = await prisma.store.create({
        data: {
          store_name,
          address,
          subdistrict,
          city,
          province,
          postcode,
          latitude,
          longitude,
          user_id: userId, // Super Admin boleh meng-assign user_id, tapi hanya sekali
        },
      });

      return res.status(201).json(store);
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async getStores(req: Request, res: Response) {
    try {
      // Extract pagination parameters from query
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Get total count of stores
      const totalStores = await prisma.store.count();

      // Get paginated stores
      const stores = await prisma.store.findMany({
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
        skip,
        take: limit,
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalStores / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Return paginated response
      return res.status(200).json({
        status: "success",
        data: stores,
        pagination: {
          total: totalStores,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async getStoreById(req: Request, res: Response) {
    try {
      const { store_id } = req.params;

      const store = await prisma.store.findUnique({
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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async updateStore(req: Request, res: Response) {
    try {
      const { store_id } = req.params;
      if (!store_id || isNaN(Number(store_id))) {
        return res.status(400).json({ error: "Invalid store ID" });
      }

      const {
        store_name,
        address,
        subdistrict,
        city,
        province,
        postcode,
        latitude,
        longitude,
        user_id,
      } = req.body;

      const storeIdNum = Number(store_id);
      const userIdNum =
        user_id !== undefined
          ? user_id === null
            ? null
            : Number(user_id)
          : undefined;
      const currentUser = req.user;

      if (!currentUser) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const isSuperAdmin = currentUser.role === "super_admin";

      if (userIdNum !== undefined && userIdNum !== null && isNaN(userIdNum)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      // Cek apakah store dengan ID tersebut ada
      const existingStore = await prisma.store.findUnique({
        where: { store_id: storeIdNum },
      });

      if (!existingStore) {
        return res.status(404).json({ error: "Store not found" });
      }

      // Siapkan data untuk update
      const updateData: any = {
        ...(store_name && { store_name }),
        ...(address && { address }),
        ...(subdistrict && { subdistrict }),
        ...(city && { city }),
        ...(province && { province }),
        ...(postcode && { postcode }),
        ...(latitude && { latitude: Number(latitude) }),
        ...(longitude && { longitude: Number(longitude) }),
      };

      // Hanya lakukan pengecekan `user_id` jika diubah dalam request
      if (userIdNum !== undefined && userIdNum !== existingStore.user_id) {
        // Super Admin boleh update user_id
        if (!isSuperAdmin) {
          return res
            .status(403)
            .json({ error: "You are not authorized to change store owner" });
        }

        // Cek apakah user sudah memiliki store lain (kecuali store yang sedang diupdate)
        if (userIdNum !== null) {
          const existingUserStore = await prisma.store.findFirst({
            where: {
              user_id: userIdNum,
              NOT: { store_id: storeIdNum }, //
            },
          });

          if (existingUserStore) {
            return res
              .status(400)
              .json({ error: "User already assigned to another store" });
          }
        }

        // Tambahkan perubahan user_id ke data update
        updateData.user_id = userIdNum;
      }

      // Update store dengan data yang sudah disiapkan
      const updatedStore = await prisma.store.update({
        where: { store_id: storeIdNum },
        data: updateData,
      });

      return res.status(200).json(updatedStore);
    } catch (error: unknown) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async deleteStore(req: Request, res: Response) {
    try {
      const { store_id } = req.params;

      // Validasi store_id harus berupa angka
      const storeIdNum = Number(store_id);
      if (isNaN(storeIdNum)) {
        return res.status(400).json({ error: "Invalid store ID" });
      }

      // Cek apakah store dengan ID tersebut ada
      const existingStore = await prisma.store.findUnique({
        where: { store_id: storeIdNum },
      });

      if (!existingStore) {
        return res.status(404).json({ error: "Store not found" });
      }

      // Hapus store
      await prisma.store.delete({
        where: { store_id: storeIdNum },
      });

      return res.status(200).json({ message: "Store deleted successfully" });
    } catch (error: unknown) {
      console.error("❌ Error deleting store:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }
}
