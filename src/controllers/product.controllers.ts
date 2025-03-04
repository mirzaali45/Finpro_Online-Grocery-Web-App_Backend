import { PrismaClient,Prisma } from "@prisma/client";
import { Request, Response } from "express";
import { generateSlug } from "../helpers/generateSlug";

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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const featured = req.query.featured === "true";
      const categoryId = req.query.categoryId
        ? parseInt(req.query.categoryId as string)
        : undefined;

      // Prepare where condition
      const whereCondition: Prisma.ProductWhereInput = {};

      // Add category filter if categoryId is provided
      if (categoryId) {
        whereCondition.category_id = categoryId;
      }

      // If featured, prioritize by price
      const products = await prisma.product.findMany({
        where: whereCondition,
        skip: featured ? 0 : (page - 1) * limit,
        take: limit,
        include: {
          store: true,
          category: true,
          Inventory: true,
          ProductImage: true,
        },
        orderBy: featured ? { price: "desc" } : { created_at: "desc" },
      });

      const totalProducts = await prisma.product.count({
        where: whereCondition,
      });

      const totalPages = Math.ceil(totalProducts / limit);

      return res.status(200).json({
        products,
        totalPages,
        currentPage: page,
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const { product_id } = req.params;

      const product = await prisma.product.findUnique({
        where: { product_id: parseInt(product_id) },
        include: {
          store: true,
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

  async getProductBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;

      const products = await prisma.product.findMany({
        include: {
          store: true,
          category: true,
          Inventory: true,
          ProductImage: true, // Include ProductImage relation
        },
      });
      const product = products.find((p) => generateSlug(p.name) === slug);

      if (!product) throw new Error("Product not found");

      return res.status(200).json(product);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }
}
