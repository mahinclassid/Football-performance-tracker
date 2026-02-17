import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const seasons = await prisma.season.findMany({
      orderBy: { name: 'desc' },
    });

    return NextResponse.json(seasons);
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return NextResponse.json(
      { error: 'Failed to fetch seasons' },
      { status: 500 }
    );
  }
}
