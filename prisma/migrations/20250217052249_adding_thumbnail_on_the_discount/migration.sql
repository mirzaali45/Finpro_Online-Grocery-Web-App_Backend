/*
  Warnings:

  - Added the required column `address_name` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- ALTER TABLE "Address" ADD COLUMN     "address_name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "thumbnail" TEXT;

-- AlterTable
-- ALTER TABLE "User" ADD COLUMN     "password_reset_token" TEXT,
-- ADD COLUMN     "verify_token" TEXT;
