import { PrismaClient } from "../../prisma/generated/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export default class ReferralController { 
  async redeemDiscount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.id;
      const { voucherCode } = req.body;

      // Cari voucher yang sesuai dengan kode dan masih berlaku
      const voucher = await prisma.voucher.findFirst({
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
      await prisma.voucher.delete({
        where: { voucher_id: voucher.voucher_id },
      });

      return res.status(200).json({
        status: "success",
        message: `Voucher berhasil digunakan! Anda mendapat diskon ${discountValue}%`,
        discount: discountValue,
      });
    } catch (error) {
      console.error("Error saat redeem voucher:", error);
      return res.status(500).json({ error: "Terjadi kesalahan saat redeem voucher" });
    }
  }
}
