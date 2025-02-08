import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { tokenService } from "../helpers/createToken";
import { sendResetPassEmail, sendVerificationEmail } from "../services/mailer";
import { hashPass } from "../helpers/hashpassword";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const JWT_SECRET = process.env.SECRET_KEY || "osdjfksdhfishd"; 

const prisma = new PrismaClient();

export class AuthController {
  async googleRegister(req: Request, res: Response) {
    try {
      const { email, name, picture } = req.body;

      if (!email) return res.status(400).json({ error: "Email tidak ditemukan" });

      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Buat user baru jika belum ada
        user = await prisma.user.create({
          data: { email, role: "customer", username: name, avatar: picture, verified: true },
        });
      }

      const token = tokenService.createLoginToken({
        id: user.user_id,
        role: user.role
      });

      // await sendVerificationEmail(email, token);

      return res.status(201).json({
        status: "success",
        token: token,
        message:
          "Login google successfully.",
        user: user,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Could Reach The Server Database" });
    }
  }

  async registerCustomer(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email address already exists" });
      }

      // const token = tokenService.createEmailToken({ id: 0, role: "customer", email });

      const newUser = await prisma.user.create({
        data: {
          email,
          role: "customer",
          verified: false,
        },
      });

      const token = tokenService.createEmailRegisterToken({
        id: newUser.user_id,
        role: newUser.role,
        email,
      });

      await prisma.user.update({
        where: { user_id: newUser.user_id },
        data: { verify_token: token }
      })

      await sendVerificationEmail(email, token);

      return res.status(201).json({
        status: "success",
        token: token,
        message:
          "Registration successful. Please check your email for verification.",
        user: newUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Could Reach The Server Database" });
    }
  }

  async registerStoreAdmin(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ message: "Email address already exists" });
      }

      // const token = tokenService.createEmailToken({ id: 0, role: "customer", email });

      const newUser = await prisma.user.create({
        data: {
          email,
          role: "store_admin",
          verified: false,
        },
      });

      const token = tokenService.createEmailToken({
        id: newUser.user_id,
        role: newUser.role,
        email,
      });

      await prisma.user.update({
        where: { user_id: newUser.user_id },
        data: { verify_token: token }
      })

      await sendVerificationEmail(email, token);

      return res.status(201).json({
        status: "success",
        token: token,
        message:
          "Registration successful. Please check your email for verification.",
        user: newUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Could Reach The Server Database" });
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
        return res.status(400).json({ message: "Passwords do not match" });
      }

      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user || user.verified) {
        return res.status(400).json({ message: "Invalid verification request" });
      }

      const hashedPassword = await hashPass(password);

      await prisma.user.update({
        where: { user_id: userId },
        data: {
          username,
          first_name: firstName ? firstName : null,
          last_name: lastName ? lastName : null,
          phone,
          password: hashedPassword,
          verified: true,
          verify_token: null
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Email verified successfully",
        role: user.role
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Could Reach The Server Database" });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const isNewbie = await prisma.user.findFirst({
        where: { email, password: null }
      })

      if (isNewbie) {
        return res.status(403).json({
          status: "error",
          token: "",
          message:
          "The email is have no password, Please choose antoher account.",
        });
      }

      const findUser = await prisma.user.findFirst({
        where: { email, role: "customer" },
        select: {
          user_id: true,
          email: true,
          avatar: true,
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

      if (!findUser) {
        return res.status(403).json({
          status: "error",
          token: "",
          message:
          "User not found.",
        });
      }

      const token = tokenService.createResetToken({
        id: findUser.user_id,
        role: findUser.role,
        resetPassword: findUser.role,
      });
      
      await prisma.user.update({
        where: { user_id: findUser?.user_id },
        data: { password_reset_token: token }
      })
      
      await sendResetPassEmail(email, token);
      
      return res.status(201).json({
        status: "success",
        token: token,
        message:
        "Reset Password Link send successfully. Please check your email for verification.",
        user: findUser,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Could Reach The Server Database" });
    }
  }

  async verifyResetPassword(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { oldPassword, password, confirmPassword } = req.body;
      // Validasi kesesuaian password baru
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      
      if (!oldPassword || !password) {
        return res.status(400).json({ message: "Both old and new passwords are required" });
      }
      
      const userId = req.user.id;
      
      // Cari pengguna berdasarkan ID
      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid Reset password request" });
      }

      // Bandingkan password yang belum di-hash dengan password yang sudah di-hash
      const isPasswordMatch = await bcrypt.compare(oldPassword, user.password!);

      if (!isPasswordMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      console.log(user)

      // Hash dan simpan password baru
      const hashedPassword = await hashPass(password);

      await prisma.user.update({
        where: { user_id: userId },
        data: {
          password: hashedPassword,
          verify_token: null,
          password_reset_token: null
        },
      });

      return res.status(200).json({
        status: "success",
        message: "Password Reset successfully",
        role: user.role
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Could Reach The Server Database" });
    }
  }

  async loginAny(req: Request, res: Response) {
    // validation
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    try {
      const user = await prisma.user.findUnique({
        where: { email: req.body.email },
      });
      
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      
      const validPass = await bcrypt.compare(req.body.password, user.password!);
      if (!validPass) {
        return res.status(400).json({ message: "Password incorrect!" });
      }
      const token = tokenService.createLoginToken({
        id: user.user_id,
        role: user.role,
      });

      return res
        .status(201)
        .send({ status: "ok", msg: "Login Success", token, user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }    
  }
  
  async checkExpTokenEmailVerif(req: Request, res: Response) {
    const { token } = req.params;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      // Verifikasi token
      const decoded: any = jwt.verify(token, JWT_SECRET);
      
      // Cek apakah token sudah lebih dari 1 jam sejak dibuat
      const tokenAge = Math.floor(Date.now() / 1000) - decoded.iat; // Selisih waktu dalam detik
      if (tokenAge > 3600) { // 1 jam = 3600 detik
        return res.status(409).json({ status: "no", message: "Token Expired" });
      }

      return res.status(200).json({ status: "ok", message: "Token Active" });

    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: "Invalid or expired token" });
    }
  };
}
