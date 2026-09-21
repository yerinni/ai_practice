// Supabase Edge Function (Deno). Deploy with:
//   supabase functions deploy spotify-mood-playlist
//   supabase secrets set SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=...
//
// F3/F4: given a mood tag, returns one Spotify playlist. Uses the Client
// Credentials grant (app-level, no per-user Spotify login for MVP) — the
// client secret is exchanged here, server-side, so it never ships inside
// the React Native bundle where anyone could extract it.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Korean UI mood tags -> English search keywords. Spotify's playlist search
// mostly indexes English-language titles, so translating the query gets far
// more relevant hits than searching the Korean word directly.
const MOOD_SEARCH_TERMS: Record<string, string> = {
  차분한: 'calm chill',
  신나는: 'upbeat energetic',
  몽환적인: 'dreamy ambient',
  센치한: 'melancholy sentimental',
  경쾌한: 'feel good cheerful',
};

async function getAppAccessToken(): Promise<string> {
  const clientId = Deno.env.get('SPOTIFY_CLIENT_ID');
  const clientSecret = Deno.env.get('SPOTIFY_CLIENT_SECRET');
  if (!clientId || !clientSecret) {
    throw new Error('Missing SPOTIFY_CLIENT_ID/SPOTIFY_CLIENT_SECRET secrets');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: 'grant_type=client_credentials',
  });
  if (!response.ok) {
    throw new Error(`Spotify token request failed: ${response.status}`);
  }
  const data = await response.json();
  return data.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mood } = await req.json();
    if (typeof mood !== 'string' || !mood) {
      return new Response(JSON.stringify({ error: 'mood is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = await getAppAccessToken();
    const query = MOOD_SEARCH_TERMS[mood] ?? mood;
    const searchUrl = new URL('https://api.spotify.com/v1/search');
    searchUrl.searchParams.set('q', query);
    searchUrl.searchParams.set('type', 'playlist');
    searchUrl.searchParams.set('limit', '10');

    const searchResponse = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!searchResponse.ok) {
      throw new Error(`Spotify search failed: ${searchResponse.status}`);
    }
    const searchData = await searchResponse.json();
    const items = ((searchData.playlists?.items ?? []) as unknown[]).filter(Boolean) as Array<{
      id: string;
      name: string;
      images?: { url: string }[];
      external_urls?: { spotify?: string };
    }>;

    if (items.length === 0) {
      return new Response(JSON.stringify({ error: 'no playlist found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const playlist = items[Math.floor(Math.random() * items.length)];
    return new Response(
      JSON.stringify({
        id: playlist.id,
        name: playlist.name,
        imageUrl: playlist.images?.[0]?.url ?? null,
        externalUrl: playlist.external_urls?.spotify ?? null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
