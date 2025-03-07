// cronJobs/orderCron.ts
import cron from 'node-cron';
import { autoConfirmOrder } from '../controllers/orderController';

// Menjadwalkan pekerjaan otomatis setiap jam
cron.schedule('0 * * * *', () => {
  console.log('Running auto-confirm job...');
  autoConfirmOrder();
});
