"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreordermanagementsRouter = void 0;
const express_1 = require("express");
const store_orderManagements_controller_1 = require("../controllers/store-orderManagements.controller");
const auth_verify_1 = require("../middleware/auth.verify");
class StoreordermanagementsRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.storeordermanagementsController = new store_orderManagements_controller_1.StoreordermanagementsController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/", this.authMiddleware.verifyToken, this.authMiddleware.checkStrAdmin, this.storeordermanagementsController.getOrdersStr);
    }
    getRouter() {
        return this.router;
    }
}
exports.StoreordermanagementsRouter = StoreordermanagementsRouter;
