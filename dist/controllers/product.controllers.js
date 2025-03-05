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
exports.ProductController = void 0;
var client_1 = require("../../prisma/generated/client");
var generateSlug_1 = require("../helpers/generateSlug");
var prisma = new client_1.PrismaClient();
var ProductController = /** @class */ (function () {
    function ProductController() {
    }
    ProductController.prototype.createProduct = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, store_id_1, name_1, description_1, price_1, category_id_1, initial_quantity_1, product, error_1, message;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, store_id_1 = _a.store_id, name_1 = _a.name, description_1 = _a.description, price_1 = _a.price, category_id_1 = _a.category_id, initial_quantity_1 = _a.initial_quantity;
                        return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                var newProduct;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, tx.product.create({
                                                data: {
                                                    store_id: store_id_1,
                                                    name: name_1,
                                                    description: description_1,
                                                    price: price_1,
                                                    category_id: category_id_1,
                                                },
                                            })];
                                        case 1:
                                            newProduct = _a.sent();
                                            if (!initial_quantity_1) return [3 /*break*/, 3];
                                            return [4 /*yield*/, tx.inventory.create({
                                                    data: {
                                                        store_id: store_id_1,
                                                        product_id: newProduct.product_id,
                                                        qty: initial_quantity_1,
                                                        total_qty: initial_quantity_1,
                                                    },
                                                })];
                                        case 2:
                                            _a.sent();
                                            _a.label = 3;
                                        case 3: return [2 /*return*/, newProduct];
                                    }
                                });
                            }); })];
                    case 1:
                        product = _b.sent();
                        return [2 /*return*/, res.status(201).json(product)];
                    case 2:
                        error_1 = _b.sent();
                        message = error_1 instanceof Error ? error_1.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ProductController.prototype.updateProduct = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var product_id, _a, name_2, description, price, category_id, product, error_2, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        product_id = req.params.product_id;
                        _a = req.body, name_2 = _a.name, description = _a.description, price = _a.price, category_id = _a.category_id;
                        return [4 /*yield*/, prisma.product.update({
                                where: {
                                    product_id: parseInt(product_id),
                                },
                                data: {
                                    name: name_2,
                                    description: description,
                                    price: price,
                                    category_id: category_id,
                                },
                            })];
                    case 1:
                        product = _b.sent();
                        return [2 /*return*/, res.status(200).json(product)];
                    case 2:
                        error_2 = _b.sent();
                        message = error_2 instanceof Error ? error_2.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ProductController.prototype.deleteProduct = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var product_id, error_3, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        product_id = req.params.product_id;
                        return [4 /*yield*/, prisma.inventory.deleteMany({
                                where: {
                                    product_id: parseInt(product_id),
                                },
                            })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, prisma.productImage.deleteMany({
                                where: {
                                    product_id: parseInt(product_id),
                                },
                            })];
                    case 2:
                        _a.sent();
                        // Finally delete the product
                        return [4 /*yield*/, prisma.product.delete({
                                where: {
                                    product_id: parseInt(product_id),
                                },
                            })];
                    case 3:
                        // Finally delete the product
                        _a.sent();
                        return [2 /*return*/, res.status(200).json({ message: "Product deleted successfully" })];
                    case 4:
                        error_3 = _a.sent();
                        message = error_3 instanceof Error ? error_3.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    ProductController.prototype.getProducts = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, featured, categoryId, minPrice, maxPrice, whereCondition, products, totalProducts, totalPages, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        page = parseInt(req.query.page) || 1;
                        limit = parseInt(req.query.limit) || 8;
                        featured = req.query.featured === "true";
                        categoryId = req.query.categoryId
                            ? parseInt(req.query.categoryId)
                            : undefined;
                        minPrice = req.query.minPrice
                            ? parseFloat(req.query.minPrice)
                            : undefined;
                        maxPrice = req.query.maxPrice
                            ? parseFloat(req.query.maxPrice)
                            : undefined;
                        whereCondition = {};
                        // Add category filter if categoryId is provided
                        if (categoryId) {
                            whereCondition.category_id = categoryId;
                        }
                        // Add price range filter if min or max price is provided
                        if (minPrice !== undefined || maxPrice !== undefined) {
                            whereCondition.price = {};
                            if (minPrice !== undefined) {
                                whereCondition.price.gte = minPrice;
                            }
                            if (maxPrice !== undefined) {
                                whereCondition.price.lte = maxPrice;
                            }
                        }
                        return [4 /*yield*/, prisma.product.findMany({
                                where: whereCondition,
                                skip: featured ? 0 : (page - 1) * limit,
                                take: limit,
                                include: {
                                    store: true,
                                    category: true,
                                    Inventory: true,
                                    ProductImage: true,
                                    Discount: true,
                                },
                                orderBy: featured ? { price: "desc" } : { created_at: "desc" },
                            })];
                    case 1:
                        products = _a.sent();
                        return [4 /*yield*/, prisma.product.count({
                                where: whereCondition,
                            })];
                    case 2:
                        totalProducts = _a.sent();
                        totalPages = Math.ceil(totalProducts / limit);
                        return [2 /*return*/, res.status(200).json({
                                products: products,
                                totalPages: totalPages,
                                currentPage: page,
                            })];
                    case 3:
                        error_4 = _a.sent();
                        console.error("Error fetching products:", error_4);
                        return [2 /*return*/, res.status(500).json({ error: "Failed to fetch products" })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ProductController.prototype.getDiscountedProducts = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, categoryId, minPrice, maxPrice, whereCondition, products, totalProducts, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        page = parseInt(req.query.page) || 1;
                        limit = parseInt(req.query.limit) || 8;
                        categoryId = req.query.categoryId
                            ? parseInt(req.query.categoryId)
                            : undefined;
                        minPrice = req.query.minPrice
                            ? parseFloat(req.query.minPrice)
                            : undefined;
                        maxPrice = req.query.maxPrice
                            ? parseFloat(req.query.maxPrice)
                            : undefined;
                        whereCondition = {
                            Discount: {
                                some: {}, // Only products with discounts
                            },
                        };
                        // Add other filters
                        if (categoryId) {
                            whereCondition.category_id = categoryId;
                        }
                        if (minPrice !== undefined || maxPrice !== undefined) {
                            whereCondition.price = {};
                            if (minPrice !== undefined)
                                whereCondition.price.gte = minPrice;
                            if (maxPrice !== undefined)
                                whereCondition.price.lte = maxPrice;
                        }
                        return [4 /*yield*/, prisma.product.findMany({
                                where: whereCondition,
                                skip: (page - 1) * limit,
                                take: limit,
                                include: {
                                    store: true,
                                    category: true,
                                    Inventory: true,
                                    ProductImage: true,
                                    Discount: true,
                                },
                                orderBy: { created_at: "desc" },
                            })];
                    case 1:
                        products = _a.sent();
                        return [4 /*yield*/, prisma.product.count({
                                where: whereCondition,
                            })];
                    case 2:
                        totalProducts = _a.sent();
                        return [2 /*return*/, res.status(200).json({
                                products: products,
                                totalPages: Math.ceil(totalProducts / limit),
                                currentPage: page,
                            })];
                    case 3:
                        error_5 = _a.sent();
                        console.error("Error fetching discounted products:", error_5);
                        return [2 /*return*/, res
                                .status(500)
                                .json({ error: "Failed to fetch discounted products" })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ProductController.prototype.getProductById = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var product_id, product, error_6, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        product_id = req.params.product_id;
                        return [4 /*yield*/, prisma.product.findUnique({
                                where: { product_id: parseInt(product_id) },
                                include: {
                                    store: true,
                                    category: true,
                                    Inventory: true,
                                    ProductImage: true,
                                },
                            })];
                    case 1:
                        product = _a.sent();
                        if (!product)
                            throw new Error("Product not found");
                        return [2 /*return*/, res.status(200).json(product)];
                    case 2:
                        error_6 = _a.sent();
                        message = error_6 instanceof Error ? error_6.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ProductController.prototype.getProductBySlug = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var slug_1, products, product, error_7, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        slug_1 = req.params.slug;
                        return [4 /*yield*/, prisma.product.findMany({
                                include: {
                                    store: true,
                                    category: true,
                                    Inventory: true,
                                    ProductImage: true,
                                    Discount: true,
                                },
                            })];
                    case 1:
                        products = _a.sent();
                        product = products.find(function (p) { return (0, generateSlug_1.generateSlug)(p.name) === slug_1; });
                        if (!product)
                            throw new Error("Product not found");
                        return [2 /*return*/, res.status(200).json(product)];
                    case 2:
                        error_7 = _a.sent();
                        message = error_7 instanceof Error ? error_7.message : "Unknown error occurred";
                        return [2 /*return*/, res.status(500).json({ error: message })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ProductController.prototype.getProductsByStore = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, store, _a, _b, page, _c, limit, categoryId, minPrice, maxPrice, search, pageNum, limitNum, offset, whereCondition, products, totalProducts, error_8;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 4, , 5]);
                        user = req.user;
                        return [4 /*yield*/, prisma.store.findUnique({
                                where: { user_id: user === null || user === void 0 ? void 0 : user.id },
                            })];
                    case 1:
                        store = _d.sent();
                        if (!store) {
                            res.status(404).json({
                                success: false,
                                message: "No store found for this user",
                            });
                            return [2 /*return*/];
                        }
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c, categoryId = _a.categoryId, minPrice = _a.minPrice, maxPrice = _a.maxPrice, search = _a.search;
                        pageNum = Number(page);
                        limitNum = Number(limit);
                        offset = (pageNum - 1) * limitNum;
                        whereCondition = {
                            store_id: store.store_id,
                        };
                        // Optional filters
                        if (categoryId) {
                            whereCondition.category_id = Number(categoryId);
                        }
                        if (minPrice || maxPrice) {
                            whereCondition.price = {};
                            if (minPrice)
                                whereCondition.price.gte = Number(minPrice);
                            if (maxPrice)
                                whereCondition.price.lte = Number(maxPrice);
                        }
                        if (search) {
                            whereCondition.OR = [
                                { name: { contains: String(search), mode: "insensitive" } },
                                { description: { contains: String(search), mode: "insensitive" } },
                            ];
                        }
                        return [4 /*yield*/, prisma.product.findMany({
                                where: whereCondition,
                                include: {
                                    category: true,
                                    Inventory: true,
                                    ProductImage: {
                                        take: 1, // Get first image
                                    },
                                },
                                take: limitNum,
                                skip: offset,
                                orderBy: {
                                    created_at: "desc",
                                },
                            })];
                    case 2:
                        products = _d.sent();
                        return [4 /*yield*/, prisma.product.count({
                                where: whereCondition,
                            })];
                    case 3:
                        totalProducts = _d.sent();
                        res.status(200).json({
                            success: true,
                            data: products,
                            pagination: {
                                page: pageNum,
                                limit: limitNum,
                                total: totalProducts,
                                totalPages: Math.ceil(totalProducts / limitNum),
                            },
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_8 = _d.sent();
                        console.error("Error fetching products:", error_8);
                        res.status(500).json({
                            success: false,
                            message: "Failed to fetch products",
                            error: error_8 instanceof Error ? error_8.message : "Unknown error occurred",
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return ProductController;
}());
exports.ProductController = ProductController;
