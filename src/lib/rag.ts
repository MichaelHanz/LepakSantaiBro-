const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface AnchorSuggestion {
  name: string;
  estimated_cost_rm: number;
  reason: string;
  distance_km: number;
}

export async function suggestAnchor(budgetLimitRm: number, basecampLat: number, basecampLng: number, query: string): Promise<AnchorSuggestion[]> {
  const response = await fetch(`${BACKEND_URL}/anchor/suggest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      budget_limit_rm: budgetLimitRm,
      basecamp_lat: basecampLat,
      basecamp_lng: basecampLng,
      query: query,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch anchor suggestions');
  }

  const data = await response.json();
  return data.suggestions;
}
