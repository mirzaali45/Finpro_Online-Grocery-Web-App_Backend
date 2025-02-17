import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class DiscountController {
  getAllDiscounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const discounts = await prisma.discount.findMany({
        include: {
          store: true,
          product: {
            include: {
              ProductImage: true
            }
          }
        }
      });

      res.status(200).json({
        data: discounts
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching discounts",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  getActiveDiscounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const currentDate = new Date();
      
      const activeDiscounts = await prisma.discount.findMany({
        where: {
          expires_at: {
            gt: currentDate
          }
        },
        include: {
          store: true,
          product: {
            include: {
              ProductImage: true
            }
          }
        }
      });

      res.status(200).json({
        data: activeDiscounts
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching active discounts",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  getStoreDiscounts = async (req: Request, res: Response): Promise<void> => {
    try {
      const storeId = parseInt(req.params.storeId);

      const storeDiscounts = await prisma.discount.findMany({
        where: {
          store_id: storeId
        },
        include: {
          product: {
            include: {
              ProductImage: true
            }
          }
        }
      });

      res.status(200).json({
        data: storeDiscounts
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching store discounts",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  getDiscountById = async (req: Request, res: Response): Promise<void> => {
    try {
      const discountId = parseInt(req.params.id);
      
      const discount = await prisma.discount.findUnique({
        where: { discount_id: discountId },
        include: {
          store: true,
          product: {
            include: {
              ProductImage: true
            }
          }
        }
      });

      if (!discount) {
        res.status(404).json({ message: "Discount not found" });
        return;
      }

      res.status(200).json({
        data: discount
      });
    } catch (error) {
      res.status(500).json({
        message: "Error fetching discount",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  createDiscount = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        store_id,
        product_id,
        discount_thumbnail,
        discount_code,
        discount_type,
        discount_value,
        minimum_order,
        expires_at,
        userUser_id
      } = req.body;

      if (!discount_code || typeof discount_code !== 'string') {
        res.status(400).json({ message: "Invalid discount code" });
        return;
      }

      const existingDiscount = await prisma.discount.findUnique({
        where: { discount_code }
      });

      if (existingDiscount) {
        res.status(400).json({ message: "Discount code already exists" });
        return;
      }

      const discount = await prisma.discount.create({
        data: {
          store_id,
          product_id,
          discount_thumbnail,
          discount_code,
          discount_type,
          discount_value,
          minimum_order,
          expires_at: new Date(expires_at),
          userUser_id
        },
        include: {
          store: true,
          product: true
        }
      });

      res.status(201).json({
        message: "Discount created successfully",
        data: discount
      });
    } catch (error) {
      res.status(500).json({
        message: "Error creating discount",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  updateDiscount = async (req: Request, res: Response): Promise<void> => {
    try {
      const discountId = parseInt(req.params.id);
      const {
        store_id,
        product_id,
        discount_thumbnail,
        discount_code,
        discount_type,
        discount_value,
        minimum_order,
        expires_at,
        userUser_id
      } = req.body;

      const existingDiscount = await prisma.discount.findUnique({
        where: { discount_id: discountId }
      });

      if (!existingDiscount) {
        res.status(404).json({ message: "Discount not found" });
        return;
      }

      const updatedDiscount = await prisma.discount.update({
        where: { discount_id: discountId },
        data: {
          store_id,
          product_id,
          discount_thumbnail,
          discount_code,
          discount_type,
          discount_value,
          minimum_order,
          expires_at: expires_at ? new Date(expires_at) : undefined,
          userUser_id,
          updated_at: new Date()
        },
        include: {
          store: true,
          product: true
        }
      });

      res.status(200).json({
        message: "Discount updated successfully",
        data: updatedDiscount
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating discount",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };

  deleteDiscount = async (req: Request, res: Response): Promise<void> => {
    try {
      const discountId = parseInt(req.params.id);

      const existingDiscount = await prisma.discount.findUnique({
        where: { discount_id: discountId }
      });

      if (!existingDiscount) {
        res.status(404).json({ message: "Discount not found" });
        return;
      }

      await prisma.discount.delete({
        where: { discount_id: discountId }
      });

      res.status(200).json({
        message: "Discount deleted successfully"
      });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting discount",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
}