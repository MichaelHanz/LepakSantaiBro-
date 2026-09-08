import { Linking } from 'react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function linkTelegramAccount(userId: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/telegram/generate-binding-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate binding token');
    }

    const data = await response.json();
    const deepLink = data.deep_link;
    
    // Open the Telegram app with the start token
    const supported = await Linking.canOpenURL(deepLink);
    if (supported) {
      await Linking.openURL(deepLink);
    } else {
      console.warn('Cannot open Telegram. Is it installed?');
    }
  } catch (error) {
    console.error('Error linking Telegram account:', error);
  }
}
