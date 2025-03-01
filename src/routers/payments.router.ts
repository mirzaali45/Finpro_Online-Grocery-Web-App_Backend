import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.verify";
import { PaymentsController } from "../controllers/payments.controller";

export class PaymentsRouter {
  private router: Router;
  private paymentsController: PaymentsController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.paymentsController = new PaymentsController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      "/snap-token",
      this.paymentsController.createSnapToken
    );
    this.router.post(
      "/notification",
      this.paymentsController.midtransNotification
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
