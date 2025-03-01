"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReverificationEmail = exports.sendResetPassEmail = exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const handlebars_1 = __importDefault(require("handlebars"));
require("dotenv").config();
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    connectionTimeout: 10000,
});
const sendVerificationEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templatePath = path_1.default.join(__dirname, "../templates/verify.hbs");
        const source = fs_1.default.readFileSync(templatePath, "utf-8");
        const template = handlebars_1.default.compile(source);
        const html = template({
            link: `${process.env.BASE_URL_FE}/verification/register/${token}`,
        });
        yield transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: email,
            subject: "Verify Youre Email Address",
            html,
            attachments: [
                {
                    filename: "/LIT.png",
                    path: path_1.default.join(__dirname, "../../public/LIT.png"),
                    cid: "logo",
                },
            ],
        });
    }
    catch (error) {
        console.error("Error sending verification email:", error);
        throw new Error("Failed to send verification email");
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
transporter.verify((error) => {
    if (error) {
        console.error("SMTP connection error:", error);
    }
    else {
        console.log("SMTP server is ready to send emails");
    }
});
const sendResetPassEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templatePath = path_1.default.join(__dirname, "../templates", "resetpass.hbs");
        const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
        const compiledTemplate = handlebars_1.default.compile(templateSource);
        const html = compiledTemplate({
            link: `${process.env.BASE_URL_FE}/verification/reset-password/${token}`,
        });
        yield transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: "Reset your password",
            html,
            attachments: [
                {
                    filename: "/LIT.png",
                    path: path_1.default.join(__dirname, "../../public/LIT.png"),
                    cid: "logo",
                },
            ],
        });
    }
    catch (error) {
        throw error;
    }
});
exports.sendResetPassEmail = sendResetPassEmail;
const sendReverificationEmail = (email, token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const templatePath = path_1.default.join(__dirname, "../templates", "reverification.hbs");
        const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
        const compiledTemplate = handlebars_1.default.compile(templateSource);
        const html = compiledTemplate({
            link: `${process.env.BASE_URL_FRONTEND}/reverify/${token}`,
        });
        yield transporter.sendMail({
            from: process.env.MAIL_USER,
            to: email,
            subject: "Changing email address",
            html,
        });
    }
    catch (error) {
        throw error;
    }
});
exports.sendReverificationEmail = sendReverificationEmail;
