const { PrismaClient } = require("@prisma/client"); //node file so not using import

const db = new PrismaClient();

async function main() {
    try {
        await db.category.createMany({
            data: [
                { name: "World leaders" },
                { name: "Historical figures" },
                { name: "Sports stars" },
                { name: "Professional mentors" },
                { name: "Social media influencers" },
                { name: "Fictional characters" },
            ]
        })
    } catch (error) {
        console.error("Error seeding default categories", error);
    } finally {
        await db.$disconnect()
    }
}

main ();

//Prisma studio is at http://localhost:5555/