/*
  Warnings:

  - Added the required column `address_name` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `referral_code` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_referrer_id_fkey";

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "address_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password_reset_token" TEXT,
ADD COLUMN     "referral_code" TEXT NOT NULL,
ADD COLUMN     "verify_token" TEXT,
ALTER COLUMN "google_id" SET DATA TYPE TEXT;
