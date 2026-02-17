/**
 * Maps opponent names to their logo images
 */
export const opponentLogos: Record<string, string> = {
  'Arsenal': '/images/Arsenal_FC.svg.png',
  'Arsenal FC': '/images/Arsenal_FC.svg.png',
  'Real Madrid': '/images/Real_Madrid_CF.svg.png',
  'Real Madrid CF': '/images/Real_Madrid_CF.svg.png',
  'Manchester City': '/images/Manchester_City_FC_badge.svg.png',
  'Manchester City FC': '/images/Manchester_City_FC_badge.svg.png',
  'Manchester United': '/images/Manchester_United_FC_crest.svg.png',
  'Manchester United FC': '/images/Manchester_United_FC_crest.svg.png',
  'United FC': '/images/Manchester_United_FC_crest.svg.png',
  'City FC': '/images/Manchester_City_FC_badge.svg.png',
};

/**
 * Get logo path for an opponent name
 */
export function getOpponentLogo(opponentName: string): string | null {
  // Try exact match first
  if (opponentLogos[opponentName]) {
    return opponentLogos[opponentName];
  }
  
  // Try case-insensitive match
  const normalizedName = opponentName.toLowerCase();
  for (const [key, value] of Object.entries(opponentLogos)) {
    if (key.toLowerCase() === normalizedName) {
      return value;
    }
  }
  
  // Try partial match (e.g., "Arsenal" matches "Arsenal FC")
  for (const [key, value] of Object.entries(opponentLogos)) {
    if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
      return value;
    }
  }
  
  return null;
}

/**
 * Get club logo based on club name
 */
export function getClubLogo(clubName: string): string | null {
  return getOpponentLogo(clubName);
}

