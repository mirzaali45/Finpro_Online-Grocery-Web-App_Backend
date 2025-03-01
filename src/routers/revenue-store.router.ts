import { Router } from "express";
import { RevenueStoreController } from "../controllers/revenue-store.controller";
import { AuthMiddleware } from "../middleware/auth.verify";
import { RequestHandler } from "express-serve-static-core";

export class RevenueStoreRouter {
  private router: Router;
  private revenueStoreController: RevenueStoreController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.revenueStoreController = new RevenueStoreController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(
      "/",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkStrAdmin,
      this.revenueStoreController.getOrderbyStore as unknown as RequestHandler
    );
    this.router.get(
      "/period",
      this.authMiddleware.verifyToken,
      this.revenueStoreController.getRevenueByPeriod as unknown as RequestHandler
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
