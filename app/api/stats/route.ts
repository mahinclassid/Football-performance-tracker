import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDashboardStats } from '@/app/actions/stats';

// Default stats object to prevent undefined errors
const defaultStats = {
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

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get season from query params
    const { searchParams } = new URL(request.url);
    const season = searchParams.get('season') || undefined;

    const stats = await getDashboardStats(season);
    // Return default stats if null to prevent undefined errors
    return NextResponse.json(stats || defaultStats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    // Return default stats on error instead of error response
    // This prevents the dashboard from crashing
    return NextResponse.json(defaultStats);
  }
}




