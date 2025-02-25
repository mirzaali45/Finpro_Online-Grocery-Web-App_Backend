declare module "multer-storage-cloudinary" {
  import { StorageEngine } from "multer";
  import { v2 as cloudinary } from "cloudinary";
  import { Request } from "express";
  import { ParamsDictionary } from "express-serve-static-core";
  import { ParsedQs } from "qs";

  export interface CloudinaryStorageOptions {
    cloudinary: typeof cloudinary;
    params: {
      folder?: string;
      format?: string;
      allowed_formats?: string[];
      transformation?: Array<{
        width?: number;
        height?: number;
        crop?: string;
        gravity?: string;
      }>;
    };
  }

  export class CloudinaryStorage implements StorageEngine {
    constructor(opts: CloudinaryStorageOptions);

    _handleFile(
      req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
      file: Express.Multer.File,
      callback: (error?: any, info?: Partial<Express.Multer.File>) => void
    ): void;

    _removeFile(
      req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
      file: Express.Multer.File,
      callback: (error: Error | null) => void
    ): void;

    handleFile(
      req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
      file: Express.Multer.File,
      callback: (error?: any, info?: Partial<Express.Multer.File>) => void
    ): void;

    removeFile(
      req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
      file: Express.Multer.File,
      callback: (error: Error | null) => void
    ): void;
  }
}
