import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { tokenService } from "../helpers/createToken";
import { sendVerificationEmail } from "../services/mailer";
import { hashPass } from "../helpers/hashpassword";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export class AuthController {
  async registerCustomer(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ error: "Email address already exists" });
      }

      const newUser = await prisma.user.create({
        data: {
          email,
          role: "customer",
          verified: false,
        },
      });

      const token = tokenService.createEmailToken({
        id: newUser.user_id,
        role: newUser.role,
        email,
      });

      await sendVerificationEmail(email, token);

      return res.status(201).json({
        status: "success",
        message:
          "Registration successful. Please check your email for verification.",
        user: newUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Could Reach The Server Database" });
    }
  }
  async verifyAccount(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const {
        username,
        firstName,
        lastName,
        phone,
        password,
        confirmPassword,
      } = req.body;

      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
      }

      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user || user.verified) {
        return res.status(400).json({ error: "Invalid verification request" });
      }

      const hashedPassword = await hashPass(password);

      await prisma.user.update({
        where: { user_id: userId },
        data: {
          username,
          first_name: firstName,
          last_name: lastName,
          phone,
          password: hashedPassword,
          verified: true,
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Email verified successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Could Reach The Server Database" });
    }
  }
  
  async loginAny(req: Request, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: req.body.email },
      });

      if (!user) throw "User Not Found";

      const validPass = await bcrypt.compare(req.body.password, user.password!);
      if (!validPass) throw "Password Incorrect";

      const token = tokenService.createAccessToken({
        id: user.user_id,
        role: user.role,
      });

      return res
        .status(201)
        .send({ status: "ok", msg: "Login Success", token, user });
    } catch (error) {
      return res.status(400).json({ error: error });
    }
  }
}
