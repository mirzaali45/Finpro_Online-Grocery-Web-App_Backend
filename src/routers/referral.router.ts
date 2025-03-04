import { Router, RequestHandler } from "express";
import { AuthMiddleware } from "../middleware/auth.verify";
import ReferralController from "../controllers/referral.controller";

export class ReferralRouter {
  private router: Router;
  private referralController: ReferralController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.referralController = new ReferralController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/redeem",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.referralController.redeemDiscount as unknown as RequestHandler
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
