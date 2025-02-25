import { Router } from "express";
import { RajaOngkirController } from "../controllers/rajaOngkir.controller";
import { AuthMiddleware } from "../middleware/auth.verify";
import { RequestHandler } from "express-serve-static-core";

export class RajaOngkirRouter {
  private router: Router;
  private rajaOngkirController: RajaOngkirController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.rajaOngkirController = new RajaOngkirController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // Ambil daftar provinsi
    this.router.get(
      "/provinces",
      // this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.rajaOngkirController.getProvinces as unknown as RequestHandler
    );

    // Ambil daftar kota berdasarkan ID provinsi
    this.router.get(
      "/cities/:provinceId",
      // this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.rajaOngkirController.getCities as unknown as RequestHandler
    );

    // Hitung ongkir
    this.router.post(
      "/cost",
      this.authMiddleware.verifyToken as unknown as RequestHandler,
      this.rajaOngkirController.calculateShippingCost as unknown as RequestHandler
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
