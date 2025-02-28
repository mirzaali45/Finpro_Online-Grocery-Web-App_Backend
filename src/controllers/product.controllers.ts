import { PrismaClient, Prisma } from "../../prisma/generated/client";
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
      const minPrice = req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined;
      const maxPrice = req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined;

      // Prepare where condition
      const whereCondition: Prisma.ProductWhereInput = {};

      // Add category filter if categoryId is provided
      if (categoryId) {
        whereCondition.category_id = categoryId;
      }

      // Add price range filter if min or max price is provided
      if (minPrice !== undefined || maxPrice !== undefined) {
        whereCondition.price = {};

        if (minPrice !== undefined) {
          whereCondition.price.gte = minPrice;
        }

        if (maxPrice !== undefined) {
          whereCondition.price.lte = maxPrice;
        }
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
          Discount: true,
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

  async getDiscountedProducts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const categoryId = req.query.categoryId
        ? parseInt(req.query.categoryId as string)
        : undefined;
      const minPrice = req.query.minPrice
        ? parseFloat(req.query.minPrice as string)
        : undefined;
      const maxPrice = req.query.maxPrice
        ? parseFloat(req.query.maxPrice as string)
        : undefined;

      // Prepare where condition
      const whereCondition: Prisma.ProductWhereInput = {
        Discount: {
          some: {}, // Only products with discounts
        },
      };

      // Add other filters
      if (categoryId) {
        whereCondition.category_id = categoryId;
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        whereCondition.price = {};
        if (minPrice !== undefined) whereCondition.price.gte = minPrice;
        if (maxPrice !== undefined) whereCondition.price.lte = maxPrice;
      }

      const products = await prisma.product.findMany({
        where: whereCondition,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          store: true,
          category: true,
          Inventory: true,
          ProductImage: true,
          Discount: true,
        },
        orderBy: { created_at: "desc" },
      });

      const totalProducts = await prisma.product.count({
        where: whereCondition,
      });

      return res.status(200).json({
        products,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
      });
    } catch (error) {
      console.error("Error fetching discounted products:", error);
      return res
        .status(500)
        .json({ error: "Failed to fetch discounted products" });
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
          ProductImage: true,
          Discount: true, 
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
  async getProductsByStore(req: Request, res: Response): Promise<void> {
    try {
      // Get user from authenticated token
      const user = req.user;

      // Find store associated with the user
      const store = await prisma.store.findUnique({
        where: { user_id: user?.id },
      });

      if (!store) {
        res.status(404).json({
          success: false,
          message: "No store found for this user",
        });
        return;
      }

      const {
        page = 1,
        limit = 10,
        categoryId,
        minPrice,
        maxPrice,
        search,
      } = req.query;

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const offset = (pageNum - 1) * limitNum;

      // Build where condition dynamically
      const whereCondition: any = {
        store_id: store.store_id,
      };

      // Optional filters
      if (categoryId) {
        whereCondition.category_id = Number(categoryId);
      }

      if (minPrice || maxPrice) {
        whereCondition.price = {};
        if (minPrice) whereCondition.price.gte = Number(minPrice);
        if (maxPrice) whereCondition.price.lte = Number(maxPrice);
      }

      if (search) {
        whereCondition.OR = [
          { name: { contains: String(search), mode: "insensitive" } },
          { description: { contains: String(search), mode: "insensitive" } },
        ];
      }

      // Fetch products with pagination and include related info
      const products = await prisma.product.findMany({
        where: whereCondition,
        include: {
          category: true,
          Inventory: true,
          ProductImage: {
            take: 1, // Get first image
          },
        },
        take: limitNum,
        skip: offset,
        orderBy: {
          created_at: "desc",
        },
      });

      // Count total products for pagination
      const totalProducts = await prisma.product.count({
        where: whereCondition,
      });

      res.status(200).json({
        success: true,
        data: products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalProducts,
          totalPages: Math.ceil(totalProducts / limitNum),
        },
      });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch products",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
}
