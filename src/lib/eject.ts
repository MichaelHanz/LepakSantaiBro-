import { Linking } from 'react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export interface EjectResponse {
  destination_name: string;
  distance_km: number;
  walking_duration_mins: number;
  grab_cost_estimate_rm: number;
  grab_deep_link: string;
}

export async function requestEject(userId: string, tripId: string, currentLat: number, currentLng: number): Promise<EjectResponse> {
  const response = await fetch(`${BACKEND_URL}/eject/proxy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      trip_id: tripId,
      current_lat: currentLat,
      current_lng: currentLng,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to request eject routing');
  }

  return response.json();
}

export async function openGrab(deepLink: string) {
  const supported = await Linking.canOpenURL(deepLink);
  if (supported) {
    await Linking.openURL(deepLink);
  } else {
    console.warn('Cannot open Grab app. Is it installed?');
  }
}
