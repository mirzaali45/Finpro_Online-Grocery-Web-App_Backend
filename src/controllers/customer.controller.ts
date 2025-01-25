import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export class CustomerController {
  async getCustomerData(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const customer = await prisma.user.findFirst({
        where: {
          user_id: req.user.id,
          role: "customer",
        },
        select: {
          user_id: true,
          email: true,
          username: true,
          first_name: true,
          last_name: true,
          phone: true,
          role: true,
          verified: true,
          created_at: true,
          updated_at: true,
        },
      });

      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }

      return res.status(200).json({
        status: "success",
        data: customer,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Could not fetch customer data" });
    }
  }
}
