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

      const existingStore = await prisma.store.findUnique({
        where: { store_name },
      });

      if (existingStore) {
        throw new Error("Store name already exists");
      }

      if (user_id) {
        const existingUserStore = await prisma.store.findUnique({
          where: { user_id },
        });

        if (existingUserStore) {
          throw new Error("User already has a store");
        }
      }

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
          user_id,
        },
      });

      return res.status(201).json(store);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
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

      if (store_name) {
        const existingStore = await prisma.store.findFirst({
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
        const existingUserStore = await prisma.store.findFirst({
          where: {
            user_id,
            store_id: { not: parseInt(store_id) },
          },
        });

        if (existingUserStore) {
          throw new Error("User already has a store");
        }
      }

      const store = await prisma.store.update({
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
    } catch (error: unknown) {
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
      return res.status(500).json({ error: message });
    }
  }
}