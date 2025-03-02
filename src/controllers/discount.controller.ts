import { Request, Response } from "express";
import { PrismaClient, Type } from "../../prisma/generated/client";
import { z } from "zod";
import { uploadDiscountThumbnail } from "../services/cloudinary";

const prisma = new PrismaClient();
const createDiscountSchema = z.object({
  store_id: z.number().optional(),
  product_id: z.coerce.number(),
  userUser_id: z.number().optional(), // Updated to match schema
  thumbnail: z.string().optional(),
  discount_code: z.string().min(3),
  discount_type: z.enum(["point", "percentage"]),
  discount_value: z.coerce.number(),
  minimum_order: z.coerce.number().optional(),
  expires_at: z.string().transform((str) => new Date(str)),
});

const updateDiscountSchema = createDiscountSchema.partial();

export class DiscountController {
  async createDiscount(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;
      if (user?.role !== "store_admin") {
        res.status(403).json({
          success: false,
          message: "Unauthorized: Only store admins can create discounts",
        });
        return;
      }
      const store = await prisma.store.findUnique({
        where: { user_id: user.id },
      });

      if (!store) {
        res.status(404).json({
          success: false,
          message: "No store found for this admin",
        });
        return;
      }

      const validation = createDiscountSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid input data",
          errors: validation.error.format(),
        });
        return;
      }

      const data = validation.data;
      if (data.discount_type === "percentage" && data.discount_value > 100) {
        res.status(400).json({
          success: false,
          message: "Percentage discount cannot exceed 100%",
        });
        return;
      }

      // Check if discount code already exists
      const existingDiscount = await prisma.discount.findUnique({
        where: { discount_code: data.discount_code },
      });

      if (existingDiscount) {
        res.status(400).json({
          success: false,
          message: "Discount code already exists",
        });
        return;
      }
      if (data.product_id && data.product_id !== 0) {
        const product = await prisma.product.findUnique({
          where: {
            product_id: data.product_id,
            store_id: store.store_id,
          },
        });

        if (!product) {
          res.status(400).json({
            success: false,
            message: "Product does not belong to your store",
          });
          return;
        }
        const existingProductDiscount = await prisma.discount.findFirst({
          where: {
            store_id: store.store_id,
            product_id: data.product_id,
          },
        });

        if (existingProductDiscount) {
          res.status(400).json({
            success: false,
            message: "A discount for this product already exists",
          });
          return;
        }
      }
      let thumbnailUrl = data.thumbnail;
      if (req.file) {
        const uploadResult = await uploadDiscountThumbnail(req.file.path);
        thumbnailUrl = uploadResult.secure_url;
      }
      const discount = await prisma.discount.create({
        data: {
          store_id: store.store_id,
          product_id: data.product_id === 0 ? null : data.product_id,
          thumbnail: thumbnailUrl,
          discount_code: data.discount_code,
          discount_type: data.discount_type as Type,
          discount_value: data.discount_value,
          minimum_order: data.minimum_order,
          expires_at: data.expires_at,
        },
      });

      res.status(201).json({
        success: true,
        message: "Discount created successfully",
        data: discount,
      });
    } catch (error) {
      console.error("Error creating discount:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create discount",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  async getAllDiscounts(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 8,
        storeId,
        productId,
        discountType,
        unassigned,
      } = req.query;

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const offset = (pageNum - 1) * limitNum;
      const whereCondition: any = {};
      whereCondition.store_id = { not: null };

      if (storeId) {
        whereCondition.store_id = Number(storeId);
      }
      if (unassigned === "true") {
        whereCondition.product_id = null;
      } else if (productId) {
        whereCondition.product_id = Number(productId);
      }

      if (discountType) {
        whereCondition.discount_type = discountType as Type;
      }

      const discounts = await prisma.discount.findMany({
        where: whereCondition,
        include: {
          product: {
            select: {
              name: true,
              category: {
                select: {
                  category_name: true,
                },
              },
            },
          },
          store: {
            select: {
              store_name: true,
            },
          },
        },
        take: limitNum,
        skip: offset,
        orderBy: {
          created_at: "desc",
        },
      });

      const totalDiscounts = await prisma.discount.count({
        where: whereCondition,
      });

      res.status(200).json({
        success: true,
        data: discounts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalDiscounts,
          totalPages: Math.ceil(totalDiscounts / limitNum),
        },
      });
    } catch (error) {
      console.error("Error fetching discounts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch discounts",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  async getDiscountById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: "Valid discount ID required",
        });
        return;
      }

      const discount = await prisma.discount.findUnique({
        where: { discount_id: Number(id) },
        include: {
          product: {
            select: {
              product_id: true,
              name: true,
              price: true,
              ProductImage: {
                select: {
                  url: true,
                },
                take: 1,
              },
            },
          },
          store: {
            select: {
              store_id: true,
              store_name: true,
            },
          },
          User: {
            select: {
              user_id: true,
              username: true,
            },
          },
          Voucher: true,
        },
      });

      if (!discount) {
        res.status(404).json({
          success: false,
          message: "Discount not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Discount retrieved successfully",
        data: discount,
      });
    } catch (error) {
      console.error("Error retrieving discount:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve discount",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  async getStoreDiscounts(req: Request, res: Response): Promise<void> {
    try {
      // Get the user_id from the authenticated user's token
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // First, find the store that belongs to this user
      const store = await prisma.store.findUnique({
        where: { user_id: userId },
      });

      if (!store) {
        res.status(404).json({
          success: false,
          message: "No store found for this user",
        });
        return;
      }

      // Then find all discounts for this store
      const discounts = await prisma.discount.findMany({
        where: { store_id: store.store_id },
        include: {
          product: {
            select: {
              product_id: true,
              name: true,
              price: true,
              ProductImage: {
                select: {
                  url: true,
                },
                take: 1,
              },
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        message: "Discounts retrieved successfully",
        data: discounts,
      });
    } catch (error) {
      console.error("Error retrieving discounts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve discounts",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
  // Get all discounts for a product
  async getProductDiscounts(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;

      if (!productId || isNaN(Number(productId))) {
        res.status(400).json({
          success: false,
          message: "Valid product ID required",
        });
        return;
      }

      const product = await prisma.product.findUnique({
        where: { product_id: Number(productId) },
        select: { store_id: true },
      });

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Product not found",
        });
        return;
      }

      const discounts = await prisma.discount.findMany({
        where: {
          OR: [
            { product_id: Number(productId) },
            { store_id: product.store_id },
          ],
          expires_at: {
            gt: new Date(),
          },
        },
      });

      res.status(200).json({
        success: true,
        message: "Product discounts retrieved successfully",
        data: discounts,
      });
    } catch (error) {
      console.error("Error retrieving product discounts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve product discounts",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  // Get all discounts for a user
  async getUserDiscounts(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId || isNaN(Number(userId))) {
        res.status(400).json({
          success: false,
          message: "Valid user ID required",
        });
        return;
      }

      const discounts = await prisma.discount.findMany({
        where: {
          userUser_id: Number(userId),
          expires_at: {
            gt: new Date(),
          },
        },
      });

      res.status(200).json({
        success: true,
        message: "User discounts retrieved successfully",
        data: discounts,
      });
    } catch (error) {
      console.error("Error retrieving user discounts:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve user discounts",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  // Update a discount
  async updateDiscount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: "Valid discount ID required",
        });
        return;
      }

      const validation = updateDiscountSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Invalid input data",
          errors: validation.error.format(),
        });
        return;
      }

      const data = validation.data;

      // Check if discount exists
      const existingDiscount = await prisma.discount.findUnique({
        where: { discount_id: Number(id) },
      });

      if (!existingDiscount) {
        res.status(404).json({
          success: false,
          message: "Discount not found",
        });
        return;
      }

      // Validate discount code uniqueness if changing
      if (
        data.discount_code &&
        data.discount_code !== existingDiscount.discount_code
      ) {
        const codeExists = await prisma.discount.findUnique({
          where: { discount_code: data.discount_code },
        });

        if (codeExists) {
          res.status(400).json({
            success: false,
            message: "Discount code already exists",
          });
          return;
        }
      }

      // Validate percentage value
      if (
        data.discount_type === "percentage" &&
        data.discount_value !== undefined &&
        data.discount_value > 100
      ) {
        res.status(400).json({
          success: false,
          message: "Percentage discount cannot exceed 100%",
        });
        return;
      }

      // Update the discount
      const updatedDiscount = await prisma.discount.update({
        where: { discount_id: Number(id) },
        data: {
          store_id: data.store_id,
          product_id: data.product_id,
          userUser_id: data.userUser_id, // Updated to match schema
          thumbnail: data.thumbnail,
          discount_code: data.discount_code,
          discount_type: data.discount_type as Type,
          discount_value: data.discount_value,
          minimum_order: data.minimum_order,
          expires_at: data.expires_at,
          updated_at: new Date(),
        },
      });

      res.status(200).json({
        success: true,
        message: "Discount updated successfully",
        data: updatedDiscount,
      });
    } catch (error) {
      console.error("Error updating discount:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update discount",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  // Delete a discount
  async deleteDiscount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        res.status(400).json({
          success: false,
          message: "Valid discount ID required",
        });
        return;
      }

      // Check if discount exists
      const existingDiscount = await prisma.discount.findUnique({
        where: { discount_id: Number(id) },
      });

      if (!existingDiscount) {
        res.status(404).json({
          success: false,
          message: "Discount not found",
        });
        return;
      }

      // Check if discount is being used by any vouchers
      const vouchersUsingDiscount = await prisma.voucher.findFirst({
        where: { discount_id: Number(id) },
      });

      if (vouchersUsingDiscount) {
        res.status(400).json({
          success: false,
          message: "Cannot delete discount as it is being used by vouchers",
        });
        return;
      }

      // Delete the discount
      await prisma.discount.delete({
        where: { discount_id: Number(id) },
      });

      res.status(200).json({
        success: true,
        message: "Discount deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting discount:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete discount",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }

  // Apply discount with bulk purchase logic
  async applyDiscount(req: Request, res: Response): Promise<void> {
    try {
      const { products, discountCode } = req.body;

      if (!Array.isArray(products) || products.length === 0) {
        res.status(400).json({
          success: false,
          message: "Valid products array required",
        });
        return;
      }

      if (!discountCode) {
        res.status(400).json({
          success: false,
          message: "Discount code required",
        });
        return;
      }

      // Find the discount
      const discount = await prisma.discount.findUnique({
        where: { discount_code: discountCode },
      });

      if (!discount) {
        res.status(404).json({
          success: false,
          message: "Discount not found",
        });
        return;
      }

      // Check if expired
      if (discount.expires_at < new Date()) {
        res.status(400).json({
          success: false,
          message: "Discount has expired",
        });
        return;
      }

      // Calculate total before discount
      let totalBeforeDiscount = 0;
      for (const product of products) {
        totalBeforeDiscount += product.price * product.quantity;
      }

      // Check minimum order if applicable
      if (
        discount.minimum_order &&
        totalBeforeDiscount < discount.minimum_order
      ) {
        res.status(400).json({
          success: false,
          message: `Minimum order of ${discount.minimum_order} required for this discount`,
        });
        return;
      }

      // Calculate discount amount
      let discountAmount = 0;

      if (discount.discount_type === "percentage") {
        discountAmount = (totalBeforeDiscount * discount.discount_value) / 100;
      } else {
        discountAmount = discount.discount_value;
      }

      // Apply discount
      const totalAfterDiscount = totalBeforeDiscount - discountAmount;

      res.status(200).json({
        success: true,
        message: "Discount applied successfully",
        data: {
          totalBeforeDiscount,
          discountAmount,
          totalAfterDiscount,
          discountCode: discount.discount_code,
          discountType: discount.discount_type,
        },
      });
    } catch (error) {
      console.error("Error applying discount:", error);
      res.status(500).json({
        success: false,
        message: "Failed to apply discount",
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }
  }
}
