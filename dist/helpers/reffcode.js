"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReferralCode = generateReferralCode;
exports.generateVoucherCode = generateVoucherCode;
function generateReferralCode(length) {
    if (length === void 0) { length = 8; }
    var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var referralCode = "";
    for (var i = 0; i < length; i++) {
        var randomIndex = Math.floor(Math.random() * charset.length);
        referralCode += charset[randomIndex];
    }
    return referralCode;
}
function generateVoucherCode(length) {
    if (length === void 0) { length = 12; }
    var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var referralCode = "";
    for (var i = 0; i < length; i++) {
        var randomIndex = Math.floor(Math.random() * charset.length);
        referralCode += charset[randomIndex];
    }
    return referralCode;
}
