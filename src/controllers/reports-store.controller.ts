import {PrismaClient} from "../../prisma/generated/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class ReportStore{
  async getReportInventory(req: Request, res: Response){
    try {
      // Get the user_id of the store admin from the request
      // This could come from authentication middleware or request body/params
      // Fix: Use correct property name from your Prisma schema - user_id
      const userId = req.user?.id || parseInt(req.params.userId);
      
      if (!userId) {
        return res.status(400).json({
          status: "error",
          message: "User ID is required"
        });
      }
      
      // Get the store associated with this user (store admin)
      const store = await prisma.store.findFirst({
        where: {
          user_id: userId
        }
      });
      
      if (!store) {
        return res.status(404).json({
          status: "error",
          message: "Store not found for this user"
        });
      }
      
      // Get inventory data with product details for this store
      const inventoryReport = await prisma.inventory.findMany({
        where: {
          store_id: store.store_id
        },
        include: {
          product: {
            select: {
              product_id: true,
              name: true,
              price: true,
              category: {
                select: {
                  category_name: true
                }
              }
            }
          }
        }
      });
      
      // Format the report data
      const formattedReport = inventoryReport.map(item => ({
        product_id: item.product_id,
        product_name: item.product.name,
        category: item.product.category.category_name,
        current_quantity: item.qty,
        total_quantity: item.total_qty,
        price: item.product.price,
        estimated_value: item.qty * item.product.price,
        last_updated: item.updated_at
      }));
      
      // Calculate summary statistics
      const totalItems = formattedReport.reduce((sum, item) => sum + item.current_quantity, 0);
      const totalValue = formattedReport.reduce((sum, item) => sum + item.estimated_value, 0);
      
      return res.status(200).json({
        status: "success",
        data: {
          store_name: store.store_name,
          store_id: store.store_id,
          report_date: new Date(),
          summary: {
            total_items: totalItems,
            total_value: totalValue,
            product_count: formattedReport.length
          },
          inventory: formattedReport
        }
      });
      
    } catch (error: unknown) {
      console.error("Error generating inventory report:", error);
      // Fix: Handle the 'unknown' type error properly
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      return res.status(500).json({
        status: "error",
        message: "Failed to generate inventory report",
        error: errorMessage
      });
    }
  }
}
