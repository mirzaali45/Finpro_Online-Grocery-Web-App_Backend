import { Router } from "express";
import { ProductImageController } from "../controllers/product-image.controller";
import { RequestHandler } from "express-serve-static-core";
import { AuthMiddleware } from "../middleware/auth.verify";

export class ProductImageRouter {
  private router: Router;
  private productImageController: ProductImageController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.productImageController = new ProductImageController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Upload images - Super Admin only
    this.router.post(
      "/:product_id/images",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.productImageController.uploadMiddleware as unknown as RequestHandler,
      this.productImageController.addProductImages as unknown as RequestHandler
    );

    // Get all images for a product - Public
    this.router.get(
      "/:product_id/images",
      this.productImageController.getProductImages as unknown as RequestHandler
    );

    // Get single image - Public
    this.router.get(
      "/images/:image_id",
      this.productImageController
        .getProductImageById as unknown as RequestHandler
    );

    // Delete image - Super Admin only
    this.router.delete(
      "/images/:image_id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.productImageController
        .deleteProductImage as unknown as RequestHandler
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
