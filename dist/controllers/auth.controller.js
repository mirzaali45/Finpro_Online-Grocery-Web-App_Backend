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
exports.AuthController = void 0;
const client_1 = require("../../prisma/generated/client");
const createToken_1 = require("../helpers/createToken");
const mailer_1 = require("../services/mailer");
const hashpassword_1 = require("../helpers/hashpassword");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const reffcode_1 = require("../helpers/reffcode");
const JWT_SECRET = process.env.SECRET_KEY || "osdjfksdhfishd";
const prisma = new client_1.PrismaClient();
class AuthController {
    googleRegister(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, name, picture } = req.body;
                if (!email)
                    return res.status(400).json({ error: "Email tidak ditemukan" });
                let users = yield prisma.user.upsert({
                    where: { email },
                    update: {}, // Jika user sudah ada, biarkan tetap sama
                    create: {
                        email: email,
                        role: "customer",
                        username: name,
                        avatar: picture,
                        verified: true,
                        referral_code: (0, reffcode_1.generateReferralCode)(8),
                        first_name: name.split(" ")[0],
                        last_name: name.split(" ")[1] || "",
                        is_google: true,
                    },
                });
                const token = createToken_1.tokenService.createLoginToken({
                    id: users.user_id,
                    role: users.role,
                });
                // await sendVerificationEmail(email, token);
                return res.status(201).json({
                    status: "success",
                    token: token,
                    message: "Login google successfully.",
                    user: users,
                });
            }
            catch (error) {
                console.error(error);
                return res
                    .status(500)
                    .json({ message: "Could Reach The Server Database" });
            }
        });
    }
    registerCustomer(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const existingUser = yield prisma.user.findUnique({
                    where: { email },
                });
                if (existingUser) {
                    return res
                        .status(400)
                        .json({ message: "Email address already exists" });
                }
                const newUser = yield prisma.user.create({
                    data: {
                        email,
                        role: "customer",
                        verified: false,
                        referral_code: null,
                    },
                });
                const token = createToken_1.tokenService.createEmailRegisterToken({
                    id: newUser.user_id,
                    role: newUser.role,
                    email,
                });
                yield prisma.user.update({
                    where: { user_id: newUser.user_id },
                    data: { verify_token: token },
                });
                yield (0, mailer_1.sendVerificationEmail)(email, token);
                return res.status(201).json({
                    status: "success",
                    token: token,
                    message: "Registration successful. Please check your email for verification.",
                    user: newUser,
                });
            }
            catch (error) {
                console.error(error);
                return res
                    .status(500)
                    .json({ message: "Could Reach The Server Database" });
            }
        });
    }
    registerStoreAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const existingUser = yield prisma.user.findUnique({
                    where: { email },
                });
                if (existingUser) {
                    return res
                        .status(400)
                        .json({ message: "Email address already exists" });
                }
                // const token = tokenService.createEmailToken({ id: 0, role: "customer", email });
                const newUser = yield prisma.user.create({
                    data: {
                        email,
                        role: "store_admin",
                        verified: false,
                        referral_code: null,
                    },
                });
                const token = createToken_1.tokenService.createEmailToken({
                    id: newUser.user_id,
                    role: newUser.role,
                    email,
                });
                yield prisma.user.update({
                    where: { user_id: newUser.user_id },
                    data: { verify_token: token },
                });
                yield (0, mailer_1.sendVerificationEmail)(email, token);
                return res.status(201).json({
                    status: "success",
                    token: token,
                    message: "Registration successful. Please check your email for verification.",
                    user: newUser,
                });
            }
            catch (error) {
                console.error(error);
                return res
                    .status(500)
                    .json({ message: "Could Reach The Server Database" });
            }
        });
    }
    verifyAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const { username, firstName, lastName, phone, password, confirmPassword, referralCode } = req.body;
                if (password !== confirmPassword) {
                    return res.status(400).json({ message: "Passwords do not match" });
                }
                const userId = req.user.id;
                const user = yield prisma.user.findUnique({
                    where: { user_id: userId },
                });
                if (!user || user.verified) {
                    return res.status(400).json({ message: "Invalid verification request" });
                }
                const hashedPassword = yield (0, hashpassword_1.hashPass)(password);
                const generatedReferralCode = user.referral_code || (0, reffcode_1.generateReferralCode)(8);
                yield prisma.user.update({
                    where: { user_id: userId },
                    data: {
                        username,
                        first_name: firstName || null,
                        last_name: lastName || null,
                        phone,
                        password: hashedPassword,
                        verified: true,
                        verify_token: null,
                        referral_code: generatedReferralCode,
                    },
                });
                let referrer = null;
                if (referralCode) {
                    referrer = yield prisma.user.findFirst({
                        where: { referral_code: referralCode },
                    });
                    if (referrer && referrer.user_id !== userId) {
                        const existingReferral = yield prisma.referral.findFirst({
                            where: { referrer_id: referrer.user_id, referred_id: userId },
                        });
                        if (!existingReferral) {
                            // **Langkah 1: Buat diskon baru**
                            const discount = yield prisma.discount.create({
                                data: {
                                    discount_code: `REF-${(0, reffcode_1.generateReferralCode)(6)}`,
                                    discount_type: "percentage",
                                    discount_value: 10,
                                    expires_at: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                                },
                            });
                            // **Langkah 2: Buat voucher unik untuk customer baru**
                            const userVoucherCode = `VOUCHER-${(0, reffcode_1.generateReferralCode)(8)}`;
                            const userVoucher = yield prisma.voucher.create({
                                data: {
                                    user_id: userId,
                                    discount_id: discount.discount_id,
                                    voucher_code: userVoucherCode,
                                    expires_at: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                                },
                            });
                            // **Langkah 3: Buat voucher unik untuk referrer**
                            const referrerVoucherCode = `VOUCHER-${(0, reffcode_1.generateReferralCode)(8)}`;
                            const referrerVoucher = yield prisma.voucher.create({
                                data: {
                                    user_id: referrer.user_id,
                                    discount_id: discount.discount_id,
                                    voucher_code: referrerVoucherCode,
                                    expires_at: new Date(new Date().setMonth(new Date().getMonth() + 1)),
                                },
                            });
                            // **Langkah 4: Simpan referral ke database**
                            yield prisma.referral.create({
                                data: {
                                    referrer_id: referrer.user_id,
                                    referred_id: userId,
                                    referral_code: referralCode,
                                    reward_id: referrerVoucher.voucher_id, // Simpan voucher ID untuk referrer
                                },
                            });
                        }
                    }
                }
                return res.status(200).json({
                    status: "success",
                    message: "Email verified successfully",
                    role: user.role,
                    referralUsed: referrer ? referrer.username : null,
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Could not reach the server database" });
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                const isNewbie = yield prisma.user.findFirst({
                    where: { email, password: null },
                });
                if (isNewbie) {
                    return res.status(403).json({
                        status: "error",
                        token: "",
                        message: "The email is have no password, Please choose another account.",
                    });
                }
                const findUser = yield prisma.user.findFirst({
                    where: { email, role: "customer" },
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
                });
                if (!findUser) {
                    return res.status(403).json({
                        status: "error",
                        token: "",
                        message: "User not found.",
                    });
                }
                const token = createToken_1.tokenService.createResetToken({
                    id: findUser.user_id,
                    role: findUser.role,
                    resetPassword: findUser.role,
                });
                yield prisma.user.update({
                    where: { user_id: findUser === null || findUser === void 0 ? void 0 : findUser.user_id },
                    data: { password_reset_token: token },
                });
                yield (0, mailer_1.sendResetPassEmail)(email, token);
                return res.status(201).json({
                    status: "success",
                    token: token,
                    message: "Reset Password Link send successfully. Please check your email for verification.",
                    user: findUser,
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Could Reach The Server Database" });
            }
        });
    }
    verifyResetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                const { password, confirmPassword } = req.body;
                // Validasi kesesuaian password baru
                if (password !== confirmPassword) {
                    return res.status(400).json({ message: "Passwords do not match" });
                }
                const userId = req.user.id;
                // Cari pengguna berdasarkan ID
                const user = yield prisma.user.findUnique({
                    where: { user_id: userId },
                });
                if (!user) {
                    return res
                        .status(400)
                        .json({ message: "Invalid Reset password request" });
                }
                // Hash dan simpan password baru
                const hashedPassword = yield (0, hashpassword_1.hashPass)(password);
                yield prisma.user.update({
                    where: { user_id: userId },
                    data: {
                        password: hashedPassword,
                        verify_token: null,
                        password_reset_token: null,
                    },
                });
                return res.status(200).json({
                    status: "success",
                    message: "Password Reset successfully",
                    role: user.role,
                });
            }
            catch (error) {
                console.error(error);
                return res
                    .status(500)
                    .json({ message: "Could Reach The Server Database" });
            }
        });
    }
    loginAny(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // validation
            if (!req.body.email || !req.body.password) {
                return res
                    .status(400)
                    .json({ message: "Email and password are required" });
            }
            try {
                const user = yield prisma.user.findUnique({
                    where: { email: req.body.email },
                });
                if (!user) {
                    return res.status(400).json({ message: "User not found" });
                }
                const validPass = yield bcrypt_1.default.compare(req.body.password, user.password);
                if (!validPass) {
                    return res.status(400).json({ message: "Password incorrect!" });
                }
                const token = createToken_1.tokenService.createLoginToken({
                    id: user.user_id,
                    role: user.role,
                });
                return res
                    .status(201)
                    .send({ status: "ok", msg: "Login Success", token, user });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    checkExpTokenEmailVerif(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token } = req.params;
            if (!token) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            try {
                // Verifikasi token
                const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
                // Cek apakah token sudah lebih dari 1 jam sejak dibuat
                const tokenAge = Math.floor(Date.now() / 1000) - decoded.iat; // Selisih waktu dalam detik
                if (tokenAge > 3600) {
                    // 1 jam = 3600 detik
                    return res.status(409).json({ status: "no", message: "Token Expired" });
                }
                return res.status(200).json({ status: "ok", message: "Token Active" });
            }
            catch (error) {
                console.error(error);
                return res.status(400).json({ error: "Invalid or expired token" });
            }
        });
    }
}
exports.AuthController = AuthController;
