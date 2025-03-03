import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { AuthRouter } from "./routers/auth.router";
import { CustomerRouter } from "./routers/customer.router";
import { SuperAdminRouter } from "./routers/super-admin.router";
import { StoreAdminRouter } from "./routers/store-admin.router";
import { ProductRouter } from "./routers/product.router";
import { InventoryRouter } from "./routers/inventory.router";
import { StoreRouter } from "./routers/store.router";
import { CategoryRouter } from "./routers/category.router";
import { ProductImageRouter } from "./routers/product-image.router";
import { CartRouter } from "./routers/cart.router";
import { RajaOngkirRouter } from "./routers/rajaongkir.router";
import { CekOngkirRouter } from "./routers/cekongkir.router";
import { OrdersRouter } from "./routers/order.router";
import { PaymentsRouter } from "./routers/payments.router";
import { DiscountRouter } from "./routers/discount-router";
import { VoucherRouter } from "./routers/voucher.router";
import { ReportsRouter } from "./routers/reports-store.router";
import { ReportSuperAdminRouter } from "./routers/reports-superadmin.router";
import { RevenueStoreRouter } from "./routers/revenue-store.router";
import { RevenueSuperAdminRouter } from "./routers/revenue-superadmin.router";

const PORT: number = 8000;
const base_url_fe = process.env.BASE_URL_FE;

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: base_url_fe,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const authRouter = new AuthRouter();
const customerRouter = new CustomerRouter();
const superAdminRouter = new SuperAdminRouter();
const storeAdminRouter = new StoreAdminRouter();
const productRouter = new ProductRouter();
const inventoryRouter = new InventoryRouter();
const storeRouter = new StoreRouter();
const categoryRouter = new CategoryRouter();
const productImageRouter = new ProductImageRouter();
const cartRouter = new CartRouter();
const rajaOngkirRouter = new RajaOngkirRouter();
const cekOngkir = new CekOngkirRouter();
const ordersRouter = new OrdersRouter();
const paymentsRouter = new PaymentsRouter();
const discountRouter = new DiscountRouter()
const voucherRouter = new VoucherRouter()
const reportRouter = new ReportsRouter()
const reportSuperAdminRouter = new ReportSuperAdminRouter();
const revenueStoreRouter = new RevenueStoreRouter()
const revenueSuperRouter = new RevenueSuperAdminRouter()

app.use("/api/auth", authRouter.getRouter()); // sasa
app.use("/api/customer", customerRouter.getRouter()) // sasa
app.use("/api/super-admin", superAdminRouter.getRouter()) // zaki
app.use("/api/store-admin",storeAdminRouter.getRouter()) // zaki
app.use("/api/product",productRouter.getRouter()) // zaki
app.use("/api/inventory",inventoryRouter.getRouter()) // zaki
app.use("/api/store",storeRouter.getRouter()) // zaki
app.use("/api/category",categoryRouter.getRouter()) // zaki
app.use("/api/product-image",productImageRouter.getRouter()) // zaki
app.use("/api/cart", cartRouter.getRouter());//mirza
app.use("/api/orders", ordersRouter.getRouter());//mirza
app.use("/api/payments", paymentsRouter.getRouter());//mirza
app.use("/api/rajaongkir", rajaOngkirRouter.getRouter()); //all
app.use("/api/cek-ongkir",cekOngkir.getRouter()) 
app.use("/api/discount", discountRouter.getRouter())
app.use("/api/voucher", voucherRouter.getRouter())
app.use("/api/reports/", reportRouter.getRouter())
app.use("/api/reports-superadmin", reportSuperAdminRouter.getRouter());
app.use("/api/revenueorder/", revenueStoreRouter.getRouter())
app.use("/api/revenue-superadmin",revenueSuperRouter.getRouter())


app.get("/api", (req, res) => {
  res.send("Welcome to the API!");
});

app.listen(PORT, () => {
  console.log(`Server is running on -> http://localhost:${PORT}/api`);
});

export default app
