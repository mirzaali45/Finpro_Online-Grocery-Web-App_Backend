import { Router } from "express";
import { CategoryController } from "../controllers/category.controller";
import { RequestHandler } from "express-serve-static-core";
import { AuthMiddleware } from "../middleware/auth.verify";

export class CategoryRouter {
  private router: Router;
  private categoryController: CategoryController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.categoryController = new CategoryController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Create category - Super Admin only
    this.router.post(
      "/",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.categoryController.createCategory as unknown as RequestHandler
    );

    // Get all categories - Public
    this.router.get(
      "/",
      this.categoryController.getCategories as unknown as RequestHandler
    );

    // Get category by ID - Public
    this.router.get(
      "/:category_id",
      this.categoryController.getCategoryById as unknown as RequestHandler
    );

    // Update category - Super Admin only
    this.router.put(
      "/:category_id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.categoryController.updateCategory as unknown as RequestHandler
    );

    // Delete category - Super Admin only
    this.router.delete(
      "/:category_id",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.authMiddleware.checkSuperAdmin as unknown as RequestHandler,
      this.categoryController.deleteCategory as unknown as RequestHandler
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
