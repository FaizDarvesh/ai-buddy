import { PrismaClient } from "@prisma/client";

declare global {
    var prisma: PrismaClient | undefined; //PrismaClient or undefined
}; //prisma does not exist yet in the global object and so needs to be declared 

const prismadb = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prismadb;

export default prismadb;