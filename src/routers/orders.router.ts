import { Router } from "express";
import { OrdersController } from "../controllers/orders.controller";
import { AuthMiddleware } from "../middleware/auth.verify";

export class OrderRouter {
  private router: Router;
  private orderController: OrdersController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.orderController = new OrdersController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post("/orders", this.authMiddleware.verifyToken, this.orderController.createOrder);
    this.router.get("/orders/:user_id", this.authMiddleware.checkSuperAdmin, this.orderController.getOrders)
    this.router.patch("/orders/cancel/:order_id", this.orderController.cancelOrder)
    this.router.patch("/orders/confirm/:order_id", this.orderController.confirmOrder)
  }
  getRouter(): Router {
    return this.router;
  }
}
