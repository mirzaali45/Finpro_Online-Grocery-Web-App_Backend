/*
  Warnings:

  - You are about to drop the column `discount_thumbnail` on the `Discount` table. All the data in the column will be lost.
  - You are about to drop the column `referral_code` on the `User` table. All the data in the column will be lost.
  - The `google_id` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Discount" DROP COLUMN "discount_thumbnail",
ADD COLUMN     "thumbnail" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "referral_code",
DROP COLUMN "google_id",
ADD COLUMN     "google_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
