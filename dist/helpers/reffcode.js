"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReferralCode = generateReferralCode;
exports.generateVoucherCode = generateVoucherCode;
function generateReferralCode(length = 8) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let referralCode = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        referralCode += charset[randomIndex];
    }
    return referralCode;
}
function generateVoucherCode(length = 12) {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let referralCode = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        referralCode += charset[randomIndex];
    }
    return referralCode;
}
