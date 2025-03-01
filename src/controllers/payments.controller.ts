import { Request, Response } from "express";
import { PrismaClient, OrderStatus } from "@prisma/client";
import { snap } from "../utils/midtrans"; // Impor snap dari config
import { responseError } from "../helpers/responseError"; // Use your custom responseError

const prisma = new PrismaClient();

export class PaymentsController {
  async createSnapToken(req: Request, res: Response): Promise<void> {
    try {
      const { order_id } = req.body;

      const order = await prisma.order.findUnique({
        where: { order_id: Number(order_id) },
        include: {
          OrderItem: {
            include: {
              product: true, // Mengambil relasi product untuk setiap OrderItem
            },
          },
          user: true, // Mengambil data user yang terkait
        },
      });

      if (!order) {
        responseError(res, "Order tidak ditemukan");
        return;
      }

      const transactionDetails = {
        order_id: `order-${order.order_id}`,
        gross_amount: order.total_price,
      };

      const customerDetails = {
        first_name: order.user?.first_name || "NoName",
        email: order.user?.email || "noemail@example.com",
        phone: order.user?.phone || "000000000",
      };

      const itemDetails = order.OrderItem.map((item) => ({
        id: `product-${item.product_id}`,
        price: item.price,
        quantity: item.qty,
        name: item.product.name,
      }));

      const parameters = {
        transaction_details: transactionDetails,
        item_details: itemDetails,
        customer_details: customerDetails,
      };

      const transaction = await snap.createTransaction(parameters);

      res.status(200).json({
        token: transaction.token,
        redirect_url: transaction.redirect_url,
      });
    } catch (error: any) {
      console.error("createSnapToken error:", error);
      responseError(res, error.message); // Using the responseError with only two arguments
      return;
    }
  }

  async midtransNotification(req: Request, res: Response): Promise<void> {
    try {
      const notification = req.body;

      if (!notification.order_id) {
        responseError(res, "No order_id in payload.");
        return;
      }

      const orderIdFromMidtrans = notification.order_id;
      const orderId = orderIdFromMidtrans.includes("-")
        ? Number(orderIdFromMidtrans.split("-")[1])
        : Number(orderIdFromMidtrans);

      const order = await prisma.order.findUnique({
        where: { order_id: orderId },
      });

      if (!order) {
        responseError(res, "Order not found.");
        return;
      }

      const transactionStatus = notification.transaction_status;
      const fraudStatus = notification.fraud_status;

      let newStatus: OrderStatus | undefined;

      if (transactionStatus === "capture") {
        if (fraudStatus === "challenge") {
          newStatus = OrderStatus.awaiting_payment;
        } else if (fraudStatus === "accept") {
          newStatus = OrderStatus.processing;
        }
      } else if (transactionStatus === "settlement") {
        newStatus = OrderStatus.processing;
      } else if (
        transactionStatus === "cancel" ||
        transactionStatus === "deny" ||
        transactionStatus === "expire"
      ) {
        newStatus = OrderStatus.cancelled;
      } else if (transactionStatus === "pending") {
        newStatus = OrderStatus.awaiting_payment;
      }

      if (newStatus && newStatus !== order.order_status) {
        await prisma.order.update({
          where: { order_id: orderId },
          data: { order_status: newStatus },
        });
      }

      res.status(200).json({ message: "Notification received successfully" });
    } catch (error: any) {
      console.error("midtransNotification error:", error);
      responseError(res, error.message); // Using the responseError with only two arguments
      return;
    }
  }
}
