"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RajaOngkirRouter = void 0;
const express_1 = require("express");
const rajaOngkir_controller_1 = require("../controllers/rajaOngkir.controller");
const auth_verify_1 = require("../middleware/auth.verify");
class RajaOngkirRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.rajaOngkirController = new rajaOngkir_controller_1.RajaOngkirController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // Ambil daftar provinsi
        this.router.get("/provinces", 
        // this.authMiddleware.verifyToken as unknown as RequestHandler,
        this.rajaOngkirController.getProvinces);
        // Ambil daftar kota berdasarkan ID provinsi
        this.router.get("/cities/:provinceId", 
        // this.authMiddleware.verifyToken as unknown as RequestHandler,
        this.rajaOngkirController.getCities);
        this.router.get("/location", 
        // this.authMiddleware.verifyToken as unknown as RequestHandler,
        this.rajaOngkirController.getLocationId);
        // Hitung ongkir
        this.router.post("/cost", this.authMiddleware.verifyToken, this.rajaOngkirController.calculateShippingCost);
    }
    getRouter() {
        return this.router;
    }
}
exports.RajaOngkirRouter = RajaOngkirRouter;
