const prisma = require("./db");

async function test() {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");
    } catch (err) {
        console.error("Database connection failed");
        console.error(err.message);
    } finally {
        await prisma.$disconnect();
    }
}

test();