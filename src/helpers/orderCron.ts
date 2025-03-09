// cronJobs/orderCron.ts
import cron from 'node-cron';
import { ordersController } from '../controllers/orders.controller';  // Mengimpor instansi OrdersController

// Menjadwalkan pekerjaan otomatis setiap hari pada jam 00:00
cron.schedule('0 0 * * *', () => {
  console.log('Running auto-confirm job...');
  ordersController.autoConfirmOrder(); // Menggunakan method autoConfirmOrder dari OrdersController
});
