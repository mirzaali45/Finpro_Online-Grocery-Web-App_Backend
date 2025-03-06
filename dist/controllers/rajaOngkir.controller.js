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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RajaOngkirController = void 0;
var axios_1 = __importDefault(require("axios"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var API_KEY = process.env.RAJAONGKIR_API_KEY;
var BASE_URL = process.env.RAJAONGKIR_BASE_URL;
var RajaOngkirController = /** @class */ (function () {
    function RajaOngkirController() {
    }
    // Ambil daftar provinsi
    RajaOngkirController.prototype.getProvinces = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get("".concat(BASE_URL, "/province"), {
                                headers: {
                                    "x-api-key": API_KEY,
                                    "Content-Type": "application/x-www-form-urlencoded",
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        res.json(response.data);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error(error_1);
                        res.status(500).json({ error: "Failed to fetch provinces" });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Ambil daftar kota berdasarkan ID provinsi
    RajaOngkirController.prototype.getCities = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var provinceId, response, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provinceId = req.params.provinceId;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get("".concat(BASE_URL, "/city?province=").concat(provinceId), {
                                headers: { key: API_KEY, "Accept": "application/json" },
                            })];
                    case 2:
                        response = _a.sent();
                        console.log(response);
                        res.json(response.data);
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        //   console.error(error);
                        res.status(500).json({ error: error_2 });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    RajaOngkirController.prototype.getLocationId = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, axios_1.default.get("".concat(BASE_URL, "/tariff/api/v1/destination/search?keyword=").concat(req.query.keyword), {
                                headers: { "x-api-key": API_KEY, 'Accept': 'application/json' },
                            })];
                    case 1:
                        response = _a.sent();
                        console.log(response);
                        res.json(response.data);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error(error_3);
                        res.status(500).json({ error: error_3 });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Hitung ongkir
    RajaOngkirController.prototype.calculateShippingCost = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, origin, destination, weight, price, response, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = req.body, origin = _a.origin, destination = _a.destination, weight = _a.weight, price = _a.price;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1.default.get("".concat(BASE_URL, "/tariff/api/v1/calculate?shipper_destination_id=").concat(origin, "&receiver_destination_id=").concat(destination, "&weight=").concat(weight, "&item_value=").concat(price, "&cod=no"), {
                                headers: { "x-api-key": API_KEY, 'Accept': 'application/json' },
                            })];
                    case 2:
                        response = _b.sent();
                        res.json(response.data);
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _b.sent();
                        console.error(error_4);
                        res.status(500).json({ error: "Failed to calculate shipping cost" });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return RajaOngkirController;
}());
exports.RajaOngkirController = RajaOngkirController;
