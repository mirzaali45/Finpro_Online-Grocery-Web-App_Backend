// src/config/midtrans.ts
import midtransClient from 'midtrans-client';

/**
 * Pastikan Anda sudah set environment variable:
 * - MIDTRANS_SERVER_KEY
 * - MIDTRANS_CLIENT_KEY
 * isProduction bisa di-set sesuai kebutuhan
 */
export const snap = new midtransClient.Snap({
  isProduction: false, // ubah ke true jika production
  serverKey: process.env.MIDTRANS_SERVER_KEY || '',
  clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});
