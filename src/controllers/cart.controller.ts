import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class CartController {
  // Ambil semua item di cart
  async getCart(req: Request, res: Response) {
    try {
      const cartItems = await prisma.cartItem.findMany({
        include: { product: { include: { ProductImage: true } } },
      });
      res.json(cartItems);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  }

  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      console.log("Request Body:", req.body); // Debug request body

      const { productId, userId, quantity } = req.body;

      if (!productId || !userId) {
        res
          .status(400)
          .json({ message: "Product ID and User ID are required" });
        return;
      }

      // Cek apakah produk ada
      const product = await prisma.product.findUnique({
        where: { product_id: productId },
      });

      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      // Cek apakah produk sudah ada di cart
      const existingCartItem = await prisma.cartItem.findFirst({
        where: { user_id: userId, product_id: productId },
      });

      if (existingCartItem) {
        // Jika sudah ada, update quantity
        const updatedCart = await prisma.cartItem.update({
          where: { cartitem_id: existingCartItem.cartitem_id },
          data: { quantity: existingCartItem.quantity + quantity },
        });
        res.status(200).json(updatedCart);
        return;
      }

      const parsedQuantity = Number(quantity);

      if (!productId || isNaN(parsedQuantity) || parsedQuantity <= 0) {
        res.status(400).json({ message: "Data tidak valid" });
        return
      }

      // Jika belum ada, tambahkan item baru ke cart
      const newCartItem = await prisma.cartItem.create({
        data: {
          user_id: userId,
          product_id: productId,
          quantity: parsedQuantity,
        },
      });

      res.status(201).json(newCartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Internal Server Error", error });
    }
  }

  // async addToCart(req: Request, res: Response): Promise<void> {
  //   try {
  //     console.log("Request Body:", req.body);

  //     const { productId, userId } = req.body; // Pastikan `userId` dikirim dari frontend

  //     if (!productId) {
  //       res.status(400).json({ message: "Product ID is required" });
  //       return;
  //     }

  //     // Cari produk berdasarkan ID
  //     const product = await prisma.product.findUnique({
  //       where: { product_id: productId },
  //     });

  //     if (!product) {
  //       res.status(404).json({ message: "Product not found" });
  //       return;
  //     }

  //     // Gunakan userId yang valid
  //     const validUserId = userId || 1; // Gantilah dengan sistem auth

  //     // Tambahkan produk ke cart
  //     const cartItem = await prisma.cartItem.create({
  //       data: {
  //         user_id: validUserId, // ✅ Pastikan user_id ada
  //         product_id: productId,
  //         quantity: 1, // ✅ Pastikan quantity memiliki angka yang benar
  //       },
  //     });

  //     res.json(cartItem);
  //     return;
  //   } catch (error) {
  //     console.error("Error adding to cart:", error);
  //     res.status(500).json({ message: "Error adding to cart", error });
  //   }
  // }
  async updateCart(req: Request, res: Response): Promise<void> {
    try {
      const { cartItemId, quantity } = req.body;

      const existingCartItem = await prisma.cartItem.findUnique({
        where: { cartitem_id: cartItemId },
      });

      if (!existingCartItem) {
        res.status(404).json({ message: "Cart item not found" });
        return;
      }

      const updatedCartItem = await prisma.cartItem.update({
        where: { cartitem_id: cartItemId },
        data: { quantity },
      });

      // Hitung total quantity keseluruhan di cart
      const totalQuantity = await prisma.cartItem.aggregate({
        where: { user_id: existingCartItem.user_id },
        _sum: { quantity: true },
      });

      res
        .status(200)
        .json({
          updatedCartItem,
          totalQuantity: totalQuantity._sum.quantity || 0,
        });
    } catch (error) {
      console.error("Error updating cart:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  // Hapus item dari cart
  async removeFromCart(req: Request, res: Response) {
    try {
      const { cartItemId } = req.params;

      await prisma.cartItem.delete({
        where: { cartitem_id: Number(cartItemId) },
      });

      res.status(200).json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing item:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
