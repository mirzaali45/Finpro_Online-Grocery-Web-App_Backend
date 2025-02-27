import { PrismaClient, Role, OrderStatus } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class StoreAdminController {
  // View-only Product Management
  async getProducts(req: Request, res: Response) {
    try {
      const store = await prisma.store.findFirst({
        where: { user_id: req.user?.id },
      });
      if (!store) throw new Error("Store not found");

      const products = await prisma.product.findMany({
        where: { store_id: store.store_id },
        include: {
          category: true,
          Inventory: true,
          ProductImage: true,
        },
      });
      return res.status(200).json(products);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const { product_id } = req.params;
      const store = await prisma.store.findFirst({
        where: { user_id: req.user?.id },
      });
      if (!store) throw new Error("Store not found");

      const product = await prisma.product.findFirst({
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

      if (!product) throw new Error("Product not found");

      return res.status(200).json(product);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }
}
