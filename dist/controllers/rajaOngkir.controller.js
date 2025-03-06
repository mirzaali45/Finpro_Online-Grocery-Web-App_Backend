"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RajaOngkirController = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = process.env.RAJAONGKIR_BASE_URL;
class RajaOngkirController {
    // Ambil daftar provinsi
    getProvinces(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${BASE_URL}/province`, {
                    headers: {
                        "x-api-key": API_KEY,
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                });
                res.json(response.data);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Failed to fetch provinces" });
            }
        });
    }
    // Ambil daftar kota berdasarkan ID provinsi
    getCities(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { provinceId } = req.params;
            try {
                const response = yield axios_1.default.get(`${BASE_URL}/city?province=${provinceId}`, {
                    headers: { key: API_KEY, "Accept": "application/json" },
                });
                console.log(response);
                res.json(response.data);
            }
            catch (error) {
                //   console.error(error);
                res.status(500).json({ error: error });
            }
        });
    }
    getLocationId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${BASE_URL}/tariff/api/v1/destination/search?keyword=${req.query.keyword}`, {
                    headers: { "x-api-key": API_KEY, 'Accept': 'application/json' },
                });
                console.log(response);
                res.json(response.data);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: error });
            }
        });
    }
    // Hitung ongkir
    calculateShippingCost(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { origin, destination, weight, price } = req.body;
            try {
                const response = yield axios_1.default.get(`${BASE_URL}/tariff/api/v1/calculate?shipper_destination_id=${origin}&receiver_destination_id=${destination}&weight=${weight}&item_value=${price}&cod=no`, {
                    headers: { "x-api-key": API_KEY, 'Accept': 'application/json' },
                });
                res.json(response.data);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Failed to calculate shipping cost" });
            }
        });
    }
}
exports.RajaOngkirController = RajaOngkirController;
