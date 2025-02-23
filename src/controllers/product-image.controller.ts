import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { uploadProduct, uploadToCloudinary, deleteFromCloudinary } from "../services/cloudinary";
import { responseError } from "../helpers/responseError";

const prisma = new PrismaClient();

export class ProductImageController {
  uploadMiddleware = uploadProduct.array("images", 5);

  async addProductImages(req: Request, res: Response) {
    try {
      const { product_id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        return responseError(res, "No files uploaded");
      }

      const uploadPromises = files.map(async (file) => {
        try {
          // Upload to Cloudinary first
          const result = await uploadToCloudinary(file.path, "product_image");
          
          // Then create database record with Cloudinary URL
          return prisma.productImage.create({
            data: {
              product_id: parseInt(product_id),
              url: result.secure_url,
            },
          });
        } catch (error) {
          console.error("Error processing file:", error);
          throw error;
        }
      });

      const images = await Promise.all(uploadPromises);

      return res.status(201).json({
        status: "success",
        data: images
      });
    } catch (error: unknown) {
      return responseError(res, error instanceof Error ? error.message : "Unknown error occurred");
    }
  }

  async getProductImages(req: Request, res: Response) {
    try {
      const { product_id } = req.params;

      const images = await prisma.productImage.findMany({
        where: { product_id: parseInt(product_id) },
      });

      return res.status(200).json({
        status: "success",
        data: images
      });
    } catch (error: unknown) {
      return responseError(res, error instanceof Error ? error.message : "Unknown error occurred");
    }
  }

  async deleteProductImage(req: Request, res: Response) {
    try {
      const { image_id } = req.params;

      const image = await prisma.productImage.findUnique({
        where: { image_id: parseInt(image_id) },
        
      });

      if (!image) {
        return responseError(res, "Image not found");
      }

      // Delete from Cloudinary first
      const cloudinaryResult = await deleteFromCloudinary(image.url, "product_image");
      
      if (!cloudinaryResult) {
        return responseError(res, "Failed to delete image from cloud storage");
      }

      // Then delete from database
      await prisma.productImage.delete({
        where: { image_id: parseInt(image_id) },
      });

      return res.status(200).json({
        status: "success",
        message: "Product image deleted successfully"
      });
    } catch (error: unknown) {
      return responseError(res, error instanceof Error ? error.message : "Unknown error occurred");
    }
  }

  async getProductImageById(req: Request, res: Response) {
    try {
      const { image_id } = req.params;

      const image = await prisma.productImage.findUnique({
        where: { image_id: parseInt(image_id) },
      });

      if (!image) {
        return responseError(res, "Image not found");
      }

      return res.status(200).json({
        status: "success",
        data: image
      });
    } catch (error: unknown) {
      return responseError(res, error instanceof Error ? error.message : "Unknown error occurred");
    }
  }
}