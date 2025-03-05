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
exports.CustomerController = void 0;
var client_1 = require("../../prisma/generated/client");
var hashpassword_1 = require("../helpers/hashpassword");
var createToken_1 = require("../helpers/createToken");
var mailer_1 = require("../services/mailer");
var prisma = new client_1.PrismaClient();
var CustomerController = /** @class */ (function () {
    function CustomerController() {
    }
    CustomerController.prototype.getCustomerData = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var customer, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        if (!req.user) {
                            return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                        }
                        return [4 /*yield*/, prisma.user.findFirst({
                                where: {
                                    user_id: req.user.id,
                                    role: "customer",
                                },
                                select: {
                                    user_id: true,
                                    email: true,
                                    avatar: true,
                                    username: true,
                                    password: true,
                                    first_name: true,
                                    last_name: true,
                                    phone: true,
                                    role: true,
                                    is_google: true,
                                    referral_code: true,
                                    verified: true,
                                    password_reset_token: true,
                                    created_at: true,
                                    updated_at: true,
                                },
                            })];
                    case 1:
                        customer = _a.sent();
                        if (!customer) {
                            return [2 /*return*/, res.status(404).json({ error: "Customer not found" })];
                        }
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                data: customer,
                            })];
                    case 2:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [2 /*return*/, res.status(500).json({ error: "Could not fetch customer data" })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CustomerController.prototype.setPassAuthGoogle = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, password, confirmPassword, hashedPassword, setPass, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        if (!req.user) {
                            return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                        }
                        _a = req.body, password = _a.password, confirmPassword = _a.confirmPassword;
                        if (password !== confirmPassword) {
                            return [2 /*return*/, res.status(400).json({ message: "Passwords do not match" })];
                        }
                        return [4 /*yield*/, (0, hashpassword_1.hashPass)(password)];
                    case 1:
                        hashedPassword = _b.sent();
                        return [4 /*yield*/, prisma.user.update({
                                where: { user_id: req.user.id },
                                data: {
                                    password: hashedPassword,
                                }
                            })];
                    case 2:
                        setPass = _b.sent();
                        if (!setPass) {
                            return [2 /*return*/, res.status(404).json({ error: "Customer not found" })];
                        }
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                data: setPass,
                                message: "Success update profile data"
                            })];
                    case 3:
                        error_2 = _b.sent();
                        console.error(error_2);
                        return [2 /*return*/, res.status(500).json({ error: "Could not fetch customer data" })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    CustomerController.prototype.updateCustomerData = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, firstName, lastName, email, phone, customer, updateCust, token, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        if (!req.user) {
                            return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                        }
                        _a = req.body, firstName = _a.firstName, lastName = _a.lastName, email = _a.email, phone = _a.phone;
                        return [4 /*yield*/, prisma.user.findFirst({
                                where: {
                                    user_id: req.user.id,
                                    role: "customer",
                                    email: email
                                }
                            })];
                    case 1:
                        customer = _b.sent();
                        updateCust = null;
                        if (!!customer) return [3 /*break*/, 5];
                        return [4 /*yield*/, prisma.user.update({
                                where: { user_id: req.user.id },
                                data: {
                                    verified: false,
                                    verify_token: null
                                }
                            })];
                    case 2:
                        _b.sent();
                        token = createToken_1.tokenService.createEmailRegisterToken({
                            id: req.user.id,
                            role: "customer",
                            email: email,
                        });
                        return [4 /*yield*/, prisma.user.update({
                                where: { user_id: req.user.id },
                                data: { verify_token: token }
                            })];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, (0, mailer_1.sendVerificationEmail)(email, token)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, prisma.user.update({
                            where: { user_id: req.user.id },
                            data: {
                                first_name: firstName,
                                last_name: lastName,
                                email: email,
                                phone: phone
                            }
                        })];
                    case 6:
                        updateCust = _b.sent();
                        if (!updateCust) {
                            return [2 /*return*/, res.status(404).json({ error: "Customer not found" })];
                        }
                        _b.label = 7;
                    case 7: return [2 /*return*/, res.status(200).json({
                            status: "success",
                            data: updateCust,
                            message: "Success update profile data"
                        })];
                    case 8:
                        error_3 = _b.sent();
                        console.error(error_3);
                        return [2 /*return*/, res.status(500).json({ error: "Could not fetch customer data" })];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    CustomerController.prototype.updateAvatarCustomerData = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var avatar, updateCust, error_4;
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
                        error_4 = _a.sent();
                        console.error(error_4);
                        return [2 /*return*/, res.status(500).json({ error: "Could not fetch customer data" })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return CustomerController;
}());
exports.CustomerController = CustomerController;
