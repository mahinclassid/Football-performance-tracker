'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    // Get total goals, assists, minutes
    const totals = await prisma.playerMatchStat.aggregate({
      _sum: {
        goals: true,
        assists: true,
        minutes: true,
      },
    });

    // Get top scorers
    const topScorers = await prisma.playerMatchStat.groupBy({
      by: ['playerId'],
      _sum: {
        goals: true,
      },
      orderBy: {
        _sum: {
          goals: 'desc',
        },
      },
      take: 3,
    });

    const topScorerIds = topScorers.map((s) => s.playerId);
    const topScorerPlayers = await prisma.player.findMany({
      where: {
        id: { in: topScorerIds },
      },
    });

    const topScorersWithNames = topScorers.map((scorer) => {
      const player = topScorerPlayers.find((p) => p.id === scorer.playerId);
      return {
        playerId: scorer.playerId,
        goals: scorer._sum.goals || 0,
        playerName: player ? `${player.firstName} ${player.lastName}` : 'Unknown',
      };
    });

    // Get recent matches
    const recentMatches = await prisma.match.findMany({
      take: 5,
      orderBy: {
        date: 'desc',
      },
    });

    // Get match count
    const matchCount = await prisma.match.count();

    return {
      totalGoals: totals._sum.goals || 0,
      totalAssists: totals._sum.assists || 0,
      totalMinutes: totals._sum.minutes || 0,
      topScorers: topScorersWithNames,
      recentMatches,
      matchCount,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return null;
  }
}

export async function getPlayerStats(playerId: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    const stats = await prisma.playerMatchStat.findMany({
      where: { playerId },
      include: {
        match: true,
      },
      orderBy: {
        match: {
          date: 'desc',
        },
      },
    });

    const totals = stats.reduce(
      (acc, stat) => ({
        matches: acc.matches + 1,
        goals: acc.goals + stat.goals,
        assists: acc.assists + stat.assists,
        minutes: acc.minutes + stat.minutes,
        yellow: acc.yellow + stat.yellow,
        red: acc.red + stat.red,
      }),
      { matches: 0, goals: 0, assists: 0, minutes: 0, yellow: 0, red: 0 }
    );

    return {
      stats,
      totals,
    };
  } catch (error) {
    return null;
  }
}

export async function getReportData(filters?: {
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    const whereClause: any = {};
    if (filters?.startDate || filters?.endDate) {
      whereClause.match = {};
      if (filters.startDate) {
        whereClause.match.date = { gte: filters.startDate };
      }
      if (filters.endDate) {
        whereClause.match.date = {
          ...whereClause.match.date,
          lte: filters.endDate,
        };
      }
    }

    // Get player aggregates
    const playerStats = await prisma.playerMatchStat.groupBy({
      by: ['playerId'],
      where: whereClause,
      _sum: {
        goals: true,
        assists: true,
        minutes: true,
        yellow: true,
        red: true,
      },
      _count: {
        id: true,
      },
    });

    const playerIds = playerStats.map((s) => s.playerId);
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds } },
    });

    const reportData = playerStats.map((stat) => {
      const player = players.find((p) => p.id === stat.playerId);
      return {
        playerId: stat.playerId,
        playerName: player ? `${player.firstName} ${player.lastName}` : 'Unknown',
        position: player?.position || 'FW',
        matches: stat._count.id,
        goals: stat._sum.goals || 0,
        assists: stat._sum.assists || 0,
        minutes: stat._sum.minutes || 0,
        yellow: stat._sum.yellow || 0,
        red: stat._sum.red || 0,
      };
    });

    return reportData.sort((a, b) => b.goals - a.goals);
  } catch (error) {
    console.error('Error fetching report data:', error);
    return null;
  }
}




