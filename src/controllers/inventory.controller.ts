import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class InventoryController {
  async createInventory(req: Request, res: Response) {
    try {
      const { store_id, product_id, qty } = req.body;

      const inventory = await prisma.inventory.create({
        data: {
          store_id,
          product_id,
          qty,
          total_qty: qty,
        },
      });

      return res.status(201).json(inventory);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async getInventory(req: Request, res: Response) {
    try {
      const { store_id } = req.query;

      const inventory = await prisma.inventory.findMany({
        where: store_id
          ? {
              store_id: parseInt(store_id as string),
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
      });

      return res.status(200).json(inventory);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async getInventoryById(req: Request, res: Response) {
    try {
      const { inv_id } = req.params;

      const inventory = await prisma.inventory.findUnique({
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
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async updateInventory(req: Request, res: Response) {
    try {
      const { inv_id } = req.params;
      const { qty, operation } = req.body;

      const currentInventory = await prisma.inventory.findUnique({
        where: { inv_id: parseInt(inv_id) },
      });

      if (!currentInventory) {
        throw new Error("Inventory not found");
      }

      const newQty =
        operation === "add"
          ? currentInventory.qty + qty
          : currentInventory.qty - qty;

      if (newQty < 0) {
        throw new Error("Insufficient stock");
      }

      const updatedInventory = await prisma.inventory.update({
        where: {
          inv_id: parseInt(inv_id),
        },
        data: {
          qty: newQty,
          total_qty:
            operation === "add"
              ? currentInventory.total_qty + qty
              : currentInventory.total_qty,
          updated_at: new Date(),
        },
      });

      return res.status(200).json(updatedInventory);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async deleteInventory(req: Request, res: Response) {
    try {
      const { inv_id } = req.params;

      await prisma.inventory.delete({
        where: {
          inv_id: parseInt(inv_id),
        },
      });

      return res
        .status(200)
        .json({ message: "Inventory deleted successfully" });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  // Get low stock products across all stores or specific store
  async getLowStockProducts(req: Request, res: Response) {
    try {
      const { store_id, threshold = 10 } = req.query;

      const lowStockProducts = await prisma.inventory.findMany({
        where: {
          qty: {
            lt: parseInt(threshold as string),
          },
          ...(store_id && { store_id: parseInt(store_id as string) }),
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

      return res.status(200).json(lowStockProducts);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }
}
