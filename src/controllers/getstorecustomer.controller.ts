import { PrismaClient } from "../../prisma/generated/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class GetStoreCustomer {
  async getStoreById(req: Request, res: Response): Promise<void> {
    try {
      const { store_id } = req.params;

      // Get pagination parameters from query
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;
      const skip = (page - 1) * limit;

      // Convert store_id to integer
      const storeId = parseInt(store_id, 10);

      if (isNaN(storeId)) {
        res.status(400).json({
          status: "error",
          message: "Invalid store ID format",
        });
        return;
      } 

      // Get total product count for pagination
      const totalProducts = await prisma.product.count({
        where: {
          store_id: storeId,
        },
      });

      const store = await prisma.store.findUnique({
        where: {
          store_id: storeId,
        },
        include: {
          User: {
            select: {
              user_id: true,
              avatar: true,
              first_name: true,
              last_name: true,
              username: true,
            },
          },
          Product: {
            select: {
              product_id: true,
              name: true,
              price: true,
              ProductImage: {
                take: 1, // Only get primary image
              },
            },
            skip: skip,
            take: limit, // Use the limit from query params
          },
        },
      });

      if (!store) {
        res.status(404).json({
          status: "error",
          message: "Store not found",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: store,
        pagination: {
          total: totalProducts,
          page,
          limit,
          pages: Math.ceil(totalProducts / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching store:", error);
      res.status(500).json({
        status: "error",
        message: "An error occurred while fetching the store",
      });
    }
  }

  async getAllStores(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const totalStores = await prisma.store.count();

      // Fetch stores with owner details
      const stores = await prisma.store.findMany({
        skip,
        take: limit,
        include: {
          User: {
            select: {
              avatar: true,
              username: true,
            },
          },
          Product: {
            select: {
              product_id: true,
              name: true,
            },
            take: 3, // Just a preview of products
          },
        },
      });

      res.status(200).json({
        status: "success",
        data: stores,
        pagination: {
          total: totalStores,
          page,
          limit,
          pages: Math.ceil(totalStores / limit),
        },
      });
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({
        status: "error",
        message: "An error occurred while fetching stores",
      });
    }
  }

  async searchStores(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.query;

      if (!query || typeof query !== "string") {
        res.status(400).json({
          status: "error",
          message: "Search query is required",
        });
        return;
      }

      const stores = await prisma.store.findMany({
        where: {
          store_name: {
            contains: query,
            mode: "insensitive",
          },
        },
        include: {
          User: {
            select: {
              avatar: true,
            },
          },
        },
      });

      res.status(200).json({
        status: "success",
        data: stores,
      });
    } catch (error) {
      console.error("Error searching stores:", error);
      res.status(500).json({
        status: "error",
        message: "An error occurred while searching stores",
      });
    }
  }
}
