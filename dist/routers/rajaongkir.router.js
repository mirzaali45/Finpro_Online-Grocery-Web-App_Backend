"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RajaOngkirRouter = void 0;
var express_1 = require("express");
var rajaOngkir_controller_1 = require("../controllers/rajaOngkir.controller");
var auth_verify_1 = require("../middleware/auth.verify");
var RajaOngkirRouter = /** @class */ (function () {
    function RajaOngkirRouter() {
        this.router = (0, express_1.Router)();
        this.rajaOngkirController = new rajaOngkir_controller_1.RajaOngkirController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    RajaOngkirRouter.prototype.initializeRoutes = function () {
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
    };
    RajaOngkirRouter.prototype.getRouter = function () {
        return this.router;
    };
    return RajaOngkirRouter;
}());
exports.RajaOngkirRouter = RajaOngkirRouter;
