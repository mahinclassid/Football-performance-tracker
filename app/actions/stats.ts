'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function getDashboardStats(seasonName?: string) {
  try {
    const session = await auth();
    if (!session?.user) {
      return null;
    }

    // Get season filter
    let seasonId: number | null = null;
    if (seasonName) {
      const season = await prisma.season.findUnique({
        where: { name: seasonName },
      });
      if (!season) {
        // Requested season doesn't exist, return empty stats
        return {
          totalGoals: 0,
          totalAssists: 0,
          totalGoalsConceded: 0,
          totalPlayers: 0,
          topScorers: [],
          recentMatches: [],
          matchCount: 0,
          goalsOverTime: [],
          topScorersComparison: [],
          matchPerformance: [],
        };
      }
      seasonId = season.id;
    } else {
      // Default to current season
      const currentSeason = await prisma.season.findFirst({
        where: { isCurrent: true },
      });

      if (!currentSeason) {
        // No current season defined, return empty stats
        return {
          totalGoals: 0,
          totalAssists: 0,
          totalGoalsConceded: 0,
          totalPlayers: 0,
          topScorers: [],
          recentMatches: [],
          matchCount: 0,
          goalsOverTime: [],
          topScorersComparison: [],
          matchPerformance: [],
        };
      }
      seasonId = currentSeason.id;
    }

    const seasonWhere = { seasonId };

    // Get total goals and assists
    const totals = await prisma.playerMatchStat.aggregate({
      _sum: {
        goals: true,
        assists: true,
      },
      where: seasonWhere,
    });

    // Get total unique players
    const totalPlayersResult = await prisma.playerMatchStat.findMany({
      distinct: ['playerId'],
      select: { playerId: true },
      where: seasonWhere,
    });
    const totalPlayers = totalPlayersResult.length;

    // Get all matches to calculate totalGoalsConceded from match results
    const matchesForGoalsConceded = await prisma.match.findMany({
      where: seasonWhere,
    });

    // Calculate total goals conceded from match results (format: "X-Y" where Y is opponent goals)
    let totalGoalsConceded = 0;
    matchesForGoalsConceded.forEach((match) => {
      if (match.result) {
        const matchResult = match.result.match(/^(\d+)-(\d+)$/);
        if (matchResult) {
          totalGoalsConceded += parseInt(matchResult[2], 10);
        }
      }
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
      where: seasonWhere,
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
      where: seasonWhere,
    });

    // Get match count
    const matchCount = await prisma.match.count({
      where: seasonWhere,
    });

    // Get all matches with stats for time-series data
    const allMatches = await prisma.match.findMany({
      include: {
        stats: true,
      },
      orderBy: {
        date: 'asc',
      },
      where: seasonWhere,
    });

    // Prepare goals over time data (cumulative)
    let cumulativeGoals = 0;
    const goalsOverTime = allMatches.map((match) => {
      const matchGoals = match.stats.reduce((sum, stat) => sum + stat.goals, 0);
      cumulativeGoals += matchGoals;
      return {
        date: match.date.toISOString().split('T')[0],
        goals: matchGoals,
        cumulativeGoals,
        opponent: match.opponent,
      };
    });

    // Get top scorers with assists for comparison
    const topScorersWithAssists = await prisma.playerMatchStat.groupBy({
      by: ['playerId'],
      _sum: {
        goals: true,
        assists: true,
      },
      orderBy: {
        _sum: {
          goals: 'desc',
        },
      },
      take: 5,
      where: seasonWhere,
    });

    const topScorerWithAssistIds = topScorersWithAssists.map((s) => s.playerId);
    const topScorerWithAssistPlayers = await prisma.player.findMany({
      where: {
        id: { in: topScorerWithAssistIds },
      },
    });

    const topScorersComparison = topScorersWithAssists.map((scorer) => {
      const player = topScorerWithAssistPlayers.find((p) => p.id === scorer.playerId);
      return {
        playerId: scorer.playerId,
        playerName: player ? `${player.firstName} ${player.lastName}` : 'Unknown',
        goals: scorer._sum.goals || 0,
        assists: scorer._sum.assists || 0,
      };
    });

    // Get match performance data (goals and assists per match)
    const matchPerformance = allMatches.map((match) => {
      const matchGoals = match.stats.reduce((sum, stat) => sum + stat.goals, 0);
      const matchAssists = match.stats.reduce((sum, stat) => sum + stat.assists, 0);
      const ratingsWithValues = match.stats
        .filter((stat) => stat.rating !== null && stat.rating !== undefined)
        .map((stat) => stat.rating!);
      const avgRating = ratingsWithValues.length > 0
        ? ratingsWithValues.reduce((sum, rating) => sum + rating, 0) / ratingsWithValues.length
        : null;

      return {
        date: match.date.toISOString().split('T')[0],
        opponent: match.opponent,
        goals: matchGoals,
        assists: matchAssists,
        avgRating: avgRating ? Number(avgRating.toFixed(2)) : null,
      };
    });

    return {
      totalGoals: totals._sum.goals || 0,
      totalAssists: totals._sum.assists || 0,
      totalGoalsConceded,
      totalPlayers,
      topScorers: topScorersWithNames,
      recentMatches,
      matchCount,
      goalsOverTime,
      topScorersComparison,
      matchPerformance,
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
        matchesStarted: acc.matchesStarted + (stat.started ? 1 : 0),
        goals: acc.goals + stat.goals,
        assists: acc.assists + stat.assists,
        minutes: acc.minutes + stat.minutes,
        tackles: acc.tackles + (stat.tackles || 0),
        blocks: acc.blocks + (stat.blocks || 0),
        saves: acc.saves + (stat.saves || 0),
        yellow: acc.yellow + stat.yellow,
        red: acc.red + stat.red,
        ratings: stat.rating !== null && stat.rating !== undefined
          ? [...acc.ratings, stat.rating]
          : acc.ratings,
      }),
      {
        matches: 0,
        matchesStarted: 0,
        goals: 0,
        assists: 0,
        minutes: 0,
        tackles: 0,
        blocks: 0,
        saves: 0,
        yellow: 0,
        red: 0,
        ratings: [] as number[],
      }
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
        tackles: true,
        blocks: true,
        saves: true,
      },
      _count: {
        id: true,
      },
    });

    const playerIds = playerStats.map((s) => s.playerId);
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds } },
    });

    // Get matches started count and average rating for each player
    const playerStatsWithDetails = await prisma.playerMatchStat.findMany({
      where: whereClause,
      select: {
        playerId: true,
        started: true,
        rating: true,
      },
    });

    // Calculate matches started and average rating per player
    const playerDetailsMap = new Map<number, { matchesStarted: number; ratings: number[] }>();
    playerStatsWithDetails.forEach((stat) => {
      if (!playerDetailsMap.has(stat.playerId)) {
        playerDetailsMap.set(stat.playerId, { matchesStarted: 0, ratings: [] });
      }
      const details = playerDetailsMap.get(stat.playerId)!;
      if (stat.started) {
        details.matchesStarted++;
      }
      if (stat.rating !== null && stat.rating !== undefined) {
        details.ratings.push(stat.rating);
      }
    });

    const reportData = playerStats.map((stat) => {
      const player = players.find((p) => p.id === stat.playerId);
      const details = playerDetailsMap.get(stat.playerId) || { matchesStarted: 0, ratings: [] };
      const avgRating = details.ratings.length > 0
        ? details.ratings.reduce((sum, r) => sum + r, 0) / details.ratings.length
        : null;

      return {
        playerId: stat.playerId,
        playerName: player ? `${player.firstName} ${player.lastName}` : 'Unknown',
        position: player?.position || 'FW',
        matches: stat._count.id,
        matchesStarted: details.matchesStarted,
        goals: stat._sum.goals || 0,
        assists: stat._sum.assists || 0,
        minutes: stat._sum.minutes || 0,
        tackles: stat._sum.tackles || 0,
        blocks: stat._sum.blocks || 0,
        saves: stat._sum.saves || 0,
        avgRating: avgRating ? Number(avgRating.toFixed(2)) : null,
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

export async function getTeamReportData(filters?: {
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
      whereClause.date = {};
      if (filters.startDate) {
        whereClause.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.date.lte = filters.endDate;
      }
    }

    // Get all matches with stats
    const matches = await prisma.match.findMany({
      where: whereClause,
      include: {
        stats: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // Calculate team totals
    let totalGoals = 0;
    let totalGoalsConceded = 0;
    let totalAssists = 0;
    let totalTackles = 0;
    let totalBlocks = 0;
    let totalSaves = 0;
    const allRatings: number[] = [];

    matches.forEach((match) => {
      // Sum up player stats for this match (including all players who played - started or substituted)
      match.stats.filter((stat) => stat.started || stat.substituted).forEach((stat) => {
        totalGoals += stat.goals;
        totalAssists += stat.assists;
        totalTackles += stat.tackles || 0;
        totalBlocks += stat.blocks || 0;
        totalSaves += stat.saves || 0;
        if (stat.rating !== null && stat.rating !== undefined) {
          allRatings.push(stat.rating);
        }
      });

      // Parse goals conceded from result string (format: "X-Y" where X is our goals, Y is opponent goals)
      if (match.result) {
        const matchResult = match.result.match(/^(\d+)-(\d+)$/);
        if (matchResult) {
          totalGoalsConceded += parseInt(matchResult[2], 10);
        }
      }
    });

    const avgRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : null;

    return {
      matchesPlayed: matches.length,
      totalGoals,
      totalGoalsConceded,
      totalAssists,
      totalTackles,
      totalBlocks,
      totalSaves,
      avgRating: avgRating ? Number(avgRating.toFixed(2)) : null,
    };
  } catch (error) {
    console.error('Error fetching team report data:', error);
    return null;
  }
}

