import { Request, Response } from "express";
import { PrismaClient } from "../../prisma/generated/client";

const prisma = new PrismaClient();

export class CartController {
  async getCart(req: Request, res: Response) {
    try {
      const cartItems = await prisma.cartItem.findMany({
        include: {
          product: {
            include: {
              ProductImage: true,
            },
          },
        },
      });

      const totalQuantity = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.quantity * item.product.price,
        0
      );

      res.json({
        items: cartItems,
        summary: {
          totalItems: cartItems.length,
          totalQuantity,
          totalPrice,
        },
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  }

  async getCartbyId(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        res.status(400).json({ message: "Invalid User ID provided" });
        return;
      }

      const cartItems = await prisma.cartItem.findMany({
        where: { user_id: userId },
        include: {
          product: {
            include: {
              ProductImage: true,
              Discount: true, // Include discount information
            },
          },
        },
      });

      if(!cartItems){
        res.status(400).json({ message: "Cart is empty!" });
        return;
      }

      const totalQuantity = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalPrice = cartItems.reduce(
        (sum, item) => sum + item.quantity * item.product.price,
        0
      );

      res.status(200).json({
        data: {
          items: cartItems,
          summary: {
            totalItems: cartItems.length,
            totalQuantity,
            totalPrice,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch cart items",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async addToCart(req: Request, res: Response): Promise<void> {
    try {
      const { productId, userId, quantity = 1 } = req.body;

      if (!productId || !userId) {
        res
          .status(400)
          .json({ message: "Product ID and User ID are required" });
        return;
      }

      const product = await prisma.product.findUnique({
        where: { product_id: productId },
      });

      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      const existingCartItem = await prisma.cartItem.findFirst({
        where: { user_id: userId, product_id: productId },
      });

      if (existingCartItem) {
        const updatedCart = await prisma.cartItem.update({
          where: { cartitem_id: existingCartItem.cartitem_id },
          data: { quantity: existingCartItem.quantity + quantity },
        });
        res.status(200).json(updatedCart);
        return;
      }

      const newCartItem = await prisma.cartItem.create({
        data: {
          user_id: userId,
          product_id: productId,
          quantity,
        },
      });

      res.status(201).json(newCartItem);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error", error });
    }
  }

  async updateCart(req: Request, res: Response): Promise<void> {
    try {
      const { cartItemId, quantity } = req.body;

      const updatedCartItem = await prisma.cartItem.update({
        where: { cartitem_id: cartItemId },
        data: { quantity },
        include: {
          product: true,
        },
      });

      res.status(200).json(updatedCartItem);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async removeFromCart(req: Request, res: Response) {
    try {
      const { cartItemId } = req.params;

      await prisma.cartItem.delete({
        where: { cartitem_id: Number(cartItemId) },
      });

      res.status(200).json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
