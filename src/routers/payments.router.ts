import { Router } from "express";
import { AuthMiddleware } from "../middleware/auth.verify";
import { PaymentController } from "../controllers/payments.controller";

export class PaymentRouter {
  private router: Router;
  private paymentController: PaymentController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.paymentController = new PaymentController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      "/create",
      this.authMiddleware.verifyToken,
      this.paymentController.createPayment.bind(this.paymentController)
    );
    this.router.post(
      "/webhook",
      this.paymentController.handleWebhook.bind(this.paymentController)
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
