import { Router } from "express";
import { GetStoreCustomer } from "../controllers/getstorecustomer.controller";

export class StoreCustomerRouter {
  private router: Router;
  private storeController: GetStoreCustomer;

  constructor() {
    this.router = Router();
    this.storeController = new GetStoreCustomer();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Route order matters - more specific routes should come first
    this.router.get("/search", this.storeController.searchStores);
    this.router.get("/", this.storeController.getAllStores);
    this.router.get("/:store_id", this.storeController.getStoreById);
  }

  getRouter(): Router {
    return this.router;
  }
}
