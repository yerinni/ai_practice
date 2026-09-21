import { supabase } from '@/lib/supabase';

export type PlaceCategory = 'cafe' | 'attraction' | 'walk';

export interface NearbyPlace {
  placeId: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  address: string | null;
}

// Calls the `nearby-places` Supabase Edge Function
// (supabase/functions/nearby-places), which caches results in `place_cache`
// so the Google Places API isn't billed for every open of this screen.
export async function fetchNearbyPlaces(params: {
  latitude: number;
  longitude: number;
  category: PlaceCategory;
}): Promise<NearbyPlace[]> {
  const { data, error } = await supabase.functions.invoke<{ places: NearbyPlace[] }>('nearby-places', {
    body: params,
  });
  if (error) throw error;
  return data?.places ?? [];
}

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function distanceInMeters(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}
