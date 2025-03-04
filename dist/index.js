"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const auth_router_1 = require("./routers/auth.router");
const customer_router_1 = require("./routers/customer.router");
const super_admin_router_1 = require("./routers/super-admin.router");
const store_admin_router_1 = require("./routers/store-admin.router");
const product_router_1 = require("./routers/product.router");
const inventory_router_1 = require("./routers/inventory.router");
const store_router_1 = require("./routers/store.router");
const category_router_1 = require("./routers/category.router");
const product_image_router_1 = require("./routers/product-image.router");
const cart_router_1 = require("./routers/cart.router");
const rajaongkir_router_1 = require("./routers/rajaongkir.router");
const cekongkir_router_1 = require("./routers/cekongkir.router");
const order_router_1 = require("./routers/order.router");
const payments_router_1 = require("./routers/payments.router");
const discount_router_1 = require("./routers/discount-router");
const voucher_router_1 = require("./routers/voucher.router");
const reports_store_router_1 = require("./routers/reports-store.router");
const reports_superadmin_router_1 = require("./routers/reports-superadmin.router");
const revenue_store_router_1 = require("./routers/revenue-store.router");
const revenue_superadmin_router_1 = require("./routers/revenue-superadmin.router");
const PORT = 8000;
const base_url_fe = process.env.BASE_URL_FE;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: base_url_fe,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
const authRouter = new auth_router_1.AuthRouter();
const customerRouter = new customer_router_1.CustomerRouter();
const superAdminRouter = new super_admin_router_1.SuperAdminRouter();
const storeAdminRouter = new store_admin_router_1.StoreAdminRouter();
const productRouter = new product_router_1.ProductRouter();
const inventoryRouter = new inventory_router_1.InventoryRouter();
const storeRouter = new store_router_1.StoreRouter();
const categoryRouter = new category_router_1.CategoryRouter();
const productImageRouter = new product_image_router_1.ProductImageRouter();
const cartRouter = new cart_router_1.CartRouter();
const rajaOngkirRouter = new rajaongkir_router_1.RajaOngkirRouter();
const cekOngkir = new cekongkir_router_1.CekOngkirRouter();
const ordersRouter = new order_router_1.OrdersRouter();
const paymentsRouter = new payments_router_1.PaymentsRouter();
const discountRouter = new discount_router_1.DiscountRouter();
const voucherRouter = new voucher_router_1.VoucherRouter();
const reportRouter = new reports_store_router_1.ReportsRouter();
const reportSuperAdminRouter = new reports_superadmin_router_1.ReportSuperAdminRouter();
const revenueStoreRouter = new revenue_store_router_1.RevenueStoreRouter();
const revenueSuperRouter = new revenue_superadmin_router_1.RevenueSuperAdminRouter();
app.use("/api/auth", authRouter.getRouter()); // sasa
app.use("/api/customer", customerRouter.getRouter()); // sasa
app.use("/api/super-admin", superAdminRouter.getRouter()); // zaki
app.use("/api/store-admin", storeAdminRouter.getRouter()); // zaki
app.use("/api/product", productRouter.getRouter()); // zaki
app.use("/api/inventory", inventoryRouter.getRouter()); // zaki
app.use("/api/store", storeRouter.getRouter()); // zaki
app.use("/api/category", categoryRouter.getRouter()); // zaki
app.use("/api/product-image", productImageRouter.getRouter()); // zaki
app.use("/api/cart", cartRouter.getRouter()); //mirza
app.use("/api/orders", ordersRouter.getRouter()); //mirza
app.use("/api/payments", paymentsRouter.getRouter()); //mirza
app.use("/api/rajaongkir", rajaOngkirRouter.getRouter()); //all
app.use("/api/cek-ongkir", cekOngkir.getRouter());
app.use("/api/discount", discountRouter.getRouter());
app.use("/api/voucher", voucherRouter.getRouter());
app.use("/api/reports/", reportRouter.getRouter());
app.use("/api/reports-superadmin", reportSuperAdminRouter.getRouter());
app.use("/api/revenueorder/", revenueStoreRouter.getRouter());
app.use("/api/revenue-superadmin", revenueSuperRouter.getRouter());
app.get("/api", (req, res) => {
    res.send("Welcome to the API!");
});
app.listen(PORT, () => {
    console.log(`Server is running on -> http://localhost:${PORT}/api`);
});
exports.default = app;
