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
exports.SuperAdminController = void 0;
const client_1 = require("../../prisma/generated/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const reffcode_1 = require("../helpers/reffcode");
const prisma = new client_1.PrismaClient();
class SuperAdminController {
    createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, role, username, firstName, lastName, phone } = req.body;
                const existingUser = yield prisma.user.findUnique({
                    where: { email },
                });
                if (existingUser) {
                    return res.status(400).json({ error: "Email already exists" });
                }
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                const newUser = yield prisma.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        role,
                        username,
                        first_name: firstName,
                        last_name: lastName,
                        phone,
                        verified: true,
                        referral_code: role === "customer" ? (0, reffcode_1.generateReferralCode)(8) : null,
                    },
                });
                return res.status(201).json({
                    status: "success",
                    message: "User created successfully",
                    data: newUser,
                });
            }
            catch (error) {
                return res.status(500).json({ error: "Could not create user" });
            }
        });
    }
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = Number(req.query.page) || 1;
                const limit = Number(req.query.limit) || 10;
                const skip = (page - 1) * limit;
                const totalUsers = yield prisma.user.count();
                const users = yield prisma.user.findMany({
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
                    skip,
                    take: limit,
                });
                // Calculate pagination metadata
                const totalPages = Math.ceil(totalUsers / limit);
                const hasNextPage = page < totalPages;
                const hasPrevPage = page > 1;
                return res.status(200).json({
                    status: "success",
                    data: users,
                    pagination: {
                        total: totalUsers,
                        page,
                        limit,
                        totalPages,
                        hasNextPage,
                        hasPrevPage,
                    },
                });
            }
            catch (error) {
                console.error("Error fetching users:", error);
                return res.status(500).json({ error: "Could not fetch users" });
            }
        });
    }
    getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield prisma.user.findUnique({
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
                });
                if (!user)
                    return res.status(404).json({ error: "User not found" });
                return res.status(200).json({ status: "success", data: user });
            }
            catch (error) {
                return res.status(500).json({ error: "Could not fetch user" });
            }
        });
    }
    updateUserRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { role } = req.body;
                const user = yield prisma.user.update({
                    where: { user_id: parseInt(req.params.id) },
                    data: { role },
                });
                return res.status(200).json({ status: "success", data: user });
            }
            catch (error) {
                return res.status(500).json({ error: "Could not update user role" });
            }
        });
    }
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma.user.delete({
                    where: { user_id: parseInt(req.params.id) },
                });
                return res
                    .status(200)
                    .json({ status: "success", message: "User deleted successfully" });
            }
            catch (error) {
                return res.status(500).json({ error: "Could not delete user" });
            }
        });
    }
}
exports.SuperAdminController = SuperAdminController;
