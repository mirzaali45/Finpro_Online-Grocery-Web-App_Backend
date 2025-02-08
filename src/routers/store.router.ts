import { Router } from "express";
import { StoreController } from "../controllers/store.controller";
import { RequestHandler } from "express-serve-static-core";
import { AuthMiddleware } from "../middleware/auth.verify";

export class StoreRouter {
  private router: Router;
  private storeController: StoreController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.storeController = new StoreController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create store - Super Admin only
    this.router.post(
      "/",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.storeController.createStore as unknown as RequestHandler
    );

    // Get all stores - Super Admin only
    this.router.get(
      "/",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.storeController.getStores as unknown as RequestHandler
    );

    // Get store by ID - Super Admin only
    this.router.get(
      "/:store_id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.storeController.getStoreById as unknown as RequestHandler
    );

    // Update store - Super Admin only
    this.router.put(
      "/:store_id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.storeController.updateStore as unknown as RequestHandler
    );

    // Delete store - Super Admin only
    this.router.delete(
      "/:store_id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.storeController.deleteStore as unknown as RequestHandler
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
