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
    this.router.get(
      "/",
      this.authMiddleware.verifyToken,
      this.ordersController.getOrders
    );
    this.router.patch("/:order_id/cancel", this.ordersController.cancelOrder);
    this.router.patch("/:order_d/confirm", this.ordersController.confirmOrder);
  }
  getRouter(): Router {
    return this.router;
  }
}
