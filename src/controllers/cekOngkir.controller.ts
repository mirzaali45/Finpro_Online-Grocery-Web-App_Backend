import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BINDER_API_KEY = process.env.BINDERBYTE_API_KEY;

export class CekOngkirController {
  // handle router api cek ongkir
  async getAll(req: Request, res: Response) {
    const { origin, destination, weight, couriers } = req.body;
    const apiKey = BINDER_API_KEY; // api key binder ada di env

    try {
        // coba fetch api binder untuk mendapatkan suatu cek ongkir
        const response = await fetch(
            `https://api.binderbyte.com/v1/cost?api_key=${apiKey}&courier=${couriers}&origin=${origin}&destination=${destination}&weight=${weight}`
        );

        const data = await response.json();

        // jika gagal atau data kosong kembalikan error dengan status 400 / not found
        if (!data) {    
            return res.status(400).json({ status: 400, error: "gagal fetch : " + data.message });
        }

        // jika data ada maka kembalikan data tersebut ke frontend 
        res.json(data);
    } catch (error) {
        // handle error
        res.status(500).json({ status: 500, error: error });
    }
  }
}
