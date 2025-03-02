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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
const client_1 = require("../../prisma/generated/client");
const hashpassword_1 = require("../helpers/hashpassword");
const createToken_1 = require("../helpers/createToken");
const mailer_1 = require("../services/mailer");
const prisma = new client_1.PrismaClient();
class CustomerController {
    getCustomerData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const customer = yield prisma.user.findFirst({
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
                });
                if (!customer) {
                    return res.status(404).json({ error: "Customer not found" });
                }
                return res.status(200).json({
                    status: "success",
                    data: customer,
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Could not fetch customer data" });
            }
        });
    }
    setPassAuthGoogle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const { password, confirmPassword } = req.body;
                if (password !== confirmPassword) {
                    return res.status(400).json({ message: "Passwords do not match" });
                }
                const hashedPassword = yield (0, hashpassword_1.hashPass)(password);
                const setPass = yield prisma.user.update({
                    where: { user_id: req.user.id },
                    data: {
                        password: hashedPassword,
                    }
                });
                if (!setPass) {
                    return res.status(404).json({ error: "Customer not found" });
                }
                return res.status(200).json({
                    status: "success",
                    data: setPass,
                    message: "Success update profile data"
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Could not fetch customer data" });
            }
        });
    }
    updateCustomerData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const { firstName, lastName, email, phone, } = req.body;
                const customer = yield prisma.user.findFirst({
                    where: {
                        user_id: req.user.id,
                        role: "customer",
                        email: email
                    }
                });
                let updateCust = null;
                if (!customer) {
                    yield prisma.user.update({
                        where: { user_id: req.user.id },
                        data: {
                            verified: false,
                            verify_token: null
                        }
                    });
                    const token = createToken_1.tokenService.createEmailRegisterToken({
                        id: req.user.id,
                        role: "customer",
                        email,
                    });
                    yield prisma.user.update({
                        where: { user_id: req.user.id },
                        data: { verify_token: token }
                    });
                    yield (0, mailer_1.sendVerificationEmail)(email, token);
                }
                else {
                    updateCust = yield prisma.user.update({
                        where: { user_id: req.user.id },
                        data: {
                            first_name: firstName,
                            last_name: lastName,
                            email,
                            phone
                        }
                    });
                    if (!updateCust) {
                        return res.status(404).json({ error: "Customer not found" });
                    }
                }
                return res.status(200).json({
                    status: "success",
                    data: updateCust,
                    message: "Success update profile data"
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Could not fetch customer data" });
            }
        });
    }
    updateAvatarCustomerData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const { avatar, } = req.body;
                const updateCust = yield prisma.user.update({
                    where: { user_id: req.user.id },
                    data: {
                        avatar,
                    }
                });
                if (!updateCust) {
                    return res.status(404).json({ error: "Customer not found" });
                }
                return res.status(200).json({
                    status: "success",
                    data: updateCust,
                    message: "Success update avatar profile"
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Could not fetch customer data" });
            }
        });
    }
}
exports.CustomerController = CustomerController;
