import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

export const verifyMidtransSignature = (body: any): boolean => {
  const { order_id, status_code, gross_amount, signature_key } = body;

  const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
  const expectedSignature = crypto
    .createHash("sha512")
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest("hex");

  return expectedSignature === signature_key;
};
