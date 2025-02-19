import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken';

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
          },
          User: true // Capitalized 'User'
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
          },
          User: true // Capitalized 'User'
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

      if (isNaN(storeId)) {
        res.status(400).json({ message: "Invalid store ID" });
        return;
      }

      const storeExists = await prisma.store.findUnique({
        where: { store_id: storeId } // Use store_id instead of id
      });

      if (!storeExists) {
        res.status(404).json({ message: "Store not found" });
        return;
      }

      const storeDiscounts = await prisma.discount.findMany({
        where: {
          store: {
            store_id: storeId // Use store_id instead of id
          }
        },
        include: {
          product: {
            include: {
              ProductImage: true
            }
          },
          User: true // Capitalized 'User'
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
      
      if (isNaN(discountId)) {
        res.status(400).json({ message: "Invalid discount ID" });
        return;
      }

      const discount = await prisma.discount.findUnique({
        where: { discount_id: discountId }, // Use discount_id instead of id
        include: {
          store: true,
          product: {
            include: {
              ProductImage: true
            }
          },
          User: true // Capitalized 'User'
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
        thumbnail,
        discount_code,
        discount_type,
        discount_value,
        minimum_order,
        expires_at,
        userUser_id
      } = req.body;

      // Validate required fields
      if (!discount_code || typeof discount_code !== 'string') {
        res.status(400).json({ message: "Invalid discount code" });
        return;
      }

      // Check if discount code already exists
      const existingDiscount = await prisma.discount.findFirst({
        where: { discount_code }
      });

      if (existingDiscount) {
        res.status(400).json({ message: "Discount code already exists" });
        return;
      }

      // Verify that store, product, and user exist
      const [store, product, user] = await Promise.all([
        prisma.store.findUnique({ where: { store_id: store_id } }), // Use store_id
        prisma.product.findUnique({ where: { product_id: product_id } }), // Use product_id
        prisma.user.findUnique({ where: { user_id: userUser_id } }) // Use user_id
      ]);

      if (!store) {
        res.status(400).json({ message: "Store not found" });
        return;
      }

      if (!product) {
        res.status(400).json({ message: "Product not found" });
        return;
      }

      if (!user) {
        res.status(400).json({ message: "User not found" });
        return;
      }

      // Create the discount
      const discount = await prisma.discount.create({
        data: {
          store: {
            connect: { store_id: store_id } // Use store_id
          },
          product: {
            connect: { product_id: product_id } // Use product_id
          },
          User: { // Capitalized 'User'
            connect: { user_id: userUser_id } // Use user_id
          },
          thumbnail,
          discount_code,
          discount_type,
          discount_value,
          minimum_order,
          expires_at: new Date(expires_at),
          created_at: new Date(),
          updated_at: new Date()
        },
        include: {
          store: true,
          product: {
            include: {
              ProductImage: true
            }
          },
          User: true // Capitalized 'User'
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
      
      if (isNaN(discountId)) {
        res.status(400).json({ message: "Invalid discount ID" });
        return;
      }
  
      const {
        store_id,
        product_id,
        thumbnail,
        discount_code,
        discount_type,
        discount_value,
        minimum_order,
        expires_at,
        userUser_id
      } = req.body;
  
      // Verify discount exists
      const existingDiscount = await prisma.discount.findUnique({
        where: { discount_id: discountId }
      });
  
      if (!existingDiscount) {
        res.status(404).json({ message: "Discount not found" });
        return;
      }
  
      // If discount code is being changed, check for uniqueness
      if (discount_code && discount_code !== existingDiscount.discount_code) {
        const duplicateCode = await prisma.discount.findFirst({
          where: { discount_code }
        });
  
        if (duplicateCode) {
          res.status(400).json({ message: "Discount code already exists" });
          return;
        }
      }
  
      // Verify related entities exist if they're being updated
      if (store_id) {
        const store = await prisma.store.findUnique({
          where: { store_id: store_id }
        });
        if (!store) {
          res.status(400).json({ message: "Store not found" });
          return;
        }
      }
  
      if (product_id) {
        const product = await prisma.product.findUnique({
          where: { product_id: product_id }
        });
        if (!product) {
          res.status(400).json({ message: "Product not found" });
          return;
        }
      }
  
      if (userUser_id) {
        const user = await prisma.user.findUnique({
          where: { user_id: userUser_id }
        });
        if (!user) {
          res.status(400).json({ message: "User not found" });
          return;
        }
      }
  
      // Update the discount
      const updatedDiscount = await prisma.discount.update({
        where: { discount_id: discountId },
        data: {
          store: store_id ? {
            connect: { store_id: store_id }
          } : undefined,
          product: product_id ? {
            connect: { product_id: product_id }
          } : undefined,
          User: userUser_id ? {
            connect: { user_id: userUser_id }
          } : undefined,
          thumbnail,
          discount_code,
          discount_type,
          discount_value,
          minimum_order,
          expires_at: expires_at ? new Date(expires_at) : undefined,
          updated_at: new Date()
        },
        include: {
          store: true,
          product: {
            include: {
              ProductImage: true
            }
          },
          User: true
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
  
      if (isNaN(discountId)) {
        res.status(400).json({ message: "Invalid discount ID" });
        return;
      }
  
      // Verify discount exists
      const existingDiscount = await prisma.discount.findUnique({
        where: { discount_id: discountId }
      });
  
      if (!existingDiscount) {
        res.status(404).json({ message: "Discount not found" });
        return;
      }
  
      // Delete the discount
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
  }

  async getProductStore(req: Request, res: Response): Promise<void> {
    try {
      // Get token from Authorization header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }
      
      const token = authHeader.split(' ')[1];
      
      if (!process.env.SECRET_KEY) {
        throw new Error('SECRET_KEY is not defined');
      }
  
      interface JwtPayload {
        userId: number;
      }
  
      const decoded = jwt.verify(token, process.env.SECRET_KEY) as JwtPayload;
  
      // Find store by userId from token
      const store = await prisma.store.findFirst({
        where: { user_id: decoded.userId },
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
        res.status(404).json({ error: "Store not found" });
        return;
      }
  
      res.status(200).json(store);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      res.status(500).json({ error: message });
    }
  }
}