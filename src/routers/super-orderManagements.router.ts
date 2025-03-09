import { Router } from "express";
import { RequestHandler } from "express-serve-static-core";
import { AuthMiddleware } from "../middleware/auth.verify";
import { SuperordermanagementsController } from "../controllers/super-orderManagements.controller";

export class SuperordermanagementsRouter {
  private router: Router;
  private superordermanagementsController: SuperordermanagementsController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.superordermanagementsController =
      new SuperordermanagementsController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(
      "/",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.superordermanagementsController
        .getOrdersSpr as unknown as RequestHandler
    );
    this.router.post(
      "/update-shipping-status",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.superordermanagementsController.updateShippingStatus
    );
    this.router.post(
      "/cancel-order",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.superordermanagementsController.cancelOrder
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
