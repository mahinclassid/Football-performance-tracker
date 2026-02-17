import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// Helper function to save uploaded file
async function saveUploadedFile(file: File, filename: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Create public/uploads directory if it doesn't exist
  const uploadDir = join(process.cwd(), 'public', 'uploads');
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  
  const filepath = join(uploadDir, filename);
  await writeFile(filepath, buffer);
  
  return `/uploads/${filename}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the first club (assuming single club for now)
    // You can extend this to support multiple clubs or club selection
    const club = await prisma.club.findFirst({
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!club) {
      // Return default club data if none exists
      return NextResponse.json({
        id: null,
        name: 'Real Madrid',
        country: 'Spain',
        manager: 'Xabi Alonso',
        stadium: 'Santiago Bernabéu',
        league: 'LaLiga',
        logo: '/images/Real_Madrid_CF.svg.png',
        location: 'Madrid',
      });
    }

    return NextResponse.json(club);
  } catch (error) {
    console.error('Error fetching club data:', error);
    return NextResponse.json(
      {
        id: null,
        name: 'Real Madrid',
        country: 'Spain',
        manager: 'Xabi Alonso',
        stadium: 'Santiago Bernabéu',
        league: 'LaLiga',
        logo: '/images/Real_Madrid_CF.svg.png',
        location: 'Madrid',
      },
      { status: 200 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, country, manager, stadium, league, logo, location } = body;

    // Check if club exists
    const existingClub = await prisma.club.findFirst();

    let club;
    if (existingClub) {
      // Update existing club
      club = await prisma.club.update({
        where: { id: existingClub.id },
        data: {
          name,
          country,
          manager,
          stadium,
          league,
          logo,
          location,
        },
      });
    } else {
      // Create new club
      club = await prisma.club.create({
        data: {
          name,
          country,
          manager,
          stadium,
          league,
          logo,
          location,
        },
      });
    }

    return NextResponse.json(club);
  } catch (error) {
    console.error('Error saving club data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    console.log('PUT /api/club - Session:', session?.user?.email, 'Role:', session?.user?.role);
    
    if (!session?.user) {
      console.log('No session');
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const country = formData.get('country') as string;
    const manager = formData.get('manager') as string;
    const stadium = formData.get('stadium') as string;
    const league = formData.get('league') as string;
    const location = formData.get('location') as string;
    const logoFile = formData.get('logo') as File | null;

    console.log('PUT request received for club:', { name, country, manager });

    // Get existing club
    const existingClub = await prisma.club.findFirst();

    if (!existingClub) {
      console.log('No existing club found');
      return NextResponse.json(
        { message: 'Club not found' },
        { status: 404 }
      );
    }

    let logoPath = existingClub.logo;

    // Handle logo upload if provided
    if (logoFile && logoFile.size > 0) {
      console.log('Processing logo upload:', logoFile.name, logoFile.size);
      try {
        const timestamp = Date.now();
        const filename = `club-logo-${timestamp}-${logoFile.name}`;
        logoPath = await saveUploadedFile(logoFile, filename);
        console.log('Logo saved to:', logoPath);
      } catch (uploadError) {
        console.error('Logo upload error:', uploadError);
        // Continue without logo if upload fails
      }
    }

    // Update club
    const updatedClub = await prisma.club.update({
      where: { id: existingClub.id },
      data: {
        name,
        country,
        manager,
        stadium,
        league,
        location,
        logo: logoPath,
      },
    });

    console.log('Club updated successfully:', updatedClub.id);

    return NextResponse.json({
      ok: true,
      message: 'Club settings updated successfully',
      data: updatedClub,
    });
  } catch (error) {
    console.error('Error updating club data:', error);
    return NextResponse.json(
      { message: 'Failed to update club settings', error: String(error) },
      { status: 500 }
    );
  }
}