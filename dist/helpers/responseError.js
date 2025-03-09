"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseError = void 0;
const responseError = (res, err) => {
    return res.status(400).send({
        status: "error",
        msg: err,
    });
};
exports.responseError = responseError;
