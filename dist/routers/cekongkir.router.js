"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CekOngkirRouter = void 0;
const express_1 = require("express");
const cekOngkir_controller_1 = require("../controllers/cekOngkir.controller");
const auth_verify_1 = require("../middleware/auth.verify");
// cek ongkir jadinya pake binderbyte free limit 500 hit https://docs.binderbyte.com/api/cek-tarif
class CekOngkirRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.cekOngkirController = new cekOngkir_controller_1.CekOngkirController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    initializeRoutes() {
        // handle semua request cek ongkir dengan method post
        this.router.post("/", this.cekOngkirController.getAll);
    }
    getRouter() {
        return this.router;
    }
}
exports.CekOngkirRouter = CekOngkirRouter;
