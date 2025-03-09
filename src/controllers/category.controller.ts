import { PrismaClient } from "../../prisma/generated/client";
import { Request, Response } from "express";
import { uploadCategoryThumbnail } from "../services/cloudinary";

const prisma = new PrismaClient();

export class CategoryController {
  async createCategory(req: Request, res: Response) {
    try {
      const { category_name, description } = req.body;
      if (!category_name || !description) {
        return res.status(400).json({
          error: "Category name and description are required",
        });
      }
      const existingCategory = await prisma.category.findFirst({
        where: {
          category_name: {
            equals: category_name,
            mode: "insensitive",
          },
        },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          error: "A category with this name already exists",
        });
      }

      const categoryData: any = {
        category_name,
        description,
      };

      if (req.file) {
        try {
          const result = await uploadCategoryThumbnail(req.file.path);
          categoryData.category_thumbnail = result.secure_url; // Change from category_image to category_thumbnail
        } catch (uploadError) {
          console.error("Error uploading thumbnail:", uploadError);
          return res.status(500).json({
            error: "Failed to upload category thumbnail",
          });
        }
      }

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
      // Check if "all" parameter is present to return all categories
      const getAll = req.query.all === "true";

      // Get pagination parameters if not getting all
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 8;

      // Count total categories
      const totalCount = await prisma.category.count();

      // Define query options
      const queryOptions: any = {
        include: {
          Product: true,
        },
      };

      // Add pagination if not getting all
      if (!getAll) {
        const skip = (page - 1) * limit;
        queryOptions.skip = skip;
        queryOptions.take = limit;
      }

      // Get categories with options
      const categories = await prisma.category.findMany(queryOptions);

      // Return response with or without pagination details
      if (getAll) {
        return res.status(200).json({
          data: categories,
          totalItems: totalCount,
        });
      } else {
        return res.status(200).json({
          data: categories,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
            totalItems: totalCount,
            itemsPerPage: limit,
          },
        });
      }
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
