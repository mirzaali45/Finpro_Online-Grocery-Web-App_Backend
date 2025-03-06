import * as midtrans from "midtrans-client";

// Retrieve server and client keys from environment variables
const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
const clientKey = process.env.MIDTRANS_CLIENT_KEY || "";

if (!serverKey || !clientKey) {
  throw new Error("Midtrans keys are missing in environment variables");
}

// Configure Midtrans SDK
const midtransClient = new midtrans.Snap({
  isProduction: false, // Set to true for production environment
  serverKey: serverKey, // Midtrans Server Key from your environment variable
  clientKey: clientKey, // Midtrans Client Key from your environment variable
});

export default midtransClient;
