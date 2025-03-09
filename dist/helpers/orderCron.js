"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// cronJobs/orderCron.ts
const node_cron_1 = __importDefault(require("node-cron"));
const orders_controller_1 = require("../controllers/orders.controller"); // Mengimpor instansi OrdersController
// Menjadwalkan pekerjaan otomatis setiap hari pada jam 00:00
node_cron_1.default.schedule('0 0 * * *', () => {
    console.log('Running auto-confirm job...');
    orders_controller_1.ordersController.autoConfirmOrder(); // Menggunakan method autoConfirmOrder dari OrdersController
});
