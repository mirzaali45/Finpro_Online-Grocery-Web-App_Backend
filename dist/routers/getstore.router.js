"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreCustomerRouter = void 0;
const express_1 = require("express");
const getstorecustomer_controller_1 = require("../controllers/getstorecustomer.controller");
class StoreCustomerRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.storeController = new getstorecustomer_controller_1.GetStoreCustomer();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Route order matters - more specific routes should come first
        this.router.get("/search", this.storeController.searchStores);
        this.router.get("/", this.storeController.getAllStores);
        this.router.get("/:store_id", this.storeController.getStoreById);
    }
    getRouter() {
        return this.router;
    }
}
exports.StoreCustomerRouter = StoreCustomerRouter;
