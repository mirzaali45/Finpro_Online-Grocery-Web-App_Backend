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
exports.SuperAdminController = void 0;
var client_1 = require("../../prisma/generated/client");
var bcrypt_1 = __importDefault(require("bcrypt"));
var reffcode_1 = require("../helpers/reffcode");
var cloudinary_1 = require("../services/cloudinary");
var prisma = new client_1.PrismaClient();
var SuperAdminController = /** @class */ (function () {
    function SuperAdminController() {
    }
    SuperAdminController.prototype.createUser = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, email, password, role, username, firstName, lastName, phone, avatarUrl, result, error_1, uploadError, existingUser, hashedPassword, newUser, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 11, , 12]);
                        _a = req.body, email = _a.email, password = _a.password, role = _a.role, username = _a.username, firstName = _a.firstName, lastName = _a.lastName, phone = _a.phone;
                        avatarUrl = null;
                        if (!req.file) return [3 /*break*/, 4];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, cloudinary_1.uploadAvatarImage)(req.file.path)];
                    case 2:
                        result = _b.sent();
                        avatarUrl = result.secure_url;
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        uploadError = error_1;
                        return [2 /*return*/, res
                                .status(400)
                                .json({
                                error: "Failed to upload avatar",
                                details: uploadError.message,
                            })];
                    case 4: return [4 /*yield*/, prisma.user.findUnique({
                            where: { email: email },
                        })];
                    case 5:
                        existingUser = _b.sent();
                        if (!existingUser) return [3 /*break*/, 8];
                        if (!avatarUrl) return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, cloudinary_1.deleteAvatarImage)(avatarUrl)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [2 /*return*/, res.status(400).json({ error: "Email already exists" })];
                    case 8: return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
                    case 9:
                        hashedPassword = _b.sent();
                        return [4 /*yield*/, prisma.user.create({
                                data: {
                                    email: email,
                                    password: hashedPassword,
                                    role: role,
                                    username: username,
                                    first_name: firstName,
                                    last_name: lastName,
                                    phone: phone,
                                    avatar: avatarUrl,
                                    verified: true,
                                    referral_code: role === "customer" ? (0, reffcode_1.generateReferralCode)(8) : null,
                                },
                            })];
                    case 10:
                        newUser = _b.sent();
                        return [2 /*return*/, res.status(201).json({
                                status: "success",
                                message: "User created successfully",
                                data: newUser,
                            })];
                    case 11:
                        error_2 = _b.sent();
                        console.error("Create user error:", error_2);
                        return [2 /*return*/, res.status(500).json({ error: "Could not create user" })];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    SuperAdminController.prototype.getAllUsers = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, skip, totalUsers, users, totalPages, hasNextPage, hasPrevPage, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        page = Number(req.query.page) || 1;
                        limit = Number(req.query.limit) || 10;
                        skip = (page - 1) * limit;
                        return [4 /*yield*/, prisma.user.count()];
                    case 1:
                        totalUsers = _a.sent();
                        return [4 /*yield*/, prisma.user.findMany({
                                select: {
                                    user_id: true,
                                    email: true,
                                    username: true,
                                    first_name: true,
                                    last_name: true,
                                    phone: true,
                                    role: true,
                                    verified: true,
                                    created_at: true,
                                    updated_at: true,
                                },
                                skip: skip,
                                take: limit,
                            })];
                    case 2:
                        users = _a.sent();
                        totalPages = Math.ceil(totalUsers / limit);
                        hasNextPage = page < totalPages;
                        hasPrevPage = page > 1;
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                data: users,
                                pagination: {
                                    total: totalUsers,
                                    page: page,
                                    limit: limit,
                                    totalPages: totalPages,
                                    hasNextPage: hasNextPage,
                                    hasPrevPage: hasPrevPage,
                                },
                            })];
                    case 3:
                        error_3 = _a.sent();
                        console.error("Error fetching users:", error_3);
                        return [2 /*return*/, res.status(500).json({ error: "Could not fetch users" })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    SuperAdminController.prototype.getUserById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, prisma.user.findUnique({
                                where: { user_id: parseInt(req.params.id) },
                                select: {
                                    user_id: true,
                                    email: true,
                                    username: true,
                                    first_name: true,
                                    last_name: true,
                                    phone: true,
                                    role: true,
                                    verified: true,
                                    created_at: true,
                                    updated_at: true,
                                    Store: true,
                                    orders: true,
                                    Address: true,
                                },
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, res.status(404).json({ error: "User not found" })];
                        return [2 /*return*/, res.status(200).json({ status: "success", data: user })];
                    case 2:
                        error_4 = _a.sent();
                        return [2 /*return*/, res.status(500).json({ error: "Could not fetch user" })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SuperAdminController.prototype.updateUserRole = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var role, user, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        role = req.body.role;
                        return [4 /*yield*/, prisma.user.update({
                                where: { user_id: parseInt(req.params.id) },
                                data: { role: role },
                            })];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, res.status(200).json({ status: "success", data: user })];
                    case 2:
                        error_5 = _a.sent();
                        return [2 /*return*/, res.status(500).json({ error: "Could not update user role" })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SuperAdminController.prototype.deleteUser = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, prisma.user.delete({
                                where: { user_id: parseInt(req.params.id) },
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, res
                                .status(200)
                                .json({ status: "success", message: "User deleted successfully" })];
                    case 2:
                        error_6 = _a.sent();
                        return [2 /*return*/, res.status(500).json({ error: "Could not delete user" })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return SuperAdminController;
}());
exports.SuperAdminController = SuperAdminController;
