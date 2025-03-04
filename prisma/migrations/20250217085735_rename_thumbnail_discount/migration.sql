/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `Discount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Discount" DROP COLUMN "thumbnail",
ADD COLUMN     "discount_thumbnail" TEXT;
