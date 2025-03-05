"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
var responseError_1 = require("../helpers/responseError");
var jsonwebtoken_1 = require("jsonwebtoken");
var AuthMiddleware = /** @class */ (function () {
    function AuthMiddleware() {
        this.isSuperAdmin = this.checkRole("super_admin");
        this.checkStrAdmin = this.checkRole("store_admin");
        this.checkSuperAdmin = this.checkRole("super_admin");
    }
    AuthMiddleware.prototype.verifyToken = function (req, res, next) {
        var _a;
        try {
            var token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
            if (!token)
                throw "Verification Failed";
            var user = (0, jsonwebtoken_1.verify)(token, process.env.SECRET_KEY);
            req.user = user;
            next();
        }
        catch (error) {
            (0, responseError_1.responseError)(res, error);
        }
    };
    AuthMiddleware.prototype.verifyExpiredToken = function (req, res, next) {
        var _a;
        try {
            var token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
            if (!token)
                throw "Verification Failed";
            var user = (0, jsonwebtoken_1.verify)(token, process.env.SECRET_KEY);
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
    };
    AuthMiddleware.prototype.checkRole = function (role) {
        return function (req, res, next) {
            var _a;
            try {
                var token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
                if (!token)
                    throw "Verification Failed";
                var decoded = (0, jsonwebtoken_1.decode)(token);
                if (typeof decoded !== "string" && decoded && decoded.role === role) {
                    next();
                }
                else {
                    throw "You Are Not Authorized! Required role: ".concat(role);
                }
            }
            catch (error) {
                (0, responseError_1.responseError)(res, error);
            }
        };
    };
    AuthMiddleware.prototype.checkSuperAdminOrOwner = function (req, res, next) {
        try {
            if (!req.user)
                throw new Error("Unauthorized");
            var store_id = req.params.store_id;
            var userId = req.user.id;
            var userRole = req.user.role;
            if (userRole === "super_admin") {
                return next(); // Super Admin bisa edit semua store
            }
            var storeIdNum = Number(store_id);
            if (isNaN(storeIdNum)) {
                throw new Error("Invalid store ID");
            }
            // Ambil store_id dari request (misalnya, dikirim dalam body atau di path)
            var storeUserId = req.body.user_id ? Number(req.body.user_id) : null;
            if (storeUserId && storeUserId !== userId) {
                throw new Error("You do not have permission to edit this store");
            }
            next();
        }
        catch (error) {
            (0, responseError_1.responseError)(res, error);
        }
    };
    return AuthMiddleware;
}());
exports.AuthMiddleware = AuthMiddleware;
