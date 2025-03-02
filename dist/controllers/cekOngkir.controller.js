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
exports.CekOngkirController = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const BINDER_API_KEY = process.env.BINDERBYTE_API_KEY;
class CekOngkirController {
    // handle router api cek ongkir
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { origin, destination, weight, couriers } = req.body;
            const apiKey = BINDER_API_KEY; // api key binder ada di env
            try {
                // coba fetch api binder untuk mendapatkan suatu cek ongkir
                const response = yield fetch(`https://api.binderbyte.com/v1/cost?api_key=${apiKey}&courier=${couriers}&origin=${origin}&destination=${destination}&weight=${weight}`);
                const data = yield response.json();
                // jika gagal atau data kosong kembalikan error dengan status 400 / not found
                if (!data) {
                    return res.status(400).json({ status: 400, error: "gagal fetch : " + data.message });
                }
                // jika data ada maka kembalikan data tersebut ke frontend 
                res.json(data);
            }
            catch (error) {
                // handle error
                res.status(500).json({ status: 500, error: error });
            }
        });
    }
}
exports.CekOngkirController = CekOngkirController;
