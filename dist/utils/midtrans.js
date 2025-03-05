"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.snap = void 0;
// src/config/midtrans.ts
const midtrans_client_1 = __importDefault(require("midtrans-client"));
/**
 * Pastikan Anda sudah set environment variable:
 * - MIDTRANS_SERVER_KEY
 * - MIDTRANS_CLIENT_KEY
 * isProduction bisa di-set sesuai kebutuhan
 */
exports.snap = new midtrans_client_1.default.Snap({
    isProduction: false, // ubah ke true jika production
    serverKey: process.env.MIDTRANS_SERVER_KEY || '',
    clientKey: process.env.MIDTRANS_CLIENT_KEY || '',
});
