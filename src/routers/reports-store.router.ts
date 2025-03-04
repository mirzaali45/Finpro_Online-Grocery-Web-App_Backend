import { Router } from "express";
import { ReportStore } from "../controllers/reports-store.controller";
import { AuthMiddleware } from "../middleware/auth.verify";
import { RequestHandler } from "express-serve-static-core";

export class ReportsRouter {
  private router: Router;
  private reportStoreController: ReportStore;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.reportStoreController = new ReportStore();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkStrAdmin,
      this.reportStoreController.getReportInventory as unknown as RequestHandler
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
