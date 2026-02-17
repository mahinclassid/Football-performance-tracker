import { PrismaClient, Role, Position, PlayerStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const adminPassword = await bcrypt.hash('Coach@123!', 10);
  const staffPassword = await bcrypt.hash('Staff@123!', 10);

  // Create users
  const admin = await prisma.user.upsert({
    where: { email: 'coach@club.local' },
    update: {},
    create: {
      name: 'Head Coach',
      email: 'coach@club.local',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@club.local' },
    update: {},
    create: {
      name: 'Assistant Coach',
      email: 'staff@club.local',
      password: staffPassword,
      role: Role.STAFF,
    },
  });

  console.log('Created users:', { admin: admin.email, staff: staff.email });

  // Create club if it doesn't exist
  await prisma.club.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'My Football Club',
      country: 'Bahrain',
      manager: 'Head Coach',
      stadium: 'My Stadium',
      league: 'National League',
      location: 'Manama',
    },
  });

  console.log('Created club');

  // Create seasons
  const season2425 = await prisma.season.upsert({
    where: { name: '24-25' },
    update: {},
    create: {
      name: '24-25',
      isActive: false,
      isCurrent: false,
    },
  });

  const season2526 = await prisma.season.upsert({
    where: { name: '25-26' },
    update: {},
    create: {
      name: '25-26',
      isActive: true,
      isCurrent: true,
    },
  });

  console.log('Created seasons:', { season2425: season2425.name, season2526: season2526.name });
  const players = [
    { firstName: 'John', lastName: 'Smith', position: Position.GK, shirtNo: 1, heightCm: 190, weightKg: 85, dob: new Date('1995-05-15') },
    { firstName: 'Mike', lastName: 'Johnson', position: Position.DF, shirtNo: 2, heightCm: 185, weightKg: 80, dob: new Date('1993-08-20') },
    { firstName: 'David', lastName: 'Williams', position: Position.DF, shirtNo: 3, heightCm: 188, weightKg: 82, dob: new Date('1994-02-10') },
    { firstName: 'James', lastName: 'Brown', position: Position.DF, shirtNo: 4, heightCm: 183, weightKg: 78, dob: new Date('1996-11-05') },
    { firstName: 'Robert', lastName: 'Jones', position: Position.DF, shirtNo: 5, heightCm: 186, weightKg: 81, dob: new Date('1992-07-18') },
    { firstName: 'William', lastName: 'Garcia', position: Position.MF, shirtNo: 6, heightCm: 178, weightKg: 75, dob: new Date('1995-03-22') },
    { firstName: 'Richard', lastName: 'Miller', position: Position.MF, shirtNo: 8, heightCm: 180, weightKg: 77, dob: new Date('1994-09-14') },
    { firstName: 'Joseph', lastName: 'Davis', position: Position.MF, shirtNo: 10, heightCm: 175, weightKg: 73, dob: new Date('1996-01-30') },
    { firstName: 'Thomas', lastName: 'Rodriguez', position: Position.MF, shirtNo: 11, heightCm: 177, weightKg: 74, dob: new Date('1993-12-08') },
    { firstName: 'Charles', lastName: 'Martinez', position: Position.FW, shirtNo: 7, heightCm: 182, weightKg: 79, dob: new Date('1995-06-25') },
    { firstName: 'Daniel', lastName: 'Hernandez', position: Position.FW, shirtNo: 9, heightCm: 184, weightKg: 80, dob: new Date('1994-04-12') },
    { firstName: 'Matthew', lastName: 'Lopez', position: Position.FW, shirtNo: 14, heightCm: 179, weightKg: 76, dob: new Date('1996-10-03') },
  ];

  // Clear existing players and matches for clean seed
  await prisma.playerMatchStat.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();

  const createdPlayers = [];
  for (const playerData of players) {
    const player = await prisma.player.create({
      data: playerData,
    });
    createdPlayers.push(player);
  }

  console.log(`Created ${createdPlayers.length} players`);

  // Create matches
  const match1 = await prisma.match.create({
    data: {
      opponent: 'City FC',
      date: new Date('2024-01-15'),
      venue: 'Home',
      result: '2-1',
      seasonId: season2526.id,
    },
  });

  const match2 = await prisma.match.create({
    data: {
      opponent: 'United FC',
      date: new Date('2024-01-22'),
      venue: 'Away',
      result: '1-3',
      seasonId: season2526.id,
    },
  });

  const match3 = await prisma.match.create({
    data: {
      opponent: 'Arsenal FC',
      date: new Date('2024-02-01'),
      venue: 'Home',
      result: '3-0',
      seasonId: season2526.id,
    },
  });

  console.log('Created 3 matches');

  // Create sample stats for match 1
  await prisma.playerMatchStat.createMany({
    data: [
      { playerId: createdPlayers[0].id, matchId: match1.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[1].id, matchId: match1.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 0, yellow: 1, red: 0 },
      { playerId: createdPlayers[2].id, matchId: match1.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[5].id, matchId: match1.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 1, yellow: 0, red: 0 },
      { playerId: createdPlayers[6].id, matchId: match1.id, seasonId: season2526.id, minutes: 85, goals: 0, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[7].id, matchId: match1.id, seasonId: season2526.id, minutes: 90, goals: 1, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[9].id, matchId: match1.id, seasonId: season2526.id, minutes: 90, goals: 1, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[10].id, matchId: match1.id, seasonId: season2526.id, minutes: 75, goals: 0, assists: 1, yellow: 0, red: 0 },
    ],
  });

  // Create sample stats for match 2
  await prisma.playerMatchStat.createMany({
    data: [
      { playerId: createdPlayers[0].id, matchId: match2.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[1].id, matchId: match2.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[3].id, matchId: match2.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 0, yellow: 1, red: 0 },
      { playerId: createdPlayers[5].id, matchId: match2.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[7].id, matchId: match2.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 1, yellow: 0, red: 0 },
      { playerId: createdPlayers[8].id, matchId: match2.id, seasonId: season2526.id, minutes: 70, goals: 0, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[9].id, matchId: match2.id, seasonId: season2526.id, minutes: 90, goals: 1, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[11].id, matchId: match2.id, seasonId: season2526.id, minutes: 20, goals: 0, assists: 0, yellow: 0, red: 0 },
    ],
  });

  // Create sample stats for match 3
  await prisma.playerMatchStat.createMany({
    data: [
      { playerId: createdPlayers[0].id, matchId: match3.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[2].id, matchId: match3.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[4].id, matchId: match3.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[5].id, matchId: match3.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 2, yellow: 0, red: 0 },
      { playerId: createdPlayers[6].id, matchId: match3.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[7].id, matchId: match3.id, seasonId: season2526.id, minutes: 90, goals: 2, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[9].id, matchId: match3.id, seasonId: season2526.id, minutes: 90, goals: 1, assists: 0, yellow: 0, red: 0 },
      { playerId: createdPlayers[10].id, matchId: match3.id, seasonId: season2526.id, minutes: 90, goals: 0, assists: 1, yellow: 0, red: 0 },
    ],
  });

  console.log('Created sample statistics');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

