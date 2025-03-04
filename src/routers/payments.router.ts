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
      "/create",
      this.authMiddleware.verifyToken,
      this.paymentsController.createPaymentOrder
    );
    this.router.post(
      "/callback",
      this.paymentsController.paymentCallback
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
