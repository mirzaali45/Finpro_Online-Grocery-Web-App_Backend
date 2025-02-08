import { Router } from "express";
import { CekOngkirController } from "../controllers/cekOngkir.controller";
import { AuthMiddleware } from "../middleware/auth.verify";
import { RequestHandler } from "express-serve-static-core";
// cek ongkir jadinya pake binderbyte free limit 500 hit https://docs.binderbyte.com/api/cek-tarif
export class CekOngkirRouter {
  private router: Router;
  private cekOngkirController: CekOngkirController;
  private authMiddleware: AuthMiddleware;

  constructor() {
    this.router = Router();
    this.cekOngkirController = new CekOngkirController();
    this.authMiddleware = new AuthMiddleware();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // handle semua request cek ongkir dengan method post
    this.router.post(
      "/",
      this.cekOngkirController.getAll as unknown as RequestHandler
    );
  }

  getRouter(): Router {
    return this.router;
  }
}
