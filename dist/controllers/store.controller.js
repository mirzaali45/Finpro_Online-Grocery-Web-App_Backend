"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreController = void 0;
var client_1 = require("../../prisma/generated/client");
var prisma = new client_1.PrismaClient();
var StoreController = /** @class */ (function () {
    function StoreController() {
    }
    StoreController.prototype.createStore = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, store_name, address, subdistrict, city, province, postcode, latitude, longitude, user_id, currentUser, isSuperAdmin, userId, existingStore, assignedUser, store, error_1, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        _a = req.body, store_name = _a.store_name, address = _a.address, subdistrict = _a.subdistrict, city = _a.city, province = _a.province, postcode = _a.postcode, latitude = _a.latitude, longitude = _a.longitude, user_id = _a.user_id;
                        currentUser = req.user;
                        isSuperAdmin = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === "super_admin";
                        userId = user_id ? Number(user_id) : null;
                        if (userId && isNaN(userId)) {
                            return [2 /*return*/, res.status(400).json({ error: "Invalid user ID" })];
                        }
                        return [4 /*yield*/, prisma.store.findUnique({
                                where: { store_name: store_name },
                            })];
                    case 1:
                        existingStore = _b.sent();
                        if (existingStore) {
                            return [2 /*return*/, res.status(400).json({ error: "Store name already exists" })];
                        }
                        if (!userId) return [3 /*break*/, 3];
                        return [4 /*yield*/, prisma.store.findFirst({
                                where: { user_id: userId },
                            })];
                    case 2:
                        assignedUser = _b.sent();
                        if (assignedUser) {
                            return [2 /*return*/, res
                                    .status(400)
                                    .json({ error: "User already owns another store" })];
                        }
                        _b.label = 3;
                    case 3: return [4 /*yield*/, prisma.store.create({
                            data: {
                                store_name: store_name,
                                address: address,
                                subdistrict: subdistrict,
                                city: city,
                                province: province,
                                postcode: postcode,
                                latitude: latitude,
                                longitude: longitude,
                                user_id: userId, // Super Admin boleh meng-assign user_id, tapi hanya sekali
                            },
                        })];
                    case 4:
                        store = _b.sent();
                        return [2 /*return*/, res.status(201).json(store)];
                    case 5:
                        error_1 = _b.sent();
                        console.error(error_1);
                        message = error_1 instanceof Error ? error_1.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    StoreController.prototype.getStores = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, skip, totalStores, stores, totalPages, hasNextPage, hasPrevPage, error_2, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        page = Number(req.query.page) || 1;
                        limit = Number(req.query.limit) || 10;
                        skip = (page - 1) * limit;
                        return [4 /*yield*/, prisma.store.count()];
                    case 1:
                        totalStores = _a.sent();
                        return [4 /*yield*/, prisma.store.findMany({
                                include: {
                                    User: {
                                        select: {
                                            email: true,
                                            username: true,
                                            phone: true,
                                        },
                                    },
                                    Product: true,
                                    Inventory: true,
                                },
                                skip: skip,
                                take: limit,
                            })];
                    case 2:
                        stores = _a.sent();
                        totalPages = Math.ceil(totalStores / limit);
                        hasNextPage = page < totalPages;
                        hasPrevPage = page > 1;
                        // Return paginated response
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                data: stores,
                                pagination: {
                                    total: totalStores,
                                    page: page,
                                    limit: limit,
                                    totalPages: totalPages,
                                    hasNextPage: hasNextPage,
                                    hasPrevPage: hasPrevPage,
                                },
                            })];
                    case 3:
                        error_2 = _a.sent();
                        message = error_2 instanceof Error ? error_2.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    StoreController.prototype.getStoreById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var store_id, store, error_3, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        store_id = req.params.store_id;
                        return [4 /*yield*/, prisma.store.findUnique({
                                where: { store_id: parseInt(store_id) },
                                include: {
                                    User: {
                                        select: {
                                            email: true,
                                            username: true,
                                            phone: true,
                                        },
                                    },
                                    Product: true,
                                    Inventory: true,
                                },
                            })];
                    case 1:
                        store = _a.sent();
                        if (!store) {
                            throw new Error("Store not found");
                        }
                        return [2 /*return*/, res.status(200).json(store)];
                    case 2:
                        error_3 = _a.sent();
                        message = error_3 instanceof Error ? error_3.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StoreController.prototype.updateStore = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var store_id, _a, store_name, address, subdistrict, city, province, postcode, latitude, longitude, user_id, storeIdNum, userIdNum, currentUser, isSuperAdmin, existingStore, updateData, existingUserStore, updatedStore, error_4, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        store_id = req.params.store_id;
                        if (!store_id || isNaN(Number(store_id))) {
                            return [2 /*return*/, res.status(400).json({ error: "Invalid store ID" })];
                        }
                        _a = req.body, store_name = _a.store_name, address = _a.address, subdistrict = _a.subdistrict, city = _a.city, province = _a.province, postcode = _a.postcode, latitude = _a.latitude, longitude = _a.longitude, user_id = _a.user_id;
                        storeIdNum = Number(store_id);
                        userIdNum = user_id !== undefined
                            ? user_id === null
                                ? null
                                : Number(user_id)
                            : undefined;
                        currentUser = req.user;
                        if (!currentUser) {
                            return [2 /*return*/, res.status(403).json({ error: "Unauthorized" })];
                        }
                        isSuperAdmin = currentUser.role === "super_admin";
                        if (userIdNum !== undefined && userIdNum !== null && isNaN(userIdNum)) {
                            return [2 /*return*/, res.status(400).json({ error: "Invalid user ID" })];
                        }
                        return [4 /*yield*/, prisma.store.findUnique({
                                where: { store_id: storeIdNum },
                            })];
                    case 1:
                        existingStore = _b.sent();
                        if (!existingStore) {
                            return [2 /*return*/, res.status(404).json({ error: "Store not found" })];
                        }
                        updateData = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, (store_name && { store_name: store_name })), (address && { address: address })), (subdistrict && { subdistrict: subdistrict })), (city && { city: city })), (province && { province: province })), (postcode && { postcode: postcode })), (latitude && { latitude: Number(latitude) })), (longitude && { longitude: Number(longitude) }));
                        if (!(userIdNum !== undefined && userIdNum !== existingStore.user_id)) return [3 /*break*/, 4];
                        // Super Admin boleh update user_id
                        if (!isSuperAdmin) {
                            return [2 /*return*/, res
                                    .status(403)
                                    .json({ error: "You are not authorized to change store owner" })];
                        }
                        if (!(userIdNum !== null)) return [3 /*break*/, 3];
                        return [4 /*yield*/, prisma.store.findFirst({
                                where: {
                                    user_id: userIdNum,
                                    NOT: { store_id: storeIdNum }, //
                                },
                            })];
                    case 2:
                        existingUserStore = _b.sent();
                        if (existingUserStore) {
                            return [2 /*return*/, res
                                    .status(400)
                                    .json({ error: "User already assigned to another store" })];
                        }
                        _b.label = 3;
                    case 3:
                        // Tambahkan perubahan user_id ke data update
                        updateData.user_id = userIdNum;
                        _b.label = 4;
                    case 4: return [4 /*yield*/, prisma.store.update({
                            where: { store_id: storeIdNum },
                            data: updateData,
                        })];
                    case 5:
                        updatedStore = _b.sent();
                        return [2 /*return*/, res.status(200).json(updatedStore)];
                    case 6:
                        error_4 = _b.sent();
                        console.error(error_4);
                        message = error_4 instanceof Error ? error_4.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    StoreController.prototype.deleteStore = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var store_id, storeIdNum, existingStore, error_5, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        store_id = req.params.store_id;
                        storeIdNum = Number(store_id);
                        if (isNaN(storeIdNum)) {
                            return [2 /*return*/, res.status(400).json({ error: "Invalid store ID" })];
                        }
                        return [4 /*yield*/, prisma.store.findUnique({
                                where: { store_id: storeIdNum },
                            })];
                    case 1:
                        existingStore = _a.sent();
                        if (!existingStore) {
                            return [2 /*return*/, res.status(404).json({ error: "Store not found" })];
                        }
                        // Hapus store
                        return [4 /*yield*/, prisma.store.delete({
                                where: { store_id: storeIdNum },
                            })];
                    case 2:
                        // Hapus store
                        _a.sent();
                        return [2 /*return*/, res.status(200).json({ message: "Store deleted successfully" })];
                    case 3:
                        error_5 = _a.sent();
                        console.error("❌ Error deleting store:", error_5);
                        message = error_5 instanceof Error ? error_5.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return StoreController;
}());
exports.StoreController = StoreController;
