import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class ProductController {
  async createProduct(req: Request, res: Response) {
    try {
      const {
        store_id,
        name,
        description,
        price,
        category_id,
        initial_quantity,
      } = req.body;

      const product = await prisma.$transaction(async (tx) => {
        const newProduct = await tx.product.create({
          data: {
            store_id,
            name,
            description,
            price,
            category_id,
          },
        });

        if (initial_quantity) {
          await tx.inventory.create({
            data: {
              store_id,
              product_id: newProduct.product_id,
              qty: initial_quantity,
              total_qty: initial_quantity,
            },
          });
        }

        return newProduct;
      });

      return res.status(201).json(product);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async updateProduct(req: Request, res: Response) {
    try {
      const { product_id } = req.params;
      const { name, description, price, category_id } = req.body;

      const product = await prisma.product.update({
        where: {
          product_id: parseInt(product_id),
        },
        data: {
          name,
          description,
          price,
          category_id,
        },
      });
      return res.status(200).json(product);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async deleteProduct(req: Request, res: Response) {
    try {
      const { product_id } = req.params;


      await prisma.inventory.deleteMany({
        where: {
          product_id: parseInt(product_id),
        },
      });
      await prisma.productImage.deleteMany({
        where: {
          product_id: parseInt(product_id),
        },
      });

      // Finally delete the product
      await prisma.product.delete({
        where: {
          product_id: parseInt(product_id),
        },
      });

      return res.status(200).json({ message: "Product deleted successfully" });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async getProducts(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany({
        include: {
          store:true,
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

      const product = await prisma.product.findUnique({
        where: { product_id: parseInt(product_id) },
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
