"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRouter = void 0;
const express_1 = require("express");
const customer_controller_1 = require("../controllers/customer.controller");
const auth_verify_1 = require("../middleware/auth.verify");
const address_customer_controller_1 = require("../controllers/address-customer.controller");
const orders_controller_1 = require("../controllers/orders.controller");
class CustomerRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.customerController = new customer_controller_1.CustomerController();
        this.addressCustomerController = new address_customer_controller_1.AddressCustomerController();
        this.ordersController = new orders_controller_1.OrdersController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/profile", this.authMiddleware.verifyToken, this.customerController.getCustomerData);
        this.router.post("/profile/set-password", this.authMiddleware.verifyToken, this.customerController.setPassAuthGoogle);
        this.router.post("/profile/update", this.authMiddleware.verifyToken, this.customerController.updateCustomerData);
        this.router.post("/profile/avatar/update", this.authMiddleware.verifyToken, this.customerController.updateAvatarCustomerData);
        this.router.get("/address", this.authMiddleware.verifyToken, this.addressCustomerController.getAddressCust);
        this.router.post("/address", this.authMiddleware.verifyToken, this.addressCustomerController.createAddressCust);
        this.router.put("/address/primary/:address_id", this.authMiddleware.verifyToken, this.addressCustomerController.updatePrimaryAddress);
        this.router.put("/address/:address_id", this.authMiddleware.verifyToken, this.addressCustomerController.updateAddress);
        this.router.delete("/address/:address_id", this.authMiddleware.verifyToken, this.addressCustomerController.deleteAddress);
        this.router.get("/orders", this.authMiddleware.verifyToken, this.ordersController.getOrders);
    }
    getRouter() {
        return this.router;
    }
}
exports.CustomerRouter = CustomerRouter;
