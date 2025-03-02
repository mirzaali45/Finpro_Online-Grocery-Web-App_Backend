-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "RajaOngkir"("city_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "RajaOngkir"("city_id") ON DELETE RESTRICT ON UPDATE CASCADE;
