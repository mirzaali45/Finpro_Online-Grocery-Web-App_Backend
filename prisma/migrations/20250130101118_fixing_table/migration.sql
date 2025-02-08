/*
  Warnings:

  - You are about to drop the column `category_url` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `city_id` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `province_id` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the `Provider` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RajaOngkir` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Provider" DROP CONSTRAINT "Provider_user_id_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "category_url";

-- AlterTable
ALTER TABLE "Store" DROP COLUMN "city_id",
DROP COLUMN "province_id";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "google_id" INTEGER;

-- DropTable
DROP TABLE "Provider";

-- DropTable
DROP TABLE "RajaOngkir";

-- DropEnum
DROP TYPE "ProviderType";
