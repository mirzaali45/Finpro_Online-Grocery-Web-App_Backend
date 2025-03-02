import { Router } from "express";
import { ProductController } from "../controllers/product.controllers";
import { RequestHandler } from "express-serve-static-core";
import { AuthMiddleware } from "../middleware/auth.verify";

export class ProductRouter {
  private router: Router;
  private productController: ProductController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.productController = new ProductController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.productController.createProduct as unknown as RequestHandler
    );
    this.router.get(
      "/store",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.productController.getProductsByStore as unknown as RequestHandler
    );
    this.router.get(
      "/discounted",
      this.productController.getDiscountedProducts as unknown as RequestHandler
    );
    this.router.patch(
      "/:product_id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.productController.updateProduct as unknown as RequestHandler
    );

    this.router.delete(
      "/:product_id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.productController.deleteProduct as unknown as RequestHandler
    );

    this.router.get(
      "/",
      this.productController.getProducts as unknown as RequestHandler
    );

    this.router.get(
      "/:product_id",
      this.productController.getProductById as unknown as RequestHandler
    );

    this.router.get(
      "/slug/:slug",
      this.productController.getProductBySlug as unknown as RequestHandler
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
