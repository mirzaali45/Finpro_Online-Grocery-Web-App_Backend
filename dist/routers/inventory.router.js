"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryRouter = void 0;
var express_1 = require("express");
var inventory_controller_1 = require("../controllers/inventory.controller");
var auth_verify_1 = require("../middleware/auth.verify");
var InventoryRouter = /** @class */ (function () {
    function InventoryRouter() {
        this.router = (0, express_1.Router)();
        this.inventoryController = new inventory_controller_1.InventoryController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    InventoryRouter.prototype.initializeRoutes = function () {
        // Create inventory - Super Admin only
        this.router.post("/", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.inventoryController.createInventory);
        // Get all inventory - Both Super Admin and Store Admin
        this.router.get("/", this.authMiddleware.verifyToken, this.inventoryController.getInventory);
        // Get specific inventory - Both Super Admin and Store Admin
        this.router.get("/:inv_id", this.authMiddleware.verifyToken, this.inventoryController.getInventoryById);
        // Update inventory - Super Admin only
        this.router.put("/:inv_id", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.inventoryController.updateInventory);
        // Delete inventory - Super Admin only
        this.router.delete("/:inv_id", this.authMiddleware.verifyToken, this.authMiddleware.checkSuperAdmin, this.inventoryController.deleteInventory);
        // Get low stock products - Both Super Admin and Store Admin
        this.router.get("/low-stock", this.authMiddleware.verifyToken, this.inventoryController.getLowStockProducts);
    };
    InventoryRouter.prototype.getRouter = function () {
        return this.router;
    };
    return InventoryRouter;
}());
exports.InventoryRouter = InventoryRouter;
