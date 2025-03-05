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
exports.AuthController = void 0;
var client_1 = require("../../prisma/generated/client");
var createToken_1 = require("../helpers/createToken");
var mailer_1 = require("../services/mailer");
var hashpassword_1 = require("../helpers/hashpassword");
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var reffcode_1 = require("../helpers/reffcode");
var JWT_SECRET = process.env.SECRET_KEY || "osdjfksdhfishd";
var prisma = new client_1.PrismaClient();
var AuthController = /** @class */ (function () {
    function AuthController() {
    }
    AuthController.prototype.googleRegister = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, email, name_1, picture, users, token, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, email = _a.email, name_1 = _a.name, picture = _a.picture;
                        if (!email)
                            return [2 /*return*/, res.status(400).json({ error: "Email tidak ditemukan" })];
                        return [4 /*yield*/, prisma.user.upsert({
                                where: { email: email },
                                update: {}, // Jika user sudah ada, biarkan tetap sama
                                create: {
                                    email: email,
                                    role: "customer",
                                    username: name_1,
                                    avatar: picture,
                                    verified: true,
                                    referral_code: (0, reffcode_1.generateReferralCode)(8),
                                    first_name: name_1.split(" ")[0],
                                    last_name: name_1.split(" ")[1] || "",
                                    is_google: true,
                                },
                            })];
                    case 1:
                        users = _b.sent();
                        token = createToken_1.tokenService.createLoginToken({
                            id: users.user_id,
                            role: users.role,
                        });
                        // await sendVerificationEmail(email, token);
                        return [2 /*return*/, res.status(201).json({
                                status: "success",
                                token: token,
                                message: "Login google successfully.",
                                user: users,
                            })];
                    case 2:
                        error_1 = _b.sent();
                        console.error(error_1);
                        return [2 /*return*/, res
                                .status(500)
                                .json({ message: "Could Reach The Server Database" })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.registerCustomer = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var email, existingUser, newUser, token, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        email = req.body.email;
                        return [4 /*yield*/, prisma.user.findUnique({
                                where: { email: email },
                            })];
                    case 1:
                        existingUser = _a.sent();
                        if (existingUser) {
                            return [2 /*return*/, res
                                    .status(400)
                                    .json({ message: "Email address already exists" })];
                        }
                        return [4 /*yield*/, prisma.user.create({
                                data: {
                                    email: email,
                                    role: "customer",
                                    verified: false,
                                    referral_code: null,
                                },
                            })];
                    case 2:
                        newUser = _a.sent();
                        token = createToken_1.tokenService.createEmailRegisterToken({
                            id: newUser.user_id,
                            role: newUser.role,
                            email: email,
                        });
                        return [4 /*yield*/, prisma.user.update({
                                where: { user_id: newUser.user_id },
                                data: { verify_token: token },
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, (0, mailer_1.sendVerificationEmail)(email, token)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, res.status(201).json({
                                status: "success",
                                token: token,
                                message: "Registration successful. Please check your email for verification.",
                                user: newUser,
                            })];
                    case 5:
                        error_2 = _a.sent();
                        console.error(error_2);
                        return [2 /*return*/, res
                                .status(500)
                                .json({ message: "Could Reach The Server Database" })];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.registerStoreAdmin = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var email, existingUser, newUser, token, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        email = req.body.email;
                        return [4 /*yield*/, prisma.user.findUnique({
                                where: { email: email },
                            })];
                    case 1:
                        existingUser = _a.sent();
                        if (existingUser) {
                            return [2 /*return*/, res
                                    .status(400)
                                    .json({ message: "Email address already exists" })];
                        }
                        return [4 /*yield*/, prisma.user.create({
                                data: {
                                    email: email,
                                    role: "store_admin",
                                    verified: false,
                                    referral_code: null,
                                },
                            })];
                    case 2:
                        newUser = _a.sent();
                        token = createToken_1.tokenService.createEmailToken({
                            id: newUser.user_id,
                            role: newUser.role,
                            email: email,
                        });
                        return [4 /*yield*/, prisma.user.update({
                                where: { user_id: newUser.user_id },
                                data: { verify_token: token },
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, (0, mailer_1.sendVerificationEmail)(email, token)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, res.status(201).json({
                                status: "success",
                                token: token,
                                message: "Registration successful. Please check your email for verification.",
                                user: newUser,
                            })];
                    case 5:
                        error_3 = _a.sent();
                        console.error(error_3);
                        return [2 /*return*/, res
                                .status(500)
                                .json({ message: "Could Reach The Server Database" })];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.verifyAccount = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, username, firstName, lastName, phone, password, confirmPassword, referralCode, userId, user, hashedPassword, generatedReferralCode, referrer, existingReferral, discount, userVoucherCode, userVoucher, referrerVoucherCode, referrerVoucher, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 11, , 12]);
                        if (!req.user) {
                            return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                        }
                        _a = req.body, username = _a.username, firstName = _a.firstName, lastName = _a.lastName, phone = _a.phone, password = _a.password, confirmPassword = _a.confirmPassword, referralCode = _a.referralCode;
                        if (password !== confirmPassword) {
                            return [2 /*return*/, res.status(400).json({ message: "Passwords do not match" })];
                        }
                        userId = req.user.id;
                        return [4 /*yield*/, prisma.user.findUnique({
                                where: { user_id: userId },
                            })];
                    case 1:
                        user = _b.sent();
                        if (!user || user.verified) {
                            return [2 /*return*/, res.status(400).json({ message: "Invalid verification request" })];
                        }
                        return [4 /*yield*/, (0, hashpassword_1.hashPass)(password)];
                    case 2:
                        hashedPassword = _b.sent();
                        generatedReferralCode = user.referral_code || (0, reffcode_1.generateReferralCode)(8);
                        return [4 /*yield*/, prisma.user.update({
                                where: { user_id: userId },
                                data: {
                                    username: username,
                                    first_name: firstName || null,
                                    last_name: lastName || null,
                                    phone: phone,
                                    password: hashedPassword,
                                    verified: true,
                                    verify_token: null,
                                    referral_code: generatedReferralCode,
                                },
                            })];
                    case 3:
                        _b.sent();
                        referrer = null;
                        if (!referralCode) return [3 /*break*/, 10];
                        return [4 /*yield*/, prisma.user.findFirst({
                                where: { referral_code: referralCode },
                            })];
                    case 4:
                        referrer = _b.sent();
                        if (!(referrer && referrer.user_id !== userId)) return [3 /*break*/, 10];
                        return [4 /*yield*/, prisma.referral.findFirst({
                                where: { referrer_id: referrer.user_id, referred_id: userId },
                            })];
                    case 5:
                        existingReferral = _b.sent();
                        if (!!existingReferral) return [3 /*break*/, 10];
                        return [4 /*yield*/, prisma.discount.create({
                                data: {
                                    discount_code: "REF-".concat((0, reffcode_1.generateReferralCode)(6)),
                                    discount_type: "percentage",
                                    discount_value: 10,
                                    expires_at: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                                },
                            })];
                    case 6:
                        discount = _b.sent();
                        userVoucherCode = "VOUCHER-".concat((0, reffcode_1.generateReferralCode)(8));
                        return [4 /*yield*/, prisma.voucher.create({
                                data: {
                                    user_id: userId,
                                    discount_id: discount.discount_id,
                                    voucher_code: userVoucherCode,
                                    expires_at: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                                },
                            })];
                    case 7:
                        userVoucher = _b.sent();
                        referrerVoucherCode = "VOUCHER-".concat((0, reffcode_1.generateReferralCode)(8));
                        return [4 /*yield*/, prisma.voucher.create({
                                data: {
                                    user_id: referrer.user_id,
                                    discount_id: discount.discount_id,
                                    voucher_code: referrerVoucherCode,
                                    expires_at: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                                },
                            })];
                    case 8:
                        referrerVoucher = _b.sent();
                        // **Langkah 4: Simpan referral ke database**
                        return [4 /*yield*/, prisma.referral.create({
                                data: {
                                    referrer_id: referrer.user_id,
                                    referred_id: userId,
                                    referral_code: referralCode,
                                    reward_id: referrerVoucher.voucher_id, // Simpan voucher ID untuk referrer
                                },
                            })];
                    case 9:
                        // **Langkah 4: Simpan referral ke database**
                        _b.sent();
                        _b.label = 10;
                    case 10: return [2 /*return*/, res.status(200).json({
                            status: "success",
                            message: "Email verified successfully",
                            role: user.role,
                            referralUsed: referrer ? referrer.username : null,
                        })];
                    case 11:
                        error_4 = _b.sent();
                        console.error(error_4);
                        return [2 /*return*/, res.status(500).json({ error: "Could not reach the server database" })];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.resetPassword = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var email, isNewbie, findUser, token, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        email = req.body.email;
                        return [4 /*yield*/, prisma.user.findFirst({
                                where: { email: email, password: null },
                            })];
                    case 1:
                        isNewbie = _a.sent();
                        if (isNewbie) {
                            return [2 /*return*/, res.status(403).json({
                                    status: "error",
                                    token: "",
                                    message: "The email is have no password, Please choose another account.",
                                })];
                        }
                        return [4 /*yield*/, prisma.user.findFirst({
                                where: { email: email, role: "customer" },
                                select: {
                                    user_id: true,
                                    email: true,
                                    avatar: true,
                                    username: true,
                                    first_name: true,
                                    last_name: true,
                                    phone: true,
                                    role: true,
                                    verified: true,
                                    created_at: true,
                                    updated_at: true,
                                },
                            })];
                    case 2:
                        findUser = _a.sent();
                        if (!findUser) {
                            return [2 /*return*/, res.status(403).json({
                                    status: "error",
                                    token: "",
                                    message: "User not found.",
                                })];
                        }
                        token = createToken_1.tokenService.createResetToken({
                            id: findUser.user_id,
                            role: findUser.role,
                            resetPassword: findUser.role,
                        });
                        return [4 /*yield*/, prisma.user.update({
                                where: { user_id: findUser === null || findUser === void 0 ? void 0 : findUser.user_id },
                                data: { password_reset_token: token },
                            })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, (0, mailer_1.sendResetPassEmail)(email, token)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, res.status(201).json({
                                status: "success",
                                token: token,
                                message: "Reset Password Link send successfully. Please check your email for verification.",
                                user: findUser,
                            })];
                    case 5:
                        error_5 = _a.sent();
                        console.error(error_5);
                        return [2 /*return*/, res.status(500).json({ error: "Could Reach The Server Database" })];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.verifyResetPassword = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, password, confirmPassword, userId, user, hashedPassword, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        if (!req.user) {
                            return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                        }
                        _a = req.body, password = _a.password, confirmPassword = _a.confirmPassword;
                        // Validasi kesesuaian password baru
                        if (password !== confirmPassword) {
                            return [2 /*return*/, res.status(400).json({ message: "Passwords do not match" })];
                        }
                        userId = req.user.id;
                        return [4 /*yield*/, prisma.user.findUnique({
                                where: { user_id: userId },
                            })];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            return [2 /*return*/, res
                                    .status(400)
                                    .json({ message: "Invalid Reset password request" })];
                        }
                        return [4 /*yield*/, (0, hashpassword_1.hashPass)(password)];
                    case 2:
                        hashedPassword = _b.sent();
                        return [4 /*yield*/, prisma.user.update({
                                where: { user_id: userId },
                                data: {
                                    password: hashedPassword,
                                    verify_token: null,
                                    password_reset_token: null,
                                },
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                message: "Password Reset successfully",
                                role: user.role,
                            })];
                    case 4:
                        error_6 = _b.sent();
                        console.error(error_6);
                        return [2 /*return*/, res
                                .status(500)
                                .json({ message: "Could Reach The Server Database" })];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.loginAny = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, validPass, token, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // validation
                        if (!req.body.email || !req.body.password) {
                            return [2 /*return*/, res
                                    .status(400)
                                    .json({ message: "Email and password are required" })];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, prisma.user.findUnique({
                                where: { email: req.body.email },
                            })];
                    case 2:
                        user = _a.sent();
                        if (!user) {
                            return [2 /*return*/, res.status(400).json({ message: "User not found" })];
                        }
                        return [4 /*yield*/, bcrypt_1.default.compare(req.body.password, user.password)];
                    case 3:
                        validPass = _a.sent();
                        if (!validPass) {
                            return [2 /*return*/, res.status(400).json({ message: "Password incorrect!" })];
                        }
                        token = createToken_1.tokenService.createLoginToken({
                            id: user.user_id,
                            role: user.role,
                        });
                        return [2 /*return*/, res
                                .status(201)
                                .send({ status: "ok", msg: "Login Success", token: token, user: user })];
                    case 4:
                        error_7 = _a.sent();
                        console.error(error_7);
                        return [2 /*return*/, res.status(500).json({ message: "Internal server error" })];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    AuthController.prototype.checkExpTokenEmailVerif = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var token, decoded, tokenAge;
            return __generator(this, function (_a) {
                token = req.params.token;
                if (!token) {
                    return [2 /*return*/, res.status(401).json({ error: "Unauthorized" })];
                }
                try {
                    decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                    tokenAge = Math.floor(Date.now() / 1000) - decoded.iat;
                    if (tokenAge > 3600) {
                        // 1 jam = 3600 detik
                        return [2 /*return*/, res.status(409).json({ status: "no", message: "Token Expired" })];
                    }
                    return [2 /*return*/, res.status(200).json({ status: "ok", message: "Token Active" })];
                }
                catch (error) {
                    console.error(error);
                    return [2 /*return*/, res.status(400).json({ error: "Invalid or expired token" })];
                }
                return [2 /*return*/];
            });
        });
    };
    return AuthController;
}());
exports.AuthController = AuthController;
