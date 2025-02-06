import { Router } from "express";
import { CartController } from "../controllers/cart.controller";

export class CartRouter {
  private router: Router;
  private cartController: CartController;

  constructor() {
    this.router = Router();
    this.cartController = new CartController();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.get("/get", this.cartController.getCart);
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
