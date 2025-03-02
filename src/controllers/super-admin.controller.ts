import { PrismaClient } from "../../prisma/generated/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { generateReferralCode } from "../helpers/reffcode";

const prisma = new PrismaClient();

export class SuperAdminController {
  async createUser(req: Request, res: Response) {
    try {
      const { email, password, role, username, firstName, lastName, phone } =
        req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
          username,
          first_name: firstName,
          last_name: lastName,
          phone,
          verified: true,
          referral_code: role === "customer" ? generateReferralCode(8) : null,
        },
      });

      return res.status(201).json({
        status: "success",
        message: "User created successfully",
        data: newUser,
      });
    } catch (error) {
      return res.status(500).json({ error: "Could not create user" });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const totalUsers = await prisma.user.count();
      const users = await prisma.user.findMany({
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
        skip,
        take: limit,
      });
  
      // Calculate pagination metadata
      const totalPages = Math.ceil(totalUsers / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
  
      return res.status(200).json({
        status: "success",
        data: users,
        pagination: {
          total: totalUsers,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Could not fetch users" });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { user_id: parseInt(req.params.id) },
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
          Store: true,
          orders: true,
          Address: true,
        },
      });
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.status(200).json({ status: "success", data: user });
    } catch (error) {
      return res.status(500).json({ error: "Could not fetch user" });
    }
  }

  async updateUserRole(req: Request, res: Response) {
    try {
      const { role } = req.body;
      const user = await prisma.user.update({
        where: { user_id: parseInt(req.params.id) },
        data: { role },
      });
      return res.status(200).json({ status: "success", data: user });
    } catch (error) {
      return res.status(500).json({ error: "Could not update user role" });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      await prisma.user.delete({
        where: { user_id: parseInt(req.params.id) },
      });
      return res
        .status(200)
        .json({ status: "success", message: "User deleted successfully" });
    } catch (error) {
      return res.status(500).json({ error: "Could not delete user" });
    }
  }
}
