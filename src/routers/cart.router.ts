import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { AuthMiddleware } from "../middleware/auth.verify";

export class CartRouter {
  private router: Router;
  private cartController: CartController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.cartController = new CartController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/get", this.authMiddleware.verifyToken , this.cartController.getCart);
    this.router.get("/user/:userId", this.cartController.getCartbyId);
    this.router.post("/add", this.cartController.addToCart);
    this.router.put("/updatecart", this.cartController.updateCart);
    this.router.delete(
      "/remove/:cartItemId",
      this.cartController.removeFromCart
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
 