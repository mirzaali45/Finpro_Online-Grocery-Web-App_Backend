import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { hashPass } from "../helpers/hashpassword";

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
          avatar: true,
          username: true,
          password: true,
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

  async setPassAuthGoogle(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const {
        password,
        confirmPassword
      } = req.body;

      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      const hashedPassword = await hashPass(password);

      const setPass = await prisma.user.update({
        where: { user_id: req.user.id },
        data: {
          password: hashedPassword,
        }
      })

      if (!setPass) {
        return res.status(404).json({ error: "Customer not found" });
      }

      return res.status(200).json({
        status: "success",
        data: setPass,
        message: "Success update profile data"
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Could not fetch customer data" });
    }
  }

  async updateCustomerData(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const {
        firstName,
        lastName,
        email,
        phone,
      } = req.body;

      const updateCust = await prisma.user.update({
        where: { user_id: req.user.id },
        data: {
          first_name: firstName,
          last_name: lastName,
          email,
          phone
        }
      })

      if (!updateCust) {
        return res.status(404).json({ error: "Customer not found" });
      }

      return res.status(200).json({
        status: "success",
        data: updateCust,
        message: "Success update profile data"
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Could not fetch customer data" });
    }
  }

  async updateAvatarCustomerData(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const {
        avatar,
      } = req.body;

      const updateCust = await prisma.user.update({
        where: { user_id: req.user.id },
        data: {
          avatar,
        }
      })

      if (!updateCust) {
        return res.status(404).json({ error: "Customer not found" });
      }

      return res.status(200).json({
        status: "success",
        data: updateCust,
        message: "Success update avatar profile"
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Could not fetch customer data" });
    }
  }
}
