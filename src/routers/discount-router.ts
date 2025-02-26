import { Router } from "express";
import { DiscountController } from "../controllers/discount.controller";
import { AuthMiddleware } from "../middleware/auth.verify";
import { uploadDiscountImage } from "../services/cloudinary";

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
    // Get discount routes
    this.router.get("/", this.discountController.getAllDiscounts);
    this.router.get(
      "/store",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkStrAdmin,
      this.discountController.getStoreDiscounts
    );
    this.router.get(
      "/product/:productId",
      this.discountController.getProductDiscounts
    );
    this.router.get(
      "/user/:userId",
      this.authMiddleware.verifyToken,
      this.discountController.getUserDiscounts
    );
    this.router.get("/:id", this.discountController.getDiscountById);

   this.router.post(
     "/create",
     this.authMiddleware.verifyToken,
     this.authMiddleware.checkStrAdmin,
     uploadDiscountImage.single("thumbnail"),
     this.discountController.createDiscount
   );

    // Update discount route
    this.router.put(
      "/:id",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkStrAdmin,
      this.discountController.updateDiscount
    );

    // Delete discount route
    this.router.delete(
      "/:id",
      this.authMiddleware.verifyToken,
      this.authMiddleware.checkStrAdmin,
      this.discountController.deleteDiscount
    );

    // Discount application routes
    this.router.post("/apply", this.discountController.applyDiscount);
  }

  getRouter(): Router {
    return this.router;
  }
}
