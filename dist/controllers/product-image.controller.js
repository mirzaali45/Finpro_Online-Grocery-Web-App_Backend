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
exports.ProductImageController = void 0;
var client_1 = require("../../prisma/generated/client");
var cloudinary_1 = require("../services/cloudinary");
var responseError_1 = require("../helpers/responseError");
var prisma = new client_1.PrismaClient();
var ProductImageController = /** @class */ (function () {
    function ProductImageController() {
        this.uploadMiddleware = cloudinary_1.uploadProduct.array("images", 5);
    }
    ProductImageController.prototype.addProductImages = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var product_id_1, files, uploadPromises, images, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        product_id_1 = req.params.product_id;
                        files = req.files;
                        if (!files || files.length === 0) {
                            return [2 /*return*/, (0, responseError_1.responseError)(res, "No files uploaded")];
                        }
                        uploadPromises = files.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                            var result, error_2;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, cloudinary_1.uploadToCloudinary)(file.path, "product_image")];
                                    case 1:
                                        result = _a.sent();
                                        // Then create database record with Cloudinary URL
                                        return [2 /*return*/, prisma.productImage.create({
                                                data: {
                                                    product_id: parseInt(product_id_1),
                                                    url: result.secure_url,
                                                },
                                            })];
                                    case 2:
                                        error_2 = _a.sent();
                                        console.error("Error processing file:", error_2);
                                        throw error_2;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(uploadPromises)];
                    case 1:
                        images = _a.sent();
                        return [2 /*return*/, res.status(201).json({
                                status: "success",
                                data: images
                            })];
                    case 2:
                        error_1 = _a.sent();
                        return [2 /*return*/, (0, responseError_1.responseError)(res, error_1 instanceof Error ? error_1.message : "Unknown error occurred")];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ProductImageController.prototype.getProductImages = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var product_id, images, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        product_id = req.params.product_id;
                        return [4 /*yield*/, prisma.productImage.findMany({
                                where: { product_id: parseInt(product_id) },
                            })];
                    case 1:
                        images = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                data: images
                            })];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, (0, responseError_1.responseError)(res, error_3 instanceof Error ? error_3.message : "Unknown error occurred")];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ProductImageController.prototype.deleteProductImage = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var image_id, image, cloudinaryResult, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        image_id = req.params.image_id;
                        return [4 /*yield*/, prisma.productImage.findUnique({
                                where: { image_id: parseInt(image_id) },
                            })];
                    case 1:
                        image = _a.sent();
                        if (!image) {
                            return [2 /*return*/, (0, responseError_1.responseError)(res, "Image not found")];
                        }
                        return [4 /*yield*/, (0, cloudinary_1.deleteFromCloudinary)(image.url, "product_image")];
                    case 2:
                        cloudinaryResult = _a.sent();
                        if (!cloudinaryResult) {
                            return [2 /*return*/, (0, responseError_1.responseError)(res, "Failed to delete image from cloud storage")];
                        }
                        // Then delete from database
                        return [4 /*yield*/, prisma.productImage.delete({
                                where: { image_id: parseInt(image_id) },
                            })];
                    case 3:
                        // Then delete from database
                        _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                message: "Product image deleted successfully"
                            })];
                    case 4:
                        error_4 = _a.sent();
                        return [2 /*return*/, (0, responseError_1.responseError)(res, error_4 instanceof Error ? error_4.message : "Unknown error occurred")];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ProductImageController.prototype.getProductImageById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var image_id, image, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        image_id = req.params.image_id;
                        return [4 /*yield*/, prisma.productImage.findUnique({
                                where: { image_id: parseInt(image_id) },
                            })];
                    case 1:
                        image = _a.sent();
                        if (!image) {
                            return [2 /*return*/, (0, responseError_1.responseError)(res, "Image not found")];
                        }
                        return [2 /*return*/, res.status(200).json({
                                status: "success",
                                data: image
                            })];
                    case 2:
                        error_5 = _a.sent();
                        return [2 /*return*/, (0, responseError_1.responseError)(res, error_5 instanceof Error ? error_5.message : "Unknown error occurred")];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ProductImageController;
}());
exports.ProductImageController = ProductImageController;
