"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
var express_1 = require("express");
var auth_controller_1 = require("../controllers/auth.controller");
var auth_verify_1 = require("../middleware/auth.verify");
var AuthRouter = /** @class */ (function () {
    function AuthRouter() {
        this.router = (0, express_1.Router)();
        this.authController = new auth_controller_1.AuthController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    AuthRouter.prototype.initializeRoutes = function () {
        this.router.post("/google", this.authController.googleRegister);
        this.router.post("/register", this.authController.registerCustomer);
        this.router.post("/register/store-admin", this.authController.registerStoreAdmin);
        this.router.post("/verification", this.authMiddleware.verifyToken, this.authController.verifyAccount);
        this.router.post("/reset-password", this.authController.resetPassword);
        this.router.post("/verify/reset-password", this.authMiddleware.verifyToken, this.authController.verifyResetPassword);
        this.router.post("/login", this.authController.loginAny);
        this.router.get("/check-email-token/:token", this.authController.checkExpTokenEmailVerif);
        this.router.get("/cek-token", this.authMiddleware.verifyExpiredToken);
    };
    AuthRouter.prototype.getRouter = function () {
        return this.router;
    };
    return AuthRouter;
}());
exports.AuthRouter = AuthRouter;
