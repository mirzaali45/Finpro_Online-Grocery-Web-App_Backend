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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReverificationEmail = exports.sendResetPassEmail = exports.sendVerificationEmail = void 0;
var nodemailer_1 = __importDefault(require("nodemailer"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var handlebars_1 = __importDefault(require("handlebars"));
require("dotenv").config();
var transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    connectionTimeout: 10000,
});
var sendVerificationEmail = function (email, token) { return __awaiter(void 0, void 0, void 0, function () {
    var templatePath, source, template, html, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                templatePath = path_1.default.join(__dirname, "../templates/verify.hbs");
                source = fs_1.default.readFileSync(templatePath, "utf-8");
                template = handlebars_1.default.compile(source);
                html = template({
                    link: "".concat(process.env.BASE_URL_FE, "/verification/register/").concat(token),
                });
                return [4 /*yield*/, transporter.sendMail({
                        from: process.env.MAIL_FROM,
                        to: email,
                        subject: "Verify Youre Email Address",
                        html: html,
                        attachments: [
                            {
                                filename: "/LIT.png",
                                path: path_1.default.join(__dirname, "../../public/LIT.png"),
                                cid: "logo",
                            },
                        ],
                    })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error("Error sending verification email:", error_1);
                throw new Error("Failed to send verification email");
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.sendVerificationEmail = sendVerificationEmail;
transporter.verify(function (error) {
    if (error) {
        console.error("SMTP connection error:", error);
    }
    else {
        console.log("SMTP server is ready to send emails");
    }
});
var sendResetPassEmail = function (email, token) { return __awaiter(void 0, void 0, void 0, function () {
    var templatePath, templateSource, compiledTemplate, html, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                templatePath = path_1.default.join(__dirname, "../templates", "resetpass.hbs");
                templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                compiledTemplate = handlebars_1.default.compile(templateSource);
                html = compiledTemplate({
                    link: "".concat(process.env.BASE_URL_FE, "/verification/reset-password/").concat(token),
                });
                return [4 /*yield*/, transporter.sendMail({
                        from: process.env.MAIL_USER,
                        to: email,
                        subject: "Reset your password",
                        html: html,
                        attachments: [
                            {
                                filename: "/LIT.png",
                                path: path_1.default.join(__dirname, "../../public/LIT.png"),
                                cid: "logo",
                            },
                        ],
                    })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                throw error_2;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.sendResetPassEmail = sendResetPassEmail;
var sendReverificationEmail = function (email, token) { return __awaiter(void 0, void 0, void 0, function () {
    var templatePath, templateSource, compiledTemplate, html, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                templatePath = path_1.default.join(__dirname, "../templates", "reverification.hbs");
                templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                compiledTemplate = handlebars_1.default.compile(templateSource);
                html = compiledTemplate({
                    link: "".concat(process.env.BASE_URL_FRONTEND, "/reverify/").concat(token),
                });
                return [4 /*yield*/, transporter.sendMail({
                        from: process.env.MAIL_USER,
                        to: email,
                        subject: "Changing email address",
                        html: html,
                    })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                throw error_3;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.sendReverificationEmail = sendReverificationEmail;
