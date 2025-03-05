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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressCustomerController = void 0;
var client_1 = require("../../prisma/generated/client");
var prisma = new client_1.PrismaClient();
var AddressCustomerController = /** @class */ (function () {
    function AddressCustomerController() {
    }
    AddressCustomerController.prototype.getAddressCust = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var address, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!req.user) {
                            return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                        }
                        return [4 /*yield*/, prisma.address.findMany({
                                where: {
                                    user_id: req.user.id,
                                },
                                select: {
                                    address_id: true,
                                    user_id: true,
                                    address_name: true,
                                    address: true,
                                    subdistrict: true,
                                    city: true,
                                    province: true,
                                    province_id: true,
                                    city_id: true,
                                    postcode: true,
                                    latitude: true,
                                    longitude: true,
                                    is_primary: true,
                                },
                            })];
                    case 1:
                        address = _a.sent();
                        if (!address) {
                            return [2 /*return*/, res.status(404).json({ error: "Customer not found" })];
                        }
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                data: address,
                            })];
                    case 2:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [2 /*return*/, res.status(500).json({ error: "Could not fetch address customer data" })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AddressCustomerController.prototype.createAddressCust = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, address_name, address, subdistrict, city, city_id, province, province_id, postcode, latitude, longitude, is_primary, newAddress, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        if (!req.user) {
                            return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                        }
                        _a = req.body, address_name = _a.address_name, address = _a.address, subdistrict = _a.subdistrict, city = _a.city, city_id = _a.city_id, province = _a.province, province_id = _a.province_id, postcode = _a.postcode, latitude = _a.latitude, longitude = _a.longitude, is_primary = _a.is_primary;
                        // Validasi jika beberapa field tidak diisi
                        if (!address_name || !address || !city || !province) {
                            return [2 /*return*/, res.status(400).json({ error: "Please fill in all required fields." })];
                        }
                        return [4 /*yield*/, prisma.address.create({
                                data: {
                                    user_id: req.user.id,
                                    address_name: address_name,
                                    address: address,
                                    subdistrict: subdistrict || null,
                                    city: city,
                                    city_id: city_id || null,
                                    province: province,
                                    province_id: province_id || null,
                                    postcode: postcode || null,
                                    latitude: latitude ? Number(latitude) : 0,
                                    longitude: longitude ? Number(longitude) : 0,
                                    is_primary: is_primary !== null && is_primary !== void 0 ? is_primary : false,
                                },
                            })];
                    case 1:
                        newAddress = _b.sent();
                        return [2 /*return*/, res.status(201).json({
                                status: "success",
                                data: newAddress,
                                message: "Successfully created new address",
                            })];
                    case 2:
                        error_2 = _b.sent();
                        console.error(error_2);
                        return [2 /*return*/, res.status(500).json({ error: "Could not create address" })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AddressCustomerController.prototype.updatePrimaryAddress = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var is_primary, address_id, updatePrimaryAddress, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        if (!req.user) {
                            return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                        }
                        is_primary = req.body.is_primary;
                        address_id = req.params.address_id;
                        if (!is_primary) {
                            return [2 /*return*/, res.status(409).json({ error: "All Inputs is required." })];
                        }
                        // const checkPrimaryAddress = await prisma.address.findFirst({
                        //   where: {
                        //     user_id: req.user.id,
                        //     is_primary: true
                        //   }
                        // });
                        // if (checkPrimaryAddress) {
                        //   return res.status(409).json({ error: `Primary Address '${checkPrimaryAddress.address}' sudah ada.` });
                        // }
                        // Set semua address menjadi non-primary terlebih dahulu
                        return [4 /*yield*/, prisma.address.updateMany({
                                where: { user_id: Number(req.user.id) },
                                data: { is_primary: false }
                            })];
                    case 1:
                        // const checkPrimaryAddress = await prisma.address.findFirst({
                        //   where: {
                        //     user_id: req.user.id,
                        //     is_primary: true
                        //   }
                        // });
                        // if (checkPrimaryAddress) {
                        //   return res.status(409).json({ error: `Primary Address '${checkPrimaryAddress.address}' sudah ada.` });
                        // }
                        // Set semua address menjadi non-primary terlebih dahulu
                        _a.sent();
                        return [4 /*yield*/, prisma.address.update({
                                where: { address_id: Number(address_id) },
                                data: {
                                    is_primary: is_primary
                                }
                            })];
                    case 2:
                        updatePrimaryAddress = _a.sent();
                        if (!updatePrimaryAddress) {
                            return [2 /*return*/, res.status(404).json({ error: "Address not found" })];
                        }
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                data: updatePrimaryAddress,
                                message: "Success setting primary address"
                            })];
                    case 3:
                        error_3 = _a.sent();
                        console.error(error_3);
                        return [2 /*return*/, res.status(500).json({ error: "Could not update address" })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    AddressCustomerController.prototype.updateAddress = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, address, subdistrict, city, city_id, province, province_id, postcode, latitude, longitude, address_name, address_id, requiredFields, _i, _b, _c, key, value, updateAddress, error_4;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        if (!req.user) {
                            return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                        }
                        _a = req.body, address = _a.address, subdistrict = _a.subdistrict, city = _a.city, city_id = _a.city_id, province = _a.province, province_id = _a.province_id, postcode = _a.postcode, latitude = _a.latitude, longitude = _a.longitude, address_name = _a.address_name;
                        address_id = req.params.address_id;
                        requiredFields = { address: address, city: city, city_id: city_id, province: province, province_id: province_id, postcode: postcode, address_name: address_name };
                        for (_i = 0, _b = Object.entries(requiredFields); _i < _b.length; _i++) {
                            _c = _b[_i], key = _c[0], value = _c[1];
                            if (!value || value.trim() === "") {
                                return [2 /*return*/, res.status(409).json({ error: "Input '".concat(key, "' harus diisi.") })];
                            }
                        }
                        return [4 /*yield*/, prisma.address.update({
                                where: { address_id: Number(address_id) },
                                data: {
                                    address: address,
                                    subdistrict: subdistrict,
                                    city: city,
                                    city_id: city_id,
                                    province: province,
                                    province_id: province_id,
                                    postcode: postcode,
                                    latitude: latitude,
                                    longitude: longitude,
                                    address_name: address_name
                                }
                            })];
                    case 1:
                        updateAddress = _d.sent();
                        if (!updateAddress) {
                            return [2 /*return*/, res.status(404).json({ error: "Address not found" })];
                        }
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                data: updateAddress,
                                message: "Success updating address"
                            })];
                    case 2:
                        error_4 = _d.sent();
                        console.error(error_4);
                        return [2 /*return*/, res.status(500).json({ error: "Could not update address" })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AddressCustomerController.prototype.deleteAddress = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var address_id, error_5, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        address_id = req.params.address_id;
                        console.log(req.params);
                        return [4 /*yield*/, prisma.address.delete({
                                where: {
                                    address_id: parseInt(address_id),
                                },
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, res.status(200).json({ message: "Address deleted successfully" })];
                    case 2:
                        error_5 = _a.sent();
                        message = error_5 instanceof Error ? error_5.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AddressCustomerController.prototype.updateAvatarCustomerData = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var avatar, updateCust, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!req.user) {
                            return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                        }
                        avatar = req.body.avatar;
                        return [4 /*yield*/, prisma.user.update({
                                where: { user_id: req.user.id },
                                data: {
                                    avatar: avatar,
                                }
                            })];
                    case 1:
                        updateCust = _a.sent();
                        if (!updateCust) {
                            return [2 /*return*/, res.status(404).json({ error: "Customer not found" })];
                        }
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                data: updateCust,
                                message: "Success update avatar profile"
                            })];
                    case 2:
                        error_6 = _a.sent();
                        console.error(error_6);
                        return [2 /*return*/, res.status(500).json({ error: "Could not fetch customer data" })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AddressCustomerController;
}());
exports.AddressCustomerController = AddressCustomerController;
