// Supabase Edge Function (Deno). Deploy with:
//   supabase secrets set GOOGLE_PLACES_API_KEY=...
//   supabase functions deploy nearby-places
//
// F5: given a location + category, returns nearby places (docs/db-schema.md
// `place_cache`). Reads/writes `place_cache` with the service-role key
// (auto-injected as SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY — bypasses the
// table's RLS, which only allows public SELECT) so repeat requests for the
// same rounded location + category reuse one Google Places call instead of
// paying for it again.
//
// Uses the legacy Nearby Search endpoint (maps.googleapis.com/maps/api/place/
// nearbysearch/json). This session's network policy blocks
// developers.google.com, so this couldn't be re-checked against Google's
// current docs before writing it — verify it still matches Google's
// supported API (vs. the newer Places API) before relying on this in
// production.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12h
// ~1.1km grid at this latitude — see docs/db-schema.md "미해결 이슈" on
// tuning this against actual Google Places API usage/cost.
const CACHE_PRECISION = 2;

const CATEGORY_TO_GOOGLE_TYPE: Record<string, string> = {
  cafe: 'cafe',
  attraction: 'tourist_attraction',
  walk: 'park',
};

interface CachedPlace {
  placeId: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  rating: number | null;
  address: string | null;
}

function roundCoord(value: number): number {
  return Number(value.toFixed(CACHE_PRECISION));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, category } = await req.json();
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || typeof category !== 'string') {
      return new Response(JSON.stringify({ error: 'latitude, longitude, category are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const googleType = CATEGORY_TO_GOOGLE_TYPE[category];
    if (!googleType) {
      return new Response(JSON.stringify({ error: `unknown category: ${category}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const geohash = `${roundCoord(latitude)},${roundCoord(longitude)}`;

    const { data: cached } = await supabase
      .from('place_cache')
      .select('places_json, expires_at')
      .eq('geohash', geohash)
      .eq('category', category)
      .maybeSingle();

    if (cached && new Date(cached.expires_at as string) > new Date()) {
      return new Response(JSON.stringify({ places: cached.places_json }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) throw new Error('Missing GOOGLE_PLACES_API_KEY secret');

    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
    searchUrl.searchParams.set('location', `${latitude},${longitude}`);
    searchUrl.searchParams.set('radius', '1500');
    searchUrl.searchParams.set('type', googleType);
    searchUrl.searchParams.set('key', apiKey);

    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error(`Google Places request failed: ${response.status}`);
    const data = await response.json();
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places error: ${data.status}`);
    }

    // Deliberately no photo field: Google's Photo endpoint takes the API key
    // as a query param, so returning a ready-to-use photo URL to the client
    // would leak the key. Add a dedicated photo-proxy function before
    // surfacing images.
    const places: CachedPlace[] = (data.results ?? []).slice(0, 10).map((place: Record<string, any>) => ({
      placeId: place.place_id,
      name: place.name,
      latitude: place.geometry?.location?.lat ?? null,
      longitude: place.geometry?.location?.lng ?? null,
      rating: place.rating ?? null,
      address: place.vicinity ?? null,
    }));

    await supabase.from('place_cache').upsert(
      {
        geohash,
        category,
        places_json: places,
        fetched_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + CACHE_TTL_MS).toISOString(),
      },
      { onConflict: 'geohash,category' },
    );

    return new Response(JSON.stringify({ places }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
