"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerRouter = void 0;
var express_1 = require("express");
var customer_controller_1 = require("../controllers/customer.controller");
var auth_verify_1 = require("../middleware/auth.verify");
var address_customer_controller_1 = require("../controllers/address-customer.controller");
var orders_controller_1 = require("../controllers/orders.controller");
var CustomerRouter = /** @class */ (function () {
    function CustomerRouter() {
        this.router = (0, express_1.Router)();
        this.customerController = new customer_controller_1.CustomerController();
        this.addressCustomerController = new address_customer_controller_1.AddressCustomerController();
        this.ordersController = new orders_controller_1.OrdersController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    CustomerRouter.prototype.initializeRoutes = function () {
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
    };
    CustomerRouter.prototype.getRouter = function () {
        return this.router;
    };
    return CustomerRouter;
}());
exports.CustomerRouter = CustomerRouter;
