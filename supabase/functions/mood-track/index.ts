// Supabase Edge Function (Deno). Deploy with:
//   supabase functions deploy mood-track
// No secrets needed — Deezer's public search endpoint doesn't require an
// API key, unlike Spotify (which now requires the developer account to
// have an active Premium subscription just to call the Web API, even for
// plain search under Client Credentials — see git history for the
// spotify-mood-playlist function this replaces).
//
// F3/F4: given a mood tag (and optionally a music genre from trip-setup),
// returns one track.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Korean UI mood tags -> English search keywords. Deezer's search mostly
// indexes English-language metadata, so translating the query gets far
// more relevant hits than searching the Korean word directly.
const MOOD_SEARCH_TERMS: Record<string, string> = {
  차분한: 'calm chill',
  신나는: 'upbeat energetic',
  몽환적인: 'dreamy ambient',
  센치한: 'melancholy sentimental',
  경쾌한: 'feel good cheerful',
  로맨틱한: 'romantic love',
  웅장한: 'epic cinematic',
  편안한: 'relaxing peaceful',
};

// Korean genre chips (src/app/(onboarding)/trip-setup.tsx GENRE_OPTIONS) ->
// English search keywords. Deezer's public /search endpoint has no genre
// filter param — this is a free-text keyword added to the query, which
// biases results toward that genre without guaranteeing every result
// matches it exactly.
const GENRE_SEARCH_TERMS: Record<string, string> = {
  인디: 'indie',
  팝: 'pop',
  재즈: 'jazz',
  로파이: 'lofi',
  'K-POP': 'k-pop',
  어쿠스틱: 'acoustic',
  힙합: 'hip hop',
  클래식: 'classical',
};

interface DeezerTrack {
  id: number;
  title: string;
  link?: string;
  preview?: string;
  artist?: { name: string };
  album?: { cover_medium?: string };
}

async function searchDeezer(query: string): Promise<DeezerTrack[]> {
  const searchUrl = new URL('https://api.deezer.com/search');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('limit', '25');

  const response = await fetch(searchUrl);
  if (!response.ok) {
    throw new Error(`Deezer search failed: ${response.status}`);
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(`Deezer error: ${data.error.message ?? data.error.type}`);
  }
  return ((data.data ?? []) as unknown[]).filter(Boolean) as DeezerTrack[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mood, genre } = await req.json();
    if (typeof mood !== 'string' || !mood) {
      return new Response(JSON.stringify({ error: 'mood is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const moodTerm = MOOD_SEARCH_TERMS[mood] ?? mood;
    const genreTerm = typeof genre === 'string' ? (GENRE_SEARCH_TERMS[genre] ?? genre) : null;

    // A genre+mood combo (e.g. "classical" + "epic cinematic") can come up
    // empty even though each term alone has plenty of results, since this
    // is free-text search, not faceted filtering. Fall back to mood-only
    // rather than failing the whole card.
    let items = await searchDeezer([genreTerm, moodTerm].filter(Boolean).join(' '));
    if (items.length === 0 && genreTerm) {
      items = await searchDeezer(moodTerm);
    }

    if (items.length === 0) {
      return new Response(JSON.stringify({ error: 'no track found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const track = items[Math.floor(Math.random() * items.length)];
    return new Response(
      JSON.stringify({
        id: String(track.id),
        name: track.artist?.name ? `${track.title} - ${track.artist.name}` : track.title,
        imageUrl: track.album?.cover_medium ?? null,
        externalUrl: track.link ?? null,
        previewUrl: track.preview ?? null,
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
