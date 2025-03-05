"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var express_1 = __importDefault(require("express"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var cors_1 = __importDefault(require("cors"));
var auth_router_1 = require("./routers/auth.router");
var customer_router_1 = require("./routers/customer.router");
var super_admin_router_1 = require("./routers/super-admin.router");
var store_admin_router_1 = require("./routers/store-admin.router");
var product_router_1 = require("./routers/product.router");
var inventory_router_1 = require("./routers/inventory.router");
var store_router_1 = require("./routers/store.router");
var category_router_1 = require("./routers/category.router");
var product_image_router_1 = require("./routers/product-image.router");
var cart_router_1 = require("./routers/cart.router");
var rajaongkir_router_1 = require("./routers/rajaongkir.router");
var cekongkir_router_1 = require("./routers/cekongkir.router");
var order_router_1 = require("./routers/order.router");
var payments_router_1 = require("./routers/payments.router");
var discount_router_1 = require("./routers/discount-router");
var voucher_router_1 = require("./routers/voucher.router");
var reports_store_router_1 = require("./routers/reports-store.router");
var reports_superadmin_router_1 = require("./routers/reports-superadmin.router");
var revenue_store_router_1 = require("./routers/revenue-store.router");
var revenue_superadmin_router_1 = require("./routers/revenue-superadmin.router");
var PORT = 8000;
var base_url_fe = process.env.BASE_URL_FE;
var app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: base_url_fe,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
var authRouter = new auth_router_1.AuthRouter();
var customerRouter = new customer_router_1.CustomerRouter();
var superAdminRouter = new super_admin_router_1.SuperAdminRouter();
var storeAdminRouter = new store_admin_router_1.StoreAdminRouter();
var productRouter = new product_router_1.ProductRouter();
var inventoryRouter = new inventory_router_1.InventoryRouter();
var storeRouter = new store_router_1.StoreRouter();
var categoryRouter = new category_router_1.CategoryRouter();
var productImageRouter = new product_image_router_1.ProductImageRouter();
var cartRouter = new cart_router_1.CartRouter();
var rajaOngkirRouter = new rajaongkir_router_1.RajaOngkirRouter();
var cekOngkir = new cekongkir_router_1.CekOngkirRouter();
var ordersRouter = new order_router_1.OrdersRouter();
var paymentsRouter = new payments_router_1.PaymentsRouter();
var discountRouter = new discount_router_1.DiscountRouter();
var voucherRouter = new voucher_router_1.VoucherRouter();
var reportRouter = new reports_store_router_1.ReportsRouter();
var reportSuperAdminRouter = new reports_superadmin_router_1.ReportSuperAdminRouter();
var revenueStoreRouter = new revenue_store_router_1.RevenueStoreRouter();
var revenueSuperRouter = new revenue_superadmin_router_1.RevenueSuperAdminRouter();
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
app.get("/api", function (req, res) {
    res.send("Welcome to the API!");
});
app.listen(PORT, function () {
    console.log("Server is running on -> http://localhost:".concat(PORT, "/api"));
});
exports.default = app;
