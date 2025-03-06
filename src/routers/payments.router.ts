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
    // Route for payment initiation
    this.router.post(
      "/:order_id",
      this.authMiddleware.verifyToken,
      this.paymentsController.initiatePayment
    );

    // Callback route - receives notifications from Midtrans
    this.router.post("/callback", this.paymentsController.paymentCallback);

    // Test route that always returns 200 OK
    this.router.post("/callback-test", (req, res) => {
      console.log("Test callback received - Headers:", req.headers);
      console.log("Test callback received - Body:", req.body);
      res
        .status(200)
        .json({ success: true, message: "Test callback received" });
    });

    // Handle redirect from payment page
    this.router.get("/redirect", this.paymentsController.handlePaymentRedirect);

    // New endpoint to manually check and update payment status - WITH authentication
    this.router.get(
      "/:order_id/check-status",
      this.authMiddleware.verifyToken,
      this.paymentsController.checkPaymentStatus
    );

    // Public endpoint to manually check and update payment status - WITHOUT authentication
    // This will be useful for the payment success page
    this.router.get(
      "/public/:order_id/check-status",
      this.paymentsController.checkPaymentStatus
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
