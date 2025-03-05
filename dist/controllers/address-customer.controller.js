"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressCustomerController = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
class AddressCustomerController {
    getAddressCust(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const address = yield prisma.address.findMany({
                    where: {
                        user_id: req.user.id,
                    },
                    select: {
                        address_id: true,
                        user_id: true,
                        address_name: true,
                        address: true,
                        subdistrict: true,
                        city: true,
                        province: true,
                        province_id: true,
                        city_id: true,
                        postcode: true,
                        latitude: true,
                        longitude: true,
                        is_primary: true,
                    },
                });
                if (!address) {
                    return res.status(404).json({ error: "Customer not found" });
                }
                return res.status(200).json({
                    status: "success",
                    data: address,
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Could not fetch address customer data" });
            }
        });
    }
    createAddressCust(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const { address_name, address, subdistrict, city, city_id, province, province_id, postcode, latitude, longitude, is_primary, } = req.body;
                // Validasi jika beberapa field tidak diisi
                if (!address_name || !address || !city || !province) {
                    return res.status(400).json({ error: "Please fill in all required fields." });
                }
                const newAddress = yield prisma.address.create({
                    data: {
                        user_id: req.user.id,
                        address_name,
                        address,
                        subdistrict: subdistrict || null,
                        city,
                        city_id: city_id || null,
                        province,
                        province_id: province_id || null,
                        postcode: postcode || null,
                        latitude: latitude ? Number(latitude) : 0,
                        longitude: longitude ? Number(longitude) : 0,
                        is_primary: is_primary !== null && is_primary !== void 0 ? is_primary : false,
                    },
                });
                return res.status(201).json({
                    status: "success",
                    data: newAddress,
                    message: "Successfully created new address",
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Could not create address" });
            }
        });
    }
    updatePrimaryAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const { is_primary } = req.body;
                const { address_id } = req.params;
                if (!is_primary) {
                    return res.status(409).json({ error: `All Inputs is required.` });
                }
                // const checkPrimaryAddress = await prisma.address.findFirst({
                //   where: {
                //     user_id: req.user.id,
                //     is_primary: true
                //   }
                // });
                // if (checkPrimaryAddress) {
                //   return res.status(409).json({ error: `Primary Address '${checkPrimaryAddress.address}' sudah ada.` });
                // }
                // Set semua address menjadi non-primary terlebih dahulu
                yield prisma.address.updateMany({
                    where: { user_id: Number(req.user.id) },
                    data: { is_primary: false }
                });
                const updatePrimaryAddress = yield prisma.address.update({
                    where: { address_id: Number(address_id) },
                    data: {
                        is_primary: is_primary
                    }
                });
                if (!updatePrimaryAddress) {
                    return res.status(404).json({ error: "Address not found" });
                }
                return res.status(200).json({
                    status: "success",
                    data: updatePrimaryAddress,
                    message: "Success setting primary address"
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Could not update address" });
            }
        });
    }
    updateAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const { address, subdistrict, city, city_id, province, province_id, postcode, latitude, longitude, address_name } = req.body;
                const { address_id } = req.params;
                const requiredFields = { address, city, city_id, province, province_id, postcode, address_name };
                for (const [key, value] of Object.entries(requiredFields)) {
                    if (!value || value.trim() === "") {
                        return res.status(409).json({ error: `Input '${key}' harus diisi.` });
                    }
                }
                const updateAddress = yield prisma.address.update({
                    where: { address_id: Number(address_id) },
                    data: {
                        address,
                        subdistrict,
                        city,
                        city_id,
                        province,
                        province_id,
                        postcode,
                        latitude,
                        longitude,
                        address_name
                    }
                });
                if (!updateAddress) {
                    return res.status(404).json({ error: "Address not found" });
                }
                return res.status(200).json({
                    status: "success",
                    data: updateAddress,
                    message: "Success updating address"
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Could not update address" });
            }
        });
    }
    deleteAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { address_id } = req.params;
                console.log(req.params);
                yield prisma.address.delete({
                    where: {
                        address_id: parseInt(address_id),
                    },
                });
                return res.status(200).json({ message: "Address deleted successfully" });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    updateAvatarCustomerData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.user) {
                    return res.status(401).json({ error: "Unauthorized" });
                }
                const { avatar, } = req.body;
                const updateCust = yield prisma.user.update({
                    where: { user_id: req.user.id },
                    data: {
                        avatar,
                    }
                });
                if (!updateCust) {
                    return res.status(404).json({ error: "Customer not found" });
                }
                return res.status(200).json({
                    status: "success",
                    data: updateCust,
                    message: "Success update avatar profile"
                });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ error: "Could not fetch customer data" });
            }
        });
    }
}
exports.AddressCustomerController = AddressCustomerController;
