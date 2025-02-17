/*
  Warnings:

  - Added the required column `referral_code` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Referral" DROP CONSTRAINT "Referral_referrer_id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referral_code" TEXT NOT NULL,
ALTER COLUMN "google_id" SET DATA TYPE TEXT;
