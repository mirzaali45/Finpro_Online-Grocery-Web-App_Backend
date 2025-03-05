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
exports.CategoryController = void 0;
var client_1 = require("../../prisma/generated/client");
var cloudinary_1 = require("../services/cloudinary");
var prisma = new client_1.PrismaClient();
var CategoryController = /** @class */ (function () {
    function CategoryController() {
    }
    CategoryController.prototype.createCategory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, category_name, description, existingCategory, categoryData, result, uploadError_1, category, error_1, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        _a = req.body, category_name = _a.category_name, description = _a.description;
                        if (!category_name || !description) {
                            return [2 /*return*/, res.status(400).json({
                                    error: "Category name and description are required",
                                })];
                        }
                        return [4 /*yield*/, prisma.category.findFirst({
                                where: {
                                    category_name: {
                                        equals: category_name,
                                        mode: "insensitive",
                                    },
                                },
                            })];
                    case 1:
                        existingCategory = _b.sent();
                        if (existingCategory) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    error: "A category with this name already exists",
                                })];
                        }
                        categoryData = {
                            category_name: category_name,
                            description: description,
                        };
                        if (!req.file) return [3 /*break*/, 5];
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, (0, cloudinary_1.uploadCategoryThumbnail)(req.file.path)];
                    case 3:
                        result = _b.sent();
                        categoryData.category_thumbnail = result.secure_url;
                        return [3 /*break*/, 5];
                    case 4:
                        uploadError_1 = _b.sent();
                        console.error("Error uploading thumbnail:", uploadError_1);
                        return [2 /*return*/, res.status(500).json({
                                error: "Failed to upload category thumbnail",
                            })];
                    case 5: return [4 /*yield*/, prisma.category.create({
                            data: categoryData,
                        })];
                    case 6:
                        category = _b.sent();
                        return [2 /*return*/, res.status(201).json({
                                success: true,
                                message: "Category created successfully",
                                data: category,
                            })];
                    case 7:
                        error_1 = _b.sent();
                        message = error_1 instanceof Error ? error_1.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                error: message,
                            })];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    CategoryController.prototype.getCategories = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, skip, totalCount, categories, error_2, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        page = parseInt(req.query.page) || 1;
                        limit = parseInt(req.query.limit) || 8;
                        skip = (page - 1) * limit;
                        return [4 /*yield*/, prisma.category.count()];
                    case 1:
                        totalCount = _a.sent();
                        return [4 /*yield*/, prisma.category.findMany({
                                include: {
                                    Product: true,
                                },
                                skip: skip,
                                take: limit,
                            })];
                    case 2:
                        categories = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                data: categories,
                                pagination: {
                                    currentPage: page,
                                    totalPages: Math.ceil(totalCount / limit),
                                    totalItems: totalCount,
                                    itemsPerPage: limit,
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
    CategoryController.prototype.getCategoryById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var category_id, category, error_3, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        category_id = req.params.category_id;
                        return [4 /*yield*/, prisma.category.findUnique({
                                where: { category_id: parseInt(category_id) },
                                include: {
                                    Product: true,
                                },
                            })];
                    case 1:
                        category = _a.sent();
                        if (!category) {
                            throw new Error("Category not found");
                        }
                        return [2 /*return*/, res.status(200).json(category)];
                    case 2:
                        error_3 = _a.sent();
                        message = error_3 instanceof Error ? error_3.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CategoryController.prototype.updateCategory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var category_id, _a, category_name, description, category_url, category, error_4, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        category_id = req.params.category_id;
                        _a = req.body, category_name = _a.category_name, description = _a.description, category_url = _a.category_url;
                        return [4 /*yield*/, prisma.category.update({
                                where: { category_id: parseInt(category_id) },
                                data: {
                                    category_name: category_name,
                                    description: description,
                                },
                            })];
                    case 1:
                        category = _b.sent();
                        return [2 /*return*/, res.status(200).json(category)];
                    case 2:
                        error_4 = _b.sent();
                        message = error_4 instanceof Error ? error_4.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    CategoryController.prototype.deleteCategory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var category_id, error_5, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        category_id = req.params.category_id;
                        return [4 /*yield*/, prisma.category.delete({
                                where: { category_id: parseInt(category_id) },
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, res.status(200).json({ message: "Category deleted successfully" })];
                    case 2:
                        error_5 = _a.sent();
                        message = error_5 instanceof Error ? error_5.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return CategoryController;
}());
exports.CategoryController = CategoryController;
