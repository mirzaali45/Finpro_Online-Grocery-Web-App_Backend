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
exports.DiscountController = void 0;
var client_1 = require("../../prisma/generated/client");
var zod_1 = require("zod");
var cloudinary_1 = require("../services/cloudinary");
var prisma = new client_1.PrismaClient();
var createDiscountSchema = zod_1.z.object({
    store_id: zod_1.z.number().optional(),
    product_id: zod_1.z.coerce.number(),
    userUser_id: zod_1.z.number().optional(), // Updated to match schema
    thumbnail: zod_1.z.string().optional(),
    discount_code: zod_1.z.string().min(3),
    discount_type: zod_1.z.enum(["point", "percentage"]),
    discount_value: zod_1.z.coerce.number(),
    minimum_order: zod_1.z.coerce.number().optional(),
    expires_at: zod_1.z.string().transform(function (str) { return new Date(str); }),
});
var updateDiscountSchema = createDiscountSchema.partial();
var DiscountController = /** @class */ (function () {
    function DiscountController() {
    }
    DiscountController.prototype.createDiscount = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, store, validation, data, existingDiscount, product, existingProductDiscount, thumbnailUrl, uploadResult, discount, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        user = req.user;
                        if ((user === null || user === void 0 ? void 0 : user.role) !== "store_admin") {
                            res.status(403).json({
                                success: false,
                                message: "Unauthorized: Only store admins can create discounts",
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.store.findUnique({
                                where: { user_id: user.id },
                            })];
                    case 1:
                        store = _a.sent();
                        if (!store) {
                            res.status(404).json({
                                success: false,
                                message: "No store found for this admin",
                            });
                            return [2 /*return*/];
                        }
                        validation = createDiscountSchema.safeParse(req.body);
                        if (!validation.success) {
                            res.status(400).json({
                                success: false,
                                message: "Invalid input data",
                                errors: validation.error.format(),
                            });
                            return [2 /*return*/];
                        }
                        data = validation.data;
                        if (data.discount_type === "percentage" && data.discount_value > 100) {
                            res.status(400).json({
                                success: false,
                                message: "Percentage discount cannot exceed 100%",
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.discount.findUnique({
                                where: { discount_code: data.discount_code },
                            })];
                    case 2:
                        existingDiscount = _a.sent();
                        if (existingDiscount) {
                            res.status(400).json({
                                success: false,
                                message: "Discount code already exists",
                            });
                            return [2 /*return*/];
                        }
                        if (!(data.product_id && data.product_id !== 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, prisma.product.findUnique({
                                where: {
                                    product_id: data.product_id,
                                    store_id: store.store_id,
                                },
                            })];
                    case 3:
                        product = _a.sent();
                        if (!product) {
                            res.status(400).json({
                                success: false,
                                message: "Product does not belong to your store",
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.discount.findFirst({
                                where: {
                                    store_id: store.store_id,
                                    product_id: data.product_id,
                                },
                            })];
                    case 4:
                        existingProductDiscount = _a.sent();
                        if (existingProductDiscount) {
                            res.status(400).json({
                                success: false,
                                message: "A discount for this product already exists",
                            });
                            return [2 /*return*/];
                        }
                        _a.label = 5;
                    case 5:
                        thumbnailUrl = data.thumbnail;
                        if (!req.file) return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, cloudinary_1.uploadDiscountThumbnail)(req.file.path)];
                    case 6:
                        uploadResult = _a.sent();
                        thumbnailUrl = uploadResult.secure_url;
                        _a.label = 7;
                    case 7: return [4 /*yield*/, prisma.discount.create({
                            data: {
                                store_id: store.store_id,
                                product_id: data.product_id === 0 ? null : data.product_id,
                                thumbnail: thumbnailUrl,
                                discount_code: data.discount_code,
                                discount_type: data.discount_type,
                                discount_value: data.discount_value,
                                minimum_order: data.minimum_order,
                                expires_at: data.expires_at,
                            },
                        })];
                    case 8:
                        discount = _a.sent();
                        res.status(201).json({
                            success: true,
                            message: "Discount created successfully",
                            data: discount,
                        });
                        return [3 /*break*/, 10];
                    case 9:
                        error_1 = _a.sent();
                        console.error("Error creating discount:", error_1);
                        res.status(500).json({
                            success: false,
                            message: "Failed to create discount",
                            error: error_1 instanceof Error ? error_1.message : "Unknown error occurred",
                        });
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    DiscountController.prototype.getAllDiscounts = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, limit, storeId, productId, discountType, unassigned, pageNum, limitNum, offset, whereCondition, discounts, totalDiscounts, error_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 8 : _c, storeId = _a.storeId, productId = _a.productId, discountType = _a.discountType, unassigned = _a.unassigned;
                        pageNum = Number(page);
                        limitNum = Number(limit);
                        offset = (pageNum - 1) * limitNum;
                        whereCondition = {};
                        whereCondition.store_id = { not: null };
                        if (storeId) {
                            whereCondition.store_id = Number(storeId);
                        }
                        if (unassigned === "true") {
                            whereCondition.product_id = null;
                        }
                        else if (productId) {
                            whereCondition.product_id = Number(productId);
                        }
                        if (discountType) {
                            whereCondition.discount_type = discountType;
                        }
                        return [4 /*yield*/, prisma.discount.findMany({
                                where: whereCondition,
                                include: {
                                    product: {
                                        select: {
                                            name: true,
                                            category: {
                                                select: {
                                                    category_name: true,
                                                },
                                            },
                                        },
                                    },
                                    store: {
                                        select: {
                                            store_name: true,
                                        },
                                    },
                                },
                                take: limitNum,
                                skip: offset,
                                orderBy: {
                                    created_at: "desc",
                                },
                            })];
                    case 1:
                        discounts = _d.sent();
                        return [4 /*yield*/, prisma.discount.count({
                                where: whereCondition,
                            })];
                    case 2:
                        totalDiscounts = _d.sent();
                        res.status(200).json({
                            success: true,
                            data: discounts,
                            pagination: {
                                page: pageNum,
                                limit: limitNum,
                                total: totalDiscounts,
                                totalPages: Math.ceil(totalDiscounts / limitNum),
                            },
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _d.sent();
                        console.error("Error fetching discounts:", error_2);
                        res.status(500).json({
                            success: false,
                            message: "Failed to fetch discounts",
                            error: error_2 instanceof Error ? error_2.message : "Unknown error occurred",
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    DiscountController.prototype.getDiscountById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, discount, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        if (!id || isNaN(Number(id))) {
                            res.status(400).json({
                                success: false,
                                message: "Valid discount ID required",
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.discount.findUnique({
                                where: { discount_id: Number(id) },
                                include: {
                                    product: {
                                        select: {
                                            product_id: true,
                                            name: true,
                                            price: true,
                                            ProductImage: {
                                                select: {
                                                    url: true,
                                                },
                                                take: 1,
                                            },
                                        },
                                    },
                                    store: {
                                        select: {
                                            store_id: true,
                                            store_name: true,
                                        },
                                    },
                                    User: {
                                        select: {
                                            user_id: true,
                                            username: true,
                                        },
                                    },
                                    Voucher: true,
                                },
                            })];
                    case 1:
                        discount = _a.sent();
                        if (!discount) {
                            res.status(404).json({
                                success: false,
                                message: "Discount not found",
                            });
                            return [2 /*return*/];
                        }
                        res.status(200).json({
                            success: true,
                            message: "Discount retrieved successfully",
                            data: discount,
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error("Error retrieving discount:", error_3);
                        res.status(500).json({
                            success: false,
                            message: "Failed to retrieve discount",
                            error: error_3 instanceof Error ? error_3.message : "Unknown error occurred",
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DiscountController.prototype.getStoreDiscounts = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, store, discounts, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            res.status(401).json({
                                success: false,
                                message: "User not authenticated",
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.store.findUnique({
                                where: { user_id: userId },
                            })];
                    case 1:
                        store = _b.sent();
                        if (!store) {
                            res.status(404).json({
                                success: false,
                                message: "No store found for this user",
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.discount.findMany({
                                where: { store_id: store.store_id },
                                include: {
                                    product: {
                                        select: {
                                            product_id: true,
                                            name: true,
                                            price: true,
                                            ProductImage: {
                                                select: {
                                                    url: true,
                                                },
                                                take: 1,
                                            },
                                        },
                                    },
                                },
                            })];
                    case 2:
                        discounts = _b.sent();
                        res.status(200).json({
                            success: true,
                            message: "Discounts retrieved successfully",
                            data: discounts,
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _b.sent();
                        console.error("Error retrieving discounts:", error_4);
                        res.status(500).json({
                            success: false,
                            message: "Failed to retrieve discounts",
                            error: error_4 instanceof Error ? error_4.message : "Unknown error occurred",
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Get all discounts for a product
    DiscountController.prototype.getProductDiscounts = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var productId, product, discounts, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        productId = req.params.productId;
                        if (!productId || isNaN(Number(productId))) {
                            res.status(400).json({
                                success: false,
                                message: "Valid product ID required",
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.product.findUnique({
                                where: { product_id: Number(productId) },
                                select: { store_id: true },
                            })];
                    case 1:
                        product = _a.sent();
                        if (!product) {
                            res.status(404).json({
                                success: false,
                                message: "Product not found",
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.discount.findMany({
                                where: {
                                    OR: [
                                        { product_id: Number(productId) },
                                        { store_id: product.store_id },
                                    ],
                                    expires_at: {
                                        gt: new Date(),
                                    },
                                },
                            })];
                    case 2:
                        discounts = _a.sent();
                        res.status(200).json({
                            success: true,
                            message: "Product discounts retrieved successfully",
                            data: discounts,
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        console.error("Error retrieving product discounts:", error_5);
                        res.status(500).json({
                            success: false,
                            message: "Failed to retrieve product discounts",
                            error: error_5 instanceof Error ? error_5.message : "Unknown error occurred",
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Get all discounts for a user
    DiscountController.prototype.getUserDiscounts = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, discounts, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        userId = req.params.userId;
                        if (!userId || isNaN(Number(userId))) {
                            res.status(400).json({
                                success: false,
                                message: "Valid user ID required",
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.discount.findMany({
                                where: {
                                    userUser_id: Number(userId),
                                    expires_at: {
                                        gt: new Date(),
                                    },
                                },
                            })];
                    case 1:
                        discounts = _a.sent();
                        res.status(200).json({
                            success: true,
                            message: "User discounts retrieved successfully",
                            data: discounts,
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error("Error retrieving user discounts:", error_6);
                        res.status(500).json({
                            success: false,
                            message: "Failed to retrieve user discounts",
                            error: error_6 instanceof Error ? error_6.message : "Unknown error occurred",
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Update a discount
    DiscountController.prototype.updateDiscount = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, validation, data, existingDiscount, codeExists, updatedDiscount, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        id = req.params.id;
                        if (!id || isNaN(Number(id))) {
                            res.status(400).json({
                                success: false,
                                message: "Valid discount ID required",
                            });
                            return [2 /*return*/];
                        }
                        validation = updateDiscountSchema.safeParse(req.body);
                        if (!validation.success) {
                            res.status(400).json({
                                success: false,
                                message: "Invalid input data",
                                errors: validation.error.format(),
                            });
                            return [2 /*return*/];
                        }
                        data = validation.data;
                        return [4 /*yield*/, prisma.discount.findUnique({
                                where: { discount_id: Number(id) },
                            })];
                    case 1:
                        existingDiscount = _a.sent();
                        if (!existingDiscount) {
                            res.status(404).json({
                                success: false,
                                message: "Discount not found",
                            });
                            return [2 /*return*/];
                        }
                        if (!(data.discount_code &&
                            data.discount_code !== existingDiscount.discount_code)) return [3 /*break*/, 3];
                        return [4 /*yield*/, prisma.discount.findUnique({
                                where: { discount_code: data.discount_code },
                            })];
                    case 2:
                        codeExists = _a.sent();
                        if (codeExists) {
                            res.status(400).json({
                                success: false,
                                message: "Discount code already exists",
                            });
                            return [2 /*return*/];
                        }
                        _a.label = 3;
                    case 3:
                        // Validate percentage value
                        if (data.discount_type === "percentage" &&
                            data.discount_value !== undefined &&
                            data.discount_value > 100) {
                            res.status(400).json({
                                success: false,
                                message: "Percentage discount cannot exceed 100%",
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.discount.update({
                                where: { discount_id: Number(id) },
                                data: {
                                    store_id: data.store_id,
                                    product_id: data.product_id,
                                    userUser_id: data.userUser_id, // Updated to match schema
                                    thumbnail: data.thumbnail,
                                    discount_code: data.discount_code,
                                    discount_type: data.discount_type,
                                    discount_value: data.discount_value,
                                    minimum_order: data.minimum_order,
                                    expires_at: data.expires_at,
                                    updated_at: new Date(),
                                },
                            })];
                    case 4:
                        updatedDiscount = _a.sent();
                        res.status(200).json({
                            success: true,
                            message: "Discount updated successfully",
                            data: updatedDiscount,
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_7 = _a.sent();
                        console.error("Error updating discount:", error_7);
                        res.status(500).json({
                            success: false,
                            message: "Failed to update discount",
                            error: error_7 instanceof Error ? error_7.message : "Unknown error occurred",
                        });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    // Delete a discount
    DiscountController.prototype.deleteDiscount = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, existingDiscount, vouchersUsingDiscount, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        id = req.params.id;
                        if (!id || isNaN(Number(id))) {
                            res.status(400).json({
                                success: false,
                                message: "Valid discount ID required",
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.discount.findUnique({
                                where: { discount_id: Number(id) },
                            })];
                    case 1:
                        existingDiscount = _a.sent();
                        if (!existingDiscount) {
                            res.status(404).json({
                                success: false,
                                message: "Discount not found",
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.voucher.findFirst({
                                where: { discount_id: Number(id) },
                            })];
                    case 2:
                        vouchersUsingDiscount = _a.sent();
                        if (vouchersUsingDiscount) {
                            res.status(400).json({
                                success: false,
                                message: "Cannot delete discount as it is being used by vouchers",
                            });
                            return [2 /*return*/];
                        }
                        // Delete the discount
                        return [4 /*yield*/, prisma.discount.delete({
                                where: { discount_id: Number(id) },
                            })];
                    case 3:
                        // Delete the discount
                        _a.sent();
                        res.status(200).json({
                            success: true,
                            message: "Discount deleted successfully",
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_8 = _a.sent();
                        console.error("Error deleting discount:", error_8);
                        res.status(500).json({
                            success: false,
                            message: "Failed to delete discount",
                            error: error_8 instanceof Error ? error_8.message : "Unknown error occurred",
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // Apply discount with bulk purchase logic
    DiscountController.prototype.applyDiscount = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, products, discountCode, discount, totalBeforeDiscount, _i, products_1, product, discountAmount, totalAfterDiscount, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, products = _a.products, discountCode = _a.discountCode;
                        if (!Array.isArray(products) || products.length === 0) {
                            res.status(400).json({
                                success: false,
                                message: "Valid products array required",
                            });
                            return [2 /*return*/];
                        }
                        if (!discountCode) {
                            res.status(400).json({
                                success: false,
                                message: "Discount code required",
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, prisma.discount.findUnique({
                                where: { discount_code: discountCode },
                            })];
                    case 1:
                        discount = _b.sent();
                        if (!discount) {
                            res.status(404).json({
                                success: false,
                                message: "Discount not found",
                            });
                            return [2 /*return*/];
                        }
                        // Check if expired
                        if (discount.expires_at < new Date()) {
                            res.status(400).json({
                                success: false,
                                message: "Discount has expired",
                            });
                            return [2 /*return*/];
                        }
                        totalBeforeDiscount = 0;
                        for (_i = 0, products_1 = products; _i < products_1.length; _i++) {
                            product = products_1[_i];
                            totalBeforeDiscount += product.price * product.quantity;
                        }
                        // Check minimum order if applicable
                        if (discount.minimum_order &&
                            totalBeforeDiscount < discount.minimum_order) {
                            res.status(400).json({
                                success: false,
                                message: "Minimum order of ".concat(discount.minimum_order, " required for this discount"),
                            });
                            return [2 /*return*/];
                        }
                        discountAmount = 0;
                        if (discount.discount_type === "percentage") {
                            discountAmount = (totalBeforeDiscount * discount.discount_value) / 100;
                        }
                        else {
                            discountAmount = discount.discount_value;
                        }
                        totalAfterDiscount = totalBeforeDiscount - discountAmount;
                        res.status(200).json({
                            success: true,
                            message: "Discount applied successfully",
                            data: {
                                totalBeforeDiscount: totalBeforeDiscount,
                                discountAmount: discountAmount,
                                totalAfterDiscount: totalAfterDiscount,
                                discountCode: discount.discount_code,
                                discountType: discount.discount_type,
                            },
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _b.sent();
                        console.error("Error applying discount:", error_9);
                        res.status(500).json({
                            success: false,
                            message: "Failed to apply discount",
                            error: error_9 instanceof Error ? error_9.message : "Unknown error occurred",
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return DiscountController;
}());
exports.DiscountController = DiscountController;
