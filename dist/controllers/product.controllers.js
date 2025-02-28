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
exports.ProductController = void 0;
const client_1 = require("../../prisma/generated/client");
const generateSlug_1 = require("../helpers/generateSlug");
const prisma = new client_1.PrismaClient();
class ProductController {
    createProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { store_id, name, description, price, category_id, initial_quantity, } = req.body;
                const product = yield prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const newProduct = yield tx.product.create({
                        data: {
                            store_id,
                            name,
                            description,
                            price,
                            category_id,
                        },
                    });
                    if (initial_quantity) {
                        yield tx.inventory.create({
                            data: {
                                store_id,
                                product_id: newProduct.product_id,
                                qty: initial_quantity,
                                total_qty: initial_quantity,
                            },
                        });
                    }
                    return newProduct;
                }));
                return res.status(201).json(product);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    updateProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { product_id } = req.params;
                const { name, description, price, category_id } = req.body;
                const product = yield prisma.product.update({
                    where: {
                        product_id: parseInt(product_id),
                    },
                    data: {
                        name,
                        description,
                        price,
                        category_id,
                    },
                });
                return res.status(200).json(product);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    deleteProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { product_id } = req.params;
                yield prisma.inventory.deleteMany({
                    where: {
                        product_id: parseInt(product_id),
                    },
                });
                yield prisma.productImage.deleteMany({
                    where: {
                        product_id: parseInt(product_id),
                    },
                });
                // Finally delete the product
                yield prisma.product.delete({
                    where: {
                        product_id: parseInt(product_id),
                    },
                });
                return res.status(200).json({ message: "Product deleted successfully" });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    getProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 8;
                const featured = req.query.featured === "true";
                const categoryId = req.query.categoryId
                    ? parseInt(req.query.categoryId)
                    : undefined;
                const minPrice = req.query.minPrice
                    ? parseFloat(req.query.minPrice)
                    : undefined;
                const maxPrice = req.query.maxPrice
                    ? parseFloat(req.query.maxPrice)
                    : undefined;
                // Prepare where condition
                const whereCondition = {};
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
                // If featured, prioritize by price
                const products = yield prisma.product.findMany({
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
                });
                const totalProducts = yield prisma.product.count({
                    where: whereCondition,
                });
                const totalPages = Math.ceil(totalProducts / limit);
                return res.status(200).json({
                    products,
                    totalPages,
                    currentPage: page,
                });
            }
            catch (error) {
                console.error("Error fetching products:", error);
                return res.status(500).json({ error: "Failed to fetch products" });
            }
        });
    }
    getDiscountedProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 8;
                const categoryId = req.query.categoryId
                    ? parseInt(req.query.categoryId)
                    : undefined;
                const minPrice = req.query.minPrice
                    ? parseFloat(req.query.minPrice)
                    : undefined;
                const maxPrice = req.query.maxPrice
                    ? parseFloat(req.query.maxPrice)
                    : undefined;
                // Prepare where condition
                const whereCondition = {
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
                const products = yield prisma.product.findMany({
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
                });
                const totalProducts = yield prisma.product.count({
                    where: whereCondition,
                });
                return res.status(200).json({
                    products,
                    totalPages: Math.ceil(totalProducts / limit),
                    currentPage: page,
                });
            }
            catch (error) {
                console.error("Error fetching discounted products:", error);
                return res
                    .status(500)
                    .json({ error: "Failed to fetch discounted products" });
            }
        });
    }
    getProductById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { product_id } = req.params;
                const product = yield prisma.product.findUnique({
                    where: { product_id: parseInt(product_id) },
                    include: {
                        store: true,
                        category: true,
                        Inventory: true,
                        ProductImage: true,
                    },
                });
                if (!product)
                    throw new Error("Product not found");
                return res.status(200).json(product);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    getProductBySlug(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { slug } = req.params;
                const products = yield prisma.product.findMany({
                    include: {
                        store: true,
                        category: true,
                        Inventory: true,
                        ProductImage: true,
                        Discount: true,
                    },
                });
                const product = products.find((p) => (0, generateSlug_1.generateSlug)(p.name) === slug);
                if (!product)
                    throw new Error("Product not found");
                return res.status(200).json(product);
            }
            catch (error) {
                const message = error instanceof Error ? error.message : "Unknown error occurred";
                return res.status(500).json({ error: message });
            }
        });
    }
    getProductsByStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get user from authenticated token
                const user = req.user;
                // Find store associated with the user
                const store = yield prisma.store.findUnique({
                    where: { user_id: user === null || user === void 0 ? void 0 : user.id },
                });
                if (!store) {
                    res.status(404).json({
                        success: false,
                        message: "No store found for this user",
                    });
                    return;
                }
                const { page = 1, limit = 10, categoryId, minPrice, maxPrice, search, } = req.query;
                const pageNum = Number(page);
                const limitNum = Number(limit);
                const offset = (pageNum - 1) * limitNum;
                // Build where condition dynamically
                const whereCondition = {
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
                // Fetch products with pagination and include related info
                const products = yield prisma.product.findMany({
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
                });
                // Count total products for pagination
                const totalProducts = yield prisma.product.count({
                    where: whereCondition,
                });
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
            }
            catch (error) {
                console.error("Error fetching products:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch products",
                    error: error instanceof Error ? error.message : "Unknown error occurred",
                });
            }
        });
    }
}
exports.ProductController = ProductController;
