import { Router } from "express";
import { StoreordermanagementsController } from "../controllers/store-orderManagements.controller";
import { RequestHandler } from "express-serve-static-core";
import { AuthMiddleware } from "../middleware/auth.verify";

export class StoreordermanagementsRouter {
  private router: Router;
  private storeordermanagementsController: StoreordermanagementsController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.storeordermanagementsController = new StoreordermanagementsController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get(
      "/",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkStrAdmin as unknown as RequestHandler,
      this.storeordermanagementsController.getOrdersStr
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
