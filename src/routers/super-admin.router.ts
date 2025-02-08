import { Router } from "express";
import { SuperAdminController } from "../controllers/super-admin.controller";
import { AuthMiddleware } from "../middleware/auth.verify";
import { RequestHandler } from "express-serve-static-core";

export class SuperAdminRouter {
  private router: Router;
  private superAdminController: SuperAdminController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.superAdminController = new SuperAdminController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create new user (store admin or customer)
    this.router.post(
      "/createusers",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.isSuperAdmin as unknown as RequestHandler,
      this.superAdminController.createUser as unknown as RequestHandler
    );

    // Get all users
    this.router.get(
      "/showallusers",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.isSuperAdmin as unknown as RequestHandler,
      this.superAdminController.getAllUsers as unknown as RequestHandler
    );

    // Get user by ID
    this.router.get(
      "/users/:id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.isSuperAdmin as unknown as RequestHandler,
      this.superAdminController.getUserById as unknown as RequestHandler
    );

    // Update user role 
    this.router.patch(
      "/users/:id/role",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.isSuperAdmin as unknown as RequestHandler,
      this.superAdminController.updateUserRole as unknown as RequestHandler
    );

    // Delete user
    this.router.delete(
      "/users/:id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.isSuperAdmin as unknown as RequestHandler,
      this.superAdminController.deleteUser as unknown as RequestHandler
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
