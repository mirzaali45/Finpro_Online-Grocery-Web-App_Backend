import { PrismaClient } from "../prisma/generated/client";

export default new PrismaClient({ log: ["query", "error", "info", "warn"] });
