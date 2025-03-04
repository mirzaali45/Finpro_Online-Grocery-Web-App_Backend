import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.verify";
import { RevenueSuperAdminController } from "../controllers/revenue-superadmin.controller";
import { RequestHandler } from "express-serve-static-core";

export class RevenueSuperAdminRouter {
  private router: Router;
  private revenueSuperAdminController: RevenueSuperAdminController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.revenueSuperAdminController = new RevenueSuperAdminController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/allorder",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkSuperAdmin,
      this.revenueSuperAdminController.getAllOrder as unknown as RequestHandler
    );

    this.router.get(
      "/period",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkSuperAdmin,
      this.revenueSuperAdminController
        .getRevenueByPeriod as unknown as RequestHandler
    );

    this.router.get(
      "/dashboard",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkSuperAdmin,
      this.revenueSuperAdminController.getDashboardStats as unknown as RequestHandler
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
