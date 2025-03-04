import { Router } from "express";
import { InventoryController } from "../controllers/inventory.controller";
import { RequestHandler } from "express-serve-static-core";
import { AuthMiddleware } from "../middleware/auth.verify";

export class InventoryRouter {
  private router: Router;
  private inventoryController: InventoryController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.inventoryController = new InventoryController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create inventory - Super Admin only
    this.router.post(
      "/",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.inventoryController.createInventory as unknown as RequestHandler
    );

    // Get all inventory - Both Super Admin and Store Admin
    this.router.get(
      "/",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.inventoryController.getInventory as unknown as RequestHandler
    );

    // Get specific inventory - Both Super Admin and Store Admin
    this.router.get(
      "/:inv_id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.inventoryController.getInventoryById as unknown as RequestHandler
    );

    // Update inventory - Super Admin only
    this.router.put(
      "/:inv_id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.inventoryController.updateInventory as unknown as RequestHandler
    );

    // Delete inventory - Super Admin only
    this.router.delete(
      "/:inv_id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.inventoryController.deleteInventory as unknown as RequestHandler
    );

    // Get low stock products - Both Super Admin and Store Admin
    this.router.get(
      "/low-stock",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.inventoryController.getLowStockProducts as unknown as RequestHandler
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
