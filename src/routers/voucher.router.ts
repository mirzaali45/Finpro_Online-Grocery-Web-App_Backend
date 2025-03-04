import { Router } from "express";
import { VoucherController } from "../controllers/voucher.controller";
import { RequestHandler } from "express-serve-static-core";
import { AuthMiddleware } from "../middleware/auth.verify";

export class VoucherRouter {
  private router: Router;
  private voucherController: VoucherController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.voucherController = new VoucherController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Claim a discount (create voucher)
    this.router.post(
      "/",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.voucherController.claimDiscount as unknown as RequestHandler
    );

    // Get user's vouchers
    this.router.get(
      "/my-vouchers",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.voucherController.getUserVouchers as unknown as RequestHandler
    );

    // Delete a voucher
    this.router.delete(
      "/:voucher_id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.voucherController.deleteVoucher as unknown as RequestHandler
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
