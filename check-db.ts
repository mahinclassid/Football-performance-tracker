import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSeasons() {
    try {
        const seasons = await prisma.season.findMany();
        console.log('Seasons in database:', JSON.stringify(seasons, null, 2));

        const currentSeason = await prisma.season.findFirst({
            where: { isCurrent: true },
        });
        console.log('Current season:', JSON.stringify(currentSeason, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSeasons();
