import { Response } from "express";

export const responseError = (res: Response, err: string | any) => {
  return res.status(400).send({
    status: "error",
    msg: err,
  });
};
