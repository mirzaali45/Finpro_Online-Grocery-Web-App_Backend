import { PrismaClient } from "@prisma/client";
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

      // Validasi input
      if (!store_name || !address || !city || !province) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Periksa apakah store_name sudah ada
      const existingStore = await prisma.store.findFirst({
        where: { store_name },
      });

      if (existingStore) {
        return res.status(409).json({ error: "Store name already exists" });
      }

      // Periksa jika user_id dan koordinat diberikan
      if (user_id && latitude && longitude) {
        const existingUserStore = await prisma.store.findFirst({
          where: { user_id },
        });

        if (existingUserStore) {
          return res.status(409).json({ error: "User already has a store" });
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
          latitude: latitude || 0,
          longitude: longitude || 0,
          user_id: latitude && longitude ? user_id : null,
        },
      });

      return res.status(201).json({ message: "Store created successfully", store });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error creating store:", message);
      return res.status(500).json({ error: message });
    }
  }

  async getStores(req: Request, res: Response) {
    try {
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
      });

      return res.status(200).json(stores);
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

      if (!store_id) {
        return res.status(400).json({ error: "Invalid store_id" });
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

      // const existingUserStore = await prisma.store.findFirst({
      //   where: {
      //     user_id,
      //     store_id: { not: parseInt(store_id) },
      //   },
      // });

      // if (existingUserStore) {
      //   return res.status(409).json({ error: "User already has a store" });
      // }
      
      console.log("Store data before update:", JSON.stringify(req.body));

      const updateStore = await prisma.store.update({
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
          user_id: null,
        },
      });

      return res.status(201).json({ message: "Store created successfully", updateStore });
    } catch (error: unknown) {
      console.error("Update store error:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async deleteStore(req: Request, res: Response) {
    try {
      const { store_id } = req.params;
      
      await prisma.store.delete({
        where: { store_id: parseInt(store_id) },
      });
      
      return res.status(200).json({ message: "Store deleted successfully" });
    } catch (error: unknown) {
      const message =
      error instanceof Error ? error.message : "Unknown error occurred";
      console.log(message)
      return res.status(500).json({ error: message });
    }
  }
}