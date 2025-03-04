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
exports.ReportStore = void 0;
const client_1 = require("../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
class ReportStore {
    getReportInventory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                // Get the user_id of the store admin from the request
                // This could come from authentication middleware or request body/params
                // Fix: Use correct property name from your Prisma schema - user_id
                const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || parseInt(req.params.userId);
                if (!userId) {
                    return res.status(400).json({
                        status: "error",
                        message: "User ID is required"
                    });
                }
                // Get the store associated with this user (store admin)
                const store = yield prisma.store.findFirst({
                    where: {
                        user_id: userId
                    }
                });
                if (!store) {
                    return res.status(404).json({
                        status: "error",
                        message: "Store not found for this user"
                    });
                }
                // Get inventory data with product details for this store
                const inventoryReport = yield prisma.inventory.findMany({
                    where: {
                        store_id: store.store_id
                    },
                    include: {
                        product: {
                            select: {
                                product_id: true,
                                name: true,
                                price: true,
                                category: {
                                    select: {
                                        category_name: true
                                    }
                                }
                            }
                        }
                    }
                });
                // Format the report data
                const formattedReport = inventoryReport.map(item => ({
                    product_id: item.product_id,
                    product_name: item.product.name,
                    category: item.product.category.category_name,
                    current_quantity: item.qty,
                    total_quantity: item.total_qty,
                    price: item.product.price,
                    estimated_value: item.qty * item.product.price,
                    last_updated: item.updated_at
                }));
                // Calculate summary statistics
                const totalItems = formattedReport.reduce((sum, item) => sum + item.current_quantity, 0);
                const totalValue = formattedReport.reduce((sum, item) => sum + item.estimated_value, 0);
                return res.status(200).json({
                    status: "success",
                    data: {
                        store_name: store.store_name,
                        store_id: store.store_id,
                        report_date: new Date(),
                        summary: {
                            total_items: totalItems,
                            total_value: totalValue,
                            product_count: formattedReport.length
                        },
                        inventory: formattedReport
                    }
                });
            }
            catch (error) {
                console.error("Error generating inventory report:", error);
                // Fix: Handle the 'unknown' type error properly
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                return res.status(500).json({
                    status: "error",
                    message: "Failed to generate inventory report",
                    error: errorMessage
                });
            }
        });
    }
}
exports.ReportStore = ReportStore;
