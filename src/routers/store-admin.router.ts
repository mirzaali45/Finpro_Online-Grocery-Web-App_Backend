import { Router } from "express";
import { StoreAdminController } from "../controllers/store-admin.controller";
import { RequestHandler } from "express-serve-static-core";
import { AuthMiddleware } from "../middleware/auth.verify";

export class StoreAdminRouter {
  private router: Router;
  private storeAdminController: StoreAdminController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.storeAdminController = new StoreAdminController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // View-only Products
    this.router.get(
      "/products",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkStrAdmin as unknown as RequestHandler,
      this.storeAdminController.getProducts as unknown as RequestHandler
    );

    this.router.get(
      "/products/:product_id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkStrAdmin as unknown as RequestHandler,
      this.storeAdminController.getProductById as unknown as RequestHandler
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
