import { Request, Response } from "express";
import { PrismaClient } from "../../prisma/generated/client";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
  };
}

export class VoucherController {
  // Static method to generate voucher code
  static generateVoucherCode(): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const codeLength = 8;
    let code = "";

    for (let i = 0; i < codeLength; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }

    return code;
  }

  async claimDiscount(req: AuthenticatedRequest, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { discount_id } = req.body;

      // Validate input
      if (!discount_id) {
        return res.status(400).json({
          success: false,
          message: "Discount ID is required",
        });
      }

      // Find the discount
      const discount = await prisma.discount.findUnique({
        where: { discount_id: Number(discount_id) },
        include: {
          store: true,
          product: true,
        },
      });

      // Check if discount exists
      if (!discount) {
        return res.status(404).json({
          success: false,
          message: "Discount not found",
        });
      }

      // Check if discount is expired
      if (new Date(discount.expires_at) < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Discount has expired",
        });
      }

      // Check if user has already claimed this discount
      const existingVoucher = await prisma.voucher.findFirst({
        where: {
          user_id: req.user.id,
          discount_id: discount.discount_id,
        },
      });

      if (existingVoucher) {
        return res.status(400).json({
          success: false,
          message: "You have already claimed this discount",
        });
      }

      // Create voucher
      const voucher = await prisma.voucher.create({
        data: {
          user_id: req.user.id,
          discount_id: discount.discount_id,
          voucher_code: VoucherController.generateVoucherCode(),
          expires_at: discount.expires_at,
        },
      });

      res.status(201).json({
        success: true,
        message: "Discount claimed successfully",
        voucher,
      });
    } catch (error) {
      console.error("Discount claim error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to claim discount",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getUserVouchers(req: AuthenticatedRequest, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      // Retrieve vouchers with associated discount information
      const vouchers = await prisma.voucher.findMany({
        where: {
          user_id: req.user.id,
        },
        include: {
          discount: {
            include: {
              product: true,
              store: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      // Check if no vouchers exist
      if (vouchers.length === 0) {
        return res.status(404).json({
          success: true,
          message: "You do not have any vouchers",
          data: [],
        });
      }

      res.status(200).json({
        success: true,
        message: "Vouchers retrieved successfully",
        data: vouchers,
      });
    } catch (error) {
      console.error("Error retrieving vouchers:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve vouchers",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteVoucher(req: AuthenticatedRequest, res: Response) {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { voucher_id } = req.params;

      // Validate input
      if (!voucher_id) {
        return res.status(400).json({
          success: false,
          message: "Voucher ID is required",
        });
      }

      // Find the voucher to verify ownership
      const voucher = await prisma.voucher.findUnique({
        where: { voucher_id: Number(voucher_id) },
      });

      // Check if voucher exists
      if (!voucher) {
        return res.status(404).json({
          success: false,
          message: "Voucher not found",
        });
      }

      // Verify the voucher belongs to the user
      if (voucher.user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You do not have permission to delete this voucher",
        });
      }

      // Check if voucher has been used
      if (voucher.is_redeemed) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete a redeemed voucher",
        });
      }

      // Delete the voucher
      await prisma.voucher.delete({
        where: { voucher_id: Number(voucher_id) },
      });

      res.status(200).json({
        success: true,
        message: "Voucher deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting voucher:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete voucher",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
