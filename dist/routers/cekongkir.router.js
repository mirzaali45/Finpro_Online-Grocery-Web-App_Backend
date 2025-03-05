"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CekOngkirRouter = void 0;
var express_1 = require("express");
var cekOngkir_controller_1 = require("../controllers/cekOngkir.controller");
var auth_verify_1 = require("../middleware/auth.verify");
// cek ongkir jadinya pake binderbyte free limit 500 hit https://docs.binderbyte.com/api/cek-tarif
var CekOngkirRouter = /** @class */ (function () {
    function CekOngkirRouter() {
        this.router = (0, express_1.Router)();
        this.cekOngkirController = new cekOngkir_controller_1.CekOngkirController();
        this.authMiddleware = new auth_verify_1.AuthMiddleware();
        this.initializeRoutes();
    }
    CekOngkirRouter.prototype.initializeRoutes = function () {
        // handle semua request cek ongkir dengan method post
        this.router.post("/", this.cekOngkirController.getAll);
    };
    CekOngkirRouter.prototype.getRouter = function () {
        return this.router;
    };
    return CekOngkirRouter;
}());
exports.CekOngkirRouter = CekOngkirRouter;
