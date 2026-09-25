require("dotenv").config();

const prisma = require("../src/config/db");
const { hashPassword } = require("../src/utils/password");

async function main() {
    const passwordHash = await hashPassword("Admin@123");

    const user = await prisma.user.upsert({
        where: {
            email: "tpo@college.edu"
        },
        update: {},
        create: {
            email: "tpo@college.edu",
            passwordHash,
            role: "TPO",
            status: "ACTIVE",
            mustChangePassword: false
        }
    });

    console.log("TPO user created:", user.email);
}

main()
    .catch((err) => {
        console.error(err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });