"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenService = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
require("dotenv/config");
var SECRET_KEY = process.env.SECRET_KEY || "Temporarykey";
var TokenService = /** @class */ (function () {
    function TokenService() {
    }
    TokenService.prototype.createTokenWithExpiry = function (payload, expiresIn) {
        try {
            var options = { expiresIn: expiresIn };
            return (0, jsonwebtoken_1.sign)(payload, SECRET_KEY, options);
        }
        catch (error) {
            console.error("Token generation failed:", error);
            throw new Error("Failed to generate token");
        }
    };
    TokenService.prototype.createAccessToken = function (payload) {
        return this.createTokenWithExpiry(payload, 3600); // 1 hour in seconds
    };
    TokenService.prototype.createLoginToken = function (payload) {
        return this.createTokenWithExpiry(payload, 86400); // 24 hours in seconds
    };
    TokenService.prototype.createOAuthToken = function (payload) {
        return this.createTokenWithExpiry(payload, 86400);
    };
    TokenService.prototype.createEmailRegisterToken = function (payload) {
        return this.createTokenWithExpiry(payload, 3600);
    };
    TokenService.prototype.createEmailToken = function (payload) {
        return this.createTokenWithExpiry(payload, 86400);
    };
    TokenService.prototype.createResetToken = function (payload) {
        return this.createTokenWithExpiry(payload, 86400);
    };
    TokenService.prototype.verifyEmailToken = function (token) {
        try {
            return (0, jsonwebtoken_1.verify)(token, SECRET_KEY);
        }
        catch (error) {
            console.error("Email token verification failed:", error);
            throw new Error("Invalid or expired email token");
        }
    };
    return TokenService;
}());
exports.tokenService = new TokenService();
