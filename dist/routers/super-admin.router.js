"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminRouter = void 0;
var express_1 = require("express");
var super_admin_controller_1 = require("../controllers/super-admin.controller");
var auth_verify_1 = require("../middleware/auth.verify");
var cloudinary_1 = require("../services/cloudinary"); // Import the uploadAvatar middleware
var SuperAdminRouter = /** @class */ (function () {
    function SuperAdminRouter() {
        this.router = (0, express_1.Router)();
        this.superAdminController = new super_admin_controller_1.SuperAdminController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    SuperAdminRouter.prototype.initializeRoutes = function () {
        // Create new user (store admin or customer) with avatar upload
        this.router.post("/createusers", this.authMiddleware.verifyToken, this.authMiddleware.isSuperAdmin, cloudinary_1.uploadAvatar.single("avatar"), // Add multer middleware for avatar upload
        this.superAdminController.createUser);
        // Rest of your routes remain the same
        // Get all users
        this.router.get("/showallusers", this.authMiddleware.verifyToken, this.authMiddleware.isSuperAdmin, this.superAdminController.getAllUsers);
        // Get user by ID
        this.router.get("/users/:id", this.authMiddleware.verifyToken, this.authMiddleware.isSuperAdmin, this.superAdminController.getUserById);
        // Update user role
        this.router.patch("/users/:id/role", this.authMiddleware.verifyToken, this.authMiddleware.isSuperAdmin, this.superAdminController.updateUserRole);
        // Delete user
        this.router.delete("/users/:id", this.authMiddleware.verifyToken, this.authMiddleware.isSuperAdmin, this.superAdminController.deleteUser);
    };
    SuperAdminRouter.prototype.getRouter = function () {
        return this.router;
    };
    return SuperAdminRouter;
}());
exports.SuperAdminRouter = SuperAdminRouter;
