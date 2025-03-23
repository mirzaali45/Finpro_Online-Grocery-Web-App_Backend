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
    // Create order from cart
    this.router.post(
      "/from-cart",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.ordersController.createOrderFromCart.bind(this.ordersController)
    );

    // Get orders with optional filters (admin route)
    this.router.get(
      "/",
      this.authMiddleware.verifyToken,
      this.ordersController.getOrders.bind(this.ordersController)
    );

    // Get the authenticated user's orders
    this.router.get(
      "/my-orders",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.ordersController.getMyOrders.bind(this.ordersController)
    );

    // Delete/cancel the user's order
    this.router.delete(
      "/delete/:order_id",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.ordersController.deleteMyOrder.bind(this.ordersController)
    );
    this.router.get(
      "/Query",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.ordersController.QueryOrders.bind(this.ordersController)
    );

    // Update order total price
    this.router.put(
      "/:order_id",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.ordersController.updateOrder.bind(this.ordersController)
    );
    this.router.post(
      "/confirm",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.ordersController.confirmOrder.bind(this.ordersController)
    );
    this.router.patch(
      "/:order_id/update-status",
      this.authMiddleware.verifyToken.bind(this.authMiddleware),
      this.ordersController.updateOrderStatus.bind(this.ordersController)
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
