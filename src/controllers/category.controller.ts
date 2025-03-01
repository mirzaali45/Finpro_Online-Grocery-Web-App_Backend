import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class CategoryController {
  async createCategory(req: Request, res: Response) {
    try {
      const { category_name, description, category_url } = req.body;

      const category = await prisma.category.create({
        data: {
          category_name,
          description,
        },
      });

      return res.status(201).json(category);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      return res.status(500).json({ error: message });
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
