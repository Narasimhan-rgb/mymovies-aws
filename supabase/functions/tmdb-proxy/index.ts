import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TMDB_BASE = "https://api.themoviedb.org/3";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY");
    if (!TMDB_API_KEY) throw new Error("TMDB_API_KEY is not configured");

    const { action, params } = await req.json();
    let url: string;

    switch (action) {
      case "trending":
        url = `${TMDB_BASE}/trending/movie/week?api_key=${TMDB_API_KEY}&language=en-US&page=${params?.page || 1}`;
        break;
      case "discover":
        const genreIds = params?.genre_ids?.join(",") || "";
        const sortBy = params?.sort_by || "popularity.desc";
        const page = params?.page || 1;
        const year = params?.year || "";
        const minRating = params?.min_rating || "";
        url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=${sortBy}&with_genres=${genreIds}&page=${page}${year ? `&primary_release_year=${year}` : ""}${minRating ? `&vote_average.gte=${minRating}` : ""}&vote_count.gte=50`;
        break;
      case "search":
        url = `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(params?.query || "")}&page=${params?.page || 1}`;
        break;
      case "genres":
        url = `${TMDB_BASE}/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`;
        break;
      case "movie":
        url = `${TMDB_BASE}/movie/${params?.id}?api_key=${TMDB_API_KEY}&language=en-US`;
        break;
      case "top_rated":
        url = `${TMDB_BASE}/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US&page=${params?.page || 1}`;
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      console.error("TMDB error:", response.status, text);
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("tmdb-proxy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
