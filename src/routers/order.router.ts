import { Router } from "express";
import { OrdersController } from "../controllers/orders.controller";
import { AuthMiddleware } from "../middleware/auth.verify";

export class OrdersRouter {
  private router: Router;
  private ordersController: OrdersController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.ordersController = new OrdersController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      "/",
      this.authMiddleware.verifyToken,
      this.ordersController.createOrder
    );
  }
  getRouter(): Router {
    return this.router;
  }
}
