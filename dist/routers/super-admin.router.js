"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminRouter = void 0;
const express_1 = require("express");
const super_admin_controller_1 = require("../controllers/super-admin.controller");
const auth_verify_1 = require("../middleware/auth.verify");
class SuperAdminRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.superAdminController = new super_admin_controller_1.SuperAdminController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Create new user (store admin or customer)
        this.router.post("/createusers", this.authMiddleware.verifyToken, this.authMiddleware.isSuperAdmin, this.superAdminController.createUser);
        // Get all users
        this.router.get("/showallusers", this.authMiddleware.verifyToken, this.authMiddleware.isSuperAdmin, this.superAdminController.getAllUsers);
        // Get user by ID
        this.router.get("/users/:id", this.authMiddleware.verifyToken, this.authMiddleware.isSuperAdmin, this.superAdminController.getUserById);
        // Update user role 
        this.router.patch("/users/:id/role", this.authMiddleware.verifyToken, this.authMiddleware.isSuperAdmin, this.superAdminController.updateUserRole);
        // Delete user
        this.router.delete("/users/:id", this.authMiddleware.verifyToken, this.authMiddleware.isSuperAdmin, this.superAdminController.deleteUser);
    }
    getRouter() {
        return this.router;
    }
}
exports.SuperAdminRouter = SuperAdminRouter;
