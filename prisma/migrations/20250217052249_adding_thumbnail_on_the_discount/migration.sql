/*
  Warnings:

  - Added the required column `address_name` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
<<<<<<< HEAD
<<<<<<< HEAD
-- ALTER TABLE "Address" ADD COLUMN     "address_name" TEXT NOT NULL;
=======
ALTER TABLE "Address" ADD COLUMN     "address_name" TEXT NOT NULL;
>>>>>>> d5feeb783728d74ed0b8efc91a7a3c1f5aa9af93
=======
-- ALTER TABLE "Address" ADD COLUMN     "address_name" TEXT NOT NULL;
>>>>>>> 415c818b69bf3fdd6af3a04d207de0b99541eaf7

-- AlterTable
ALTER TABLE "Discount" ADD COLUMN     "thumbnail" TEXT;

-- AlterTable
<<<<<<< HEAD
<<<<<<< HEAD
-- ALTER TABLE "User" ADD COLUMN     "password_reset_token" TEXT,
-- ADD COLUMN     "verify_token" TEXT;
=======
ALTER TABLE "User" ADD COLUMN     "password_reset_token" TEXT,
ADD COLUMN     "verify_token" TEXT;
>>>>>>> d5feeb783728d74ed0b8efc91a7a3c1f5aa9af93
=======
-- ALTER TABLE "User" ADD COLUMN     "password_reset_token" TEXT,
-- ADD COLUMN     "verify_token" TEXT;
>>>>>>> 415c818b69bf3fdd6af3a04d207de0b99541eaf7
