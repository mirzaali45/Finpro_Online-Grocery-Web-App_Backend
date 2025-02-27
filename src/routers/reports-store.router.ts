import { Router } from "express";
import { ReportsController } from "../controllers/reports-store.controller";
import { AuthMiddleware } from "../middleware/auth.verify";
import { RequestHandler } from "express-serve-static-core";

export class ReportsRouter {
  private router: Router;
  private reportsController: ReportsController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.reportsController = new ReportsController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Monthly Sales Report
    this.router.get(
      "/sales/monthly",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkStrAdmin,
      this.reportsController.getMonthlySalesReport as unknown as RequestHandler
    );

    // Monthly Sales by Category Report
    this.router.get(
      "/sales/by-category",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkStrAdmin,
      this.reportsController
        .getMonthlySalesByCategory as unknown as RequestHandler
    );

    // Monthly Sales by Product Report
    this.router.get(
      "/sales/by-product",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkStrAdmin,
      this.reportsController
        .getMonthlySalesByProduct as unknown as RequestHandler
    );

    // Monthly Stock Summary Report
    this.router.get(
      "/stock/summary",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkStrAdmin,
      this.reportsController
        .getMonthlyStockSummaryReport as unknown as RequestHandler
    );

    // Detailed Product Stock Report
    this.router.get(
      "/stock/product-detail",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkStrAdmin,
      this.reportsController
        .getDetailedProductStockReport as unknown as RequestHandler
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
