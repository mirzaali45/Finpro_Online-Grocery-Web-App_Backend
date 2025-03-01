-- CreateEnum
CREATE TYPE "Role" AS ENUM ('customer', 'store_admin', 'super_admin');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'awaiting_payment', 'processing', 'shipped', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ShippingStatus" AS ENUM ('pending', 'shipped', 'delivered');

-- CreateEnum
CREATE TYPE "Type" AS ENUM ('point', 'percentage');

-- CreateEnum
CREATE TYPE "ChangeType" AS ENUM ('email', 'password', 'username', 'date_ob', 'avatar', 'phone', 'name');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('GOOGLE', 'FACEBOOK');

-- CreateTable
CREATE TABLE "User" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "phone" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT,
    "date_ob" TIMESTAMP(3),
    "avatar" TEXT,
    "role" "Role" NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "provider_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider_name" "ProviderType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("provider_id")
);

-- CreateTable
CREATE TABLE "Address" (
    "address_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "subdistrict" TEXT,
    "city" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "province_id" TEXT NOT NULL,
    "postcode" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("address_id")
);

-- CreateTable
CREATE TABLE "RajaOngkir" (
    "ongkir_id" SERIAL NOT NULL,
    "city_id" TEXT NOT NULL,
    "city_name" TEXT NOT NULL,
    "province_id" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,

    CONSTRAINT "RajaOngkir_pkey" PRIMARY KEY ("ongkir_id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "ref_id" SERIAL NOT NULL,
    "referrer_id" INTEGER NOT NULL,
    "referred_id" INTEGER,
    "referral_code" TEXT NOT NULL,
    "reward_id" INTEGER,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("ref_id")
);

-- CreateTable
CREATE TABLE "Voucher" (
    "voucher_id" SERIAL NOT NULL,
    "voucher_code" TEXT,
    "user_id" INTEGER NOT NULL,
    "discount_id" INTEGER NOT NULL,
    "is_redeemed" BOOLEAN NOT NULL DEFAULT false,
    "redeemed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voucher_pkey" PRIMARY KEY ("voucher_id")
);

-- CreateTable
CREATE TABLE "Discount" (
    "discount_id" SERIAL NOT NULL,
    "store_id" INTEGER,
    "product_id" INTEGER,
    "discount_code" TEXT NOT NULL,
    "discount_type" "Type" NOT NULL,
    "discount_value" INTEGER NOT NULL,
    "minimum_order" INTEGER,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userUser_id" INTEGER,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("discount_id")
);

-- CreateTable
CREATE TABLE "Store" (
    "store_id" SERIAL NOT NULL,
    "store_name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "subdistrict" TEXT,
    "city" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "province_id" TEXT NOT NULL,
    "postcode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("store_id")
);

-- CreateTable
CREATE TABLE "Category" (
    "category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "Product" (
    "product_id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "image_id" SERIAL NOT NULL,
    "product_id" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("image_id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "inv_id" SERIAL NOT NULL,
    "store_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "total_qty" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("inv_id")
);

-- CreateTable
CREATE TABLE "Order" (
    "order_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "store_id" INTEGER NOT NULL,
    "order_status" "OrderStatus" NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("order_id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "orderitem_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("orderitem_id")
);

-- CreateTable
CREATE TABLE "Shipping" (
    "shipping_id" SERIAL NOT NULL,
    "order_id" INTEGER NOT NULL,
    "shipping_cost" DOUBLE PRECISION NOT NULL,
    "shipping_address" TEXT NOT NULL,
    "shipping_status" "ShippingStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Shipping_pkey" PRIMARY KEY ("shipping_id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "cartitem_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("cartitem_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "RajaOngkir_city_id_key" ON "RajaOngkir"("city_id");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referrer_id_key" ON "Referral"("referrer_id");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_referral_code_key" ON "Referral"("referral_code");

-- CreateIndex
CREATE UNIQUE INDEX "Voucher_voucher_code_key" ON "Voucher"("voucher_code");

-- CreateIndex
CREATE UNIQUE INDEX "Discount_discount_code_key" ON "Discount"("discount_code");

-- CreateIndex
CREATE UNIQUE INDEX "Store_store_name_key" ON "Store"("store_name");

-- CreateIndex
CREATE UNIQUE INDEX "Store_user_id_key" ON "Store"("user_id");

-- AddForeignKey
ALTER TABLE "Provider" ADD CONSTRAINT "Provider_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrer_id_fkey" FOREIGN KEY ("referrer_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referred_id_fkey" FOREIGN KEY ("referred_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "Voucher"("voucher_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_discount_id_fkey" FOREIGN KEY ("discount_id") REFERENCES "Discount"("discount_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("store_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Discount" ADD CONSTRAINT "Discount_userUser_id_fkey" FOREIGN KEY ("userUser_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("store_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("store_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("store_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipping" ADD CONSTRAINT "Shipping_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
