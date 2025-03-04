import { Router } from "express";
import { ReportSuperAdmin } from "../controllers/reports-superadmin.controller"; 
import { AuthMiddleware } from "../middleware/auth.verify";
import { RequestHandler } from "express-serve-static-core";

export class ReportSuperAdminRouter {
  private router: Router;
  private reportsSuperController: ReportSuperAdmin;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.reportsSuperController = new ReportSuperAdmin();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkSuperAdmin,
      this.reportsSuperController.getReportInventorySuperAdmin as unknown as RequestHandler
    );
  }
  
  getRouter(): Router {
    return this.router;
  }
}