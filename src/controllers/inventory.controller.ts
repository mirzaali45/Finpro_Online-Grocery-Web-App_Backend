import { PrismaClient } from "../../prisma/generated/client";
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
      const { store_id, page = "1" } = req.query;

      // Convert page to number and handle pagination
      const pageNumber = parseInt(page as string) || 1;
      const pageSize = 10;
      const skip = (pageNumber - 1) * pageSize;

      // Get total count for pagination metadata
      const totalCount = await prisma.inventory.count({
        where: store_id
          ? {
              store_id: parseInt(store_id as string),
            }
          : undefined,
      });

      // Get paginated inventory data
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
        skip,
        take: pageSize,
      });

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / pageSize);

      return res.status(200).json({
        data: inventory,
        pagination: {
          total: totalCount,
          page: pageNumber,
          pageSize,
          totalPages,
          hasNextPage: pageNumber < totalPages,
          hasPrevPage: pageNumber > 1,
        },
      });
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

  async updateStoreFrontInventory(req: Request, res: Response) {
    try {
      const { inv_id } = req.params;
      const { qty, operation } = req.body;

      const currentInventory = await prisma.inventory.findUnique({
        where: { inv_id: parseInt(inv_id) },
      });

      if (!currentInventory) {
        throw new Error("Inventory not found");
      }

      // Calculate new qty based on operation
      const newQty =
        operation === "add"
          ? currentInventory.qty + qty
          : currentInventory.qty - qty;

      // Check if we have enough stock in the warehouse
      if (newQty < 0) {
        throw new Error("Insufficient warehouse stock");
      }

      // Update only the qty (warehouse stock)
      const updatedInventory = await prisma.inventory.update({
        where: {
          inv_id: parseInt(inv_id),
        },
        data: {
          qty: newQty,
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

  async transferToStore(req: Request, res: Response) {
    try {
      const { inv_id } = req.params;
      const { transferAmount } = req.body;

      if (transferAmount <= 0) {
        throw new Error("Transfer amount must be greater than zero");
      }

      const currentInventory = await prisma.inventory.findUnique({
        where: { inv_id: parseInt(inv_id) },
      });

      if (!currentInventory) {
        throw new Error("Inventory not found");
      }

      // Check if warehouse has enough stock
      if (currentInventory.qty < transferAmount) {
        throw new Error("Insufficient warehouse stock for transfer");
      }

      // Update both qty (decrease) and total_qty (increase)
      const updatedInventory = await prisma.inventory.update({
        where: {
          inv_id: parseInt(inv_id),
        },
        data: {
          qty: currentInventory.qty - transferAmount, // Decrease warehouse stock
          total_qty: currentInventory.total_qty + transferAmount, // Increase store stock
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
