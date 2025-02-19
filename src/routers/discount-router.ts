import { Router } from "express";
import { DiscountController } from "../controllers/discount-controller";
import { AuthMiddleware } from "../middleware/auth.verify";

export class DiscountRouter {
  private router: Router;
  private discountController: DiscountController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.discountController = new DiscountController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.discountController.getAllDiscounts);
    this.router.get(
      "/getproduct",
      this.authMiddleware.checkStrAdmin,
      this.discountController.getProductStore
    );
    this.router.get("/active", this.discountController.getActiveDiscounts);
    this.router.get(
      "/store/:storeId",
      this.discountController.getStoreDiscounts
    );
    this.router.get("/:id", this.discountController.getDiscountById);

    this.router.post(
      "/create",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkStrAdmin,
      this.discountController.createDiscount
    );

    this.router.put(
      "/:id",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkStrAdmin,
      this.discountController.updateDiscount
    );

    this.router.delete(
      "/:id",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkStrAdmin,
      this.discountController.deleteDiscount
    );
    
 
  }

  getRouter(): Router {
    return this.router;
  }
}
