import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { RequestHandler } from "express-serve-static-core";
import { AuthMiddleware } from "../middleware/auth.verify";

export class AuthRouter {
  private router: Router;
  private authController: AuthController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.authController = new AuthController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/google",
      this.authController.googleRegister as unknown as RequestHandler
    );

    this.router.post(
      "/register",
      this.authController.registerCustomer as unknown as RequestHandler
    );

    this.router.post(
      "/register/store-admin",
      this.authController.registerStoreAdmin as unknown as RequestHandler
    );

    this.router.post(
      "/verification",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authController.verifyAccount as unknown as RequestHandler
    );

    this.router.post(
      "/reset-password",
      this.authController.resetPassword as unknown as RequestHandler
    );

    this.router.post(
      "/verify/reset-password",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authController.verifyResetPassword as unknown as RequestHandler
    );

    this.router.post(
      "/login",
      this.authController.loginAny as unknown as RequestHandler
    );

    this.router.get(
      "/check-email-token/:token",
      this.authController.checkExpTokenEmailVerif as unknown as RequestHandler
    );

    this.router.get(
      "/cek-token",
      this.authMiddleware.verifyExpiredToken as unknown as RequestHandler
    );
  }

  getRouter(): Router {
    return this.router;
  }
}

