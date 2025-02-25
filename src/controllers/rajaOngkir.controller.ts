import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = process.env.RAJAONGKIR_BASE_URL;

export class RajaOngkirController {
  // Ambil daftar provinsi
  async getProvinces(req: Request, res: Response) {
    try {
      const response = await axios.get(`${BASE_URL}/province`, {
        headers: { 
            key: API_KEY!,
            "Content-Type": "application/x-www-form-urlencoded",
         },
      });
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch provinces" });
    }
  }

  // Ambil daftar kota berdasarkan ID provinsi
  async getCities(req: Request, res: Response) {
    const { provinceId } = req.params;
    try {
      const response = await axios.get(`${BASE_URL}/city?province=${provinceId}`, {
        headers: { key: API_KEY!, "Accept": "application/json" },
      });
      console.log(response)
      res.json(response.data);
    } catch (error) {
    //   console.error(error);
      res.status(500).json({ error: error });
    }
  }

  // Hitung ongkir
  async calculateShippingCost(req: Request, res: Response) {
    const { origin, destination, weight, courier } = req.body;

    try {
      const response = await axios.post(
        `${BASE_URL}/cost`,
        { origin, destination, weight, courier },
        { headers: { key: API_KEY!, "Content-Type": "application/x-www-form-urlencoded" } }
      );
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to calculate shipping cost" });
    }
  }
}
