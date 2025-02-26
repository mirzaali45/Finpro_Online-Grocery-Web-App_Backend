import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { uploadCategoryThumbnail } from "../services/cloudinary";

const prisma = new PrismaClient();

export class CategoryController {
  async createCategory(req: Request, res: Response) {
    try {
      const { category_name, description } = req.body;

      // Check if required fields are provided
      if (!category_name || !description) {
        return res.status(400).json({
          error: "Category name and description are required",
        });
      }

      // Initialize data object for category creation
      const categoryData: any = {
        category_name,
        description,
      };

      // Handle file upload if exists
      if (req.file) {
        try {
          // Upload to Cloudinary
          const result = await uploadCategoryThumbnail(req.file.path);

          // Add image URL to category data
          categoryData.category_thumbnail = result.secure_url;
        } catch (uploadError) {
          console.error("Error uploading thumbnail:", uploadError);
          return res.status(500).json({
            error: "Failed to upload category thumbnail",
          });
        }
      }

      // Create category with or without thumbnail
      const category = await prisma.category.create({
        data: categoryData,
      });

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({
        success: false,
        error: message,
      });
    }
  }

  async getCategories(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          Product: true,
        },
      });

      return res.status(200).json(categories);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async getCategoryById(req: Request, res: Response) {
    try {
      const { category_id } = req.params;
      const category = await prisma.category.findUnique({
        where: { category_id: parseInt(category_id) },
        include: {
          Product: true,
        },
      });
      if (!category) {
        throw new Error("Category not found");
      }
      return res.status(200).json(category);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const { category_id } = req.params;
      const { category_name, description, category_url } = req.body;

      const category = await prisma.category.update({
        where: { category_id: parseInt(category_id) },
        data: {
          category_name,
          description,
        },
      });

      return res.status(200).json(category);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const { category_id } = req.params;

      await prisma.category.delete({
        where: { category_id: parseInt(category_id) },
      });

      return res.status(200).json({ message: "Category deleted successfully" });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
    }
  }
}
