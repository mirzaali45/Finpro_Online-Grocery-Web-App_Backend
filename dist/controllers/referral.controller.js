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
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
class ReferralController {
    redeemDiscount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ message: "Unauthorized" });
                }
                const userId = req.user.id;
                const { voucherCode } = req.body;
                // Cari voucher yang sesuai dengan kode dan masih berlaku
                const voucher = yield prisma.voucher.findFirst({
                    where: {
                        user_id: userId,
                        discount: {
                            discount_code: voucherCode,
                        },
                        expires_at: {
                            gte: new Date(), // Pastikan belum expired
                        },
                    },
                    include: { discount: true },
                });
                if (!voucher) {
                    return res.status(400).json({ message: "Voucher tidak valid atau sudah kadaluarsa" });
                }
                const discountValue = voucher.discount.discount_value;
                // Hapus voucher setelah digunakan (jika hanya bisa dipakai sekali)
                yield prisma.voucher.delete({
                    where: { voucher_id: voucher.voucher_id },
                });
                return res.status(200).json({
                    status: "success",
                    message: `Voucher berhasil digunakan! Anda mendapat diskon ${discountValue}%`,
                    discount: discountValue,
                });
            }
            catch (error) {
                console.error("Error saat redeem voucher:", error);
                return res.status(500).json({ error: "Terjadi kesalahan saat redeem voucher" });
            }
        });
    }
}
exports.default = ReferralController;
