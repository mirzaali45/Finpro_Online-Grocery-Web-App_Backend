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
      // this.authMiddleware.verifyToken,
      this.ordersController.createOrder
    );
    this.router.get(
      "/",
      // this.authMiddleware.checkSuperAdmin,
      this.ordersController.getOrders
    );
    this.router.patch("/:orderId/cancel", this.ordersController.cancelOrder);
    this.router.patch("/:orderId/confirm", this.ordersController.confirmOrder);
  }
  getRouter(): Router {
    return this.router;
  }
}
