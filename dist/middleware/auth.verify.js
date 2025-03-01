"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const responseError_1 = require("../helpers/responseError");
const jsonwebtoken_1 = require("jsonwebtoken");
class AuthMiddleware {
    constructor() {
        this.isSuperAdmin = this.checkRole("super_admin");
        this.checkStrAdmin = this.checkRole("store_admin");
        this.checkSuperAdmin = this.checkRole("super_admin");
    }
    verifyToken(req, res, next) {
        var _a;
        try {
            let token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
            if (!token)
                throw "Verification Failed";
            const user = (0, jsonwebtoken_1.verify)(token, process.env.SECRET_KEY);
            req.user = user;
            next();
        }
        catch (error) {
            (0, responseError_1.responseError)(res, error);
        }
    }
    verifyExpiredToken(req, res, next) {
        var _a;
        try {
            let token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
            if (!token)
                throw "Verification Failed";
            const user = (0, jsonwebtoken_1.verify)(token, process.env.SECRET_KEY);
            // Validasi manual token expired
            if (user.exp && Date.now() >= user.exp * 86400) {
                throw new jsonwebtoken_1.TokenExpiredError("Token expired", new Date(user.exp * 86400));
            }
            req.user = { id: user.id, role: user.role };
            next();
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.TokenExpiredError) {
                return res.status(300);
            }
            else {
                return res.status(200);
            }
        }
    }
    checkRole(role) {
        return (req, res, next) => {
            var _a;
            try {
                const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
                if (!token)
                    throw "Verification Failed";
                const decoded = (0, jsonwebtoken_1.decode)(token);
                if (typeof decoded !== "string" && decoded && decoded.role === role) {
                    next();
                }
                else {
                    throw `You Are Not Authorized! Required role: ${role}`;
                }
            }
            catch (error) {
                (0, responseError_1.responseError)(res, error);
            }
        };
    }
    checkSuperAdminOrOwner(req, res, next) {
        try {
            if (!req.user)
                throw new Error("Unauthorized");
            const { store_id } = req.params;
            const userId = req.user.id;
            const userRole = req.user.role;
            if (userRole === "super_admin") {
                return next(); // Super Admin bisa edit semua store
            }
            const storeIdNum = Number(store_id);
            if (isNaN(storeIdNum)) {
                throw new Error("Invalid store ID");
            }
            // Ambil store_id dari request (misalnya, dikirim dalam body atau di path)
            const storeUserId = req.body.user_id ? Number(req.body.user_id) : null;
            if (storeUserId && storeUserId !== userId) {
                throw new Error("You do not have permission to edit this store");
            }
            next();
        }
        catch (error) {
            (0, responseError_1.responseError)(res, error);
        }
    }
}
exports.AuthMiddleware = AuthMiddleware;
