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
exports.VoucherController = void 0;
var client_1 = require("../../prisma/generated/client");
var prisma = new client_1.PrismaClient();
var VoucherController = /** @class */ (function () {
    function VoucherController() {
    }
    // Static method to generate voucher code
    VoucherController.generateVoucherCode = function () {
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var codeLength = 8;
        var code = "";
        for (var i = 0; i < codeLength; i++) {
            var randomIndex = Math.floor(Math.random() * characters.length);
            code += characters[randomIndex];
        }
        return code;
    };
    VoucherController.prototype.claimDiscount = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var discount_id, discount, existingVoucher, voucher, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        // Ensure user is authenticated
                        if (!req.user) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: "Authentication required",
                                })];
                        }
                        discount_id = req.body.discount_id;
                        // Validate input
                        if (!discount_id) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: "Discount ID is required",
                                })];
                        }
                        return [4 /*yield*/, prisma.discount.findUnique({
                                where: { discount_id: Number(discount_id) },
                                include: {
                                    store: true,
                                    product: true,
                                },
                            })];
                    case 1:
                        discount = _a.sent();
                        // Check if discount exists
                        if (!discount) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: "Discount not found",
                                })];
                        }
                        // Check if discount is expired
                        if (new Date(discount.expires_at) < new Date()) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: "Discount has expired",
                                })];
                        }
                        return [4 /*yield*/, prisma.voucher.findFirst({
                                where: {
                                    user_id: req.user.id,
                                    discount_id: discount.discount_id,
                                },
                            })];
                    case 2:
                        existingVoucher = _a.sent();
                        if (existingVoucher) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: "You have already claimed this discount",
                                })];
                        }
                        return [4 /*yield*/, prisma.voucher.create({
                                data: {
                                    user_id: req.user.id,
                                    discount_id: discount.discount_id,
                                    voucher_code: VoucherController.generateVoucherCode(),
                                    expires_at: discount.expires_at,
                                },
                            })];
                    case 3:
                        voucher = _a.sent();
                        res.status(201).json({
                            success: true,
                            message: "Discount claimed successfully",
                            voucher: voucher,
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Discount claim error:", error_1);
                        res.status(500).json({
                            success: false,
                            message: "Failed to claim discount",
                            error: error_1 instanceof Error ? error_1.message : "Unknown error",
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    VoucherController.prototype.getUserVouchers = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var vouchers, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Ensure user is authenticated
                        if (!req.user) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: "Authentication required",
                                })];
                        }
                        return [4 /*yield*/, prisma.voucher.findMany({
                                where: {
                                    user_id: req.user.id,
                                },
                                include: {
                                    discount: {
                                        include: {
                                            product: true,
                                            store: true,
                                        },
                                    },
                                },
                                orderBy: {
                                    created_at: "desc",
                                },
                            })];
                    case 1:
                        vouchers = _a.sent();
                        // Check if no vouchers exist
                        if (vouchers.length === 0) {
                            return [2 /*return*/, res.status(404).json({
                                    success: true,
                                    message: "You do not have any vouchers",
                                    data: [],
                                })];
                        }
                        res.status(200).json({
                            success: true,
                            message: "Vouchers retrieved successfully",
                            data: vouchers,
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error retrieving vouchers:", error_2);
                        res.status(500).json({
                            success: false,
                            message: "Failed to retrieve vouchers",
                            error: error_2 instanceof Error ? error_2.message : "Unknown error",
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    VoucherController.prototype.deleteVoucher = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var voucher_id, voucher, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // Ensure user is authenticated
                        if (!req.user) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: "Authentication required",
                                })];
                        }
                        voucher_id = req.params.voucher_id;
                        // Validate input
                        if (!voucher_id) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: "Voucher ID is required",
                                })];
                        }
                        return [4 /*yield*/, prisma.voucher.findUnique({
                                where: { voucher_id: Number(voucher_id) },
                            })];
                    case 1:
                        voucher = _a.sent();
                        // Check if voucher exists
                        if (!voucher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: "Voucher not found",
                                })];
                        }
                        // Verify the voucher belongs to the user
                        if (voucher.user_id !== req.user.id) {
                            return [2 /*return*/, res.status(403).json({
                                    success: false,
                                    message: "You do not have permission to delete this voucher",
                                })];
                        }
                        // Check if voucher has been used
                        if (voucher.is_redeemed) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: "Cannot delete a redeemed voucher",
                                })];
                        }
                        // Delete the voucher
                        return [4 /*yield*/, prisma.voucher.delete({
                                where: { voucher_id: Number(voucher_id) },
                            })];
                    case 2:
                        // Delete the voucher
                        _a.sent();
                        res.status(200).json({
                            success: true,
                            message: "Voucher deleted successfully",
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        console.error("Error deleting voucher:", error_3);
                        res.status(500).json({
                            success: false,
                            message: "Failed to delete voucher",
                            error: error_3 instanceof Error ? error_3.message : "Unknown error",
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return VoucherController;
}());
exports.VoucherController = VoucherController;
