import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const title = url.searchParams.get("title");

    if (!title) {
      throw new Error("Title parameter is required");
    }

    const tmdbApiKey = Deno.env.get("TMDB_API_KEY");
    if (!tmdbApiKey) {
      // Return fallback data if API key not set
      return new Response(
        JSON.stringify({
          poster:
            "https://images.unsplash.com/photo-1489599731893-01139d4e6b5b?w=300&h=450&fit=crop",
          year: new Date().getFullYear(),
          rating: 7.5,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const tmdbResponse = await fetch(
      `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${encodeURIComponent(
        title
      )}&language=en-US`
    );

    if (!tmdbResponse.ok) {
      throw new Error(`TMDB API error: ${tmdbResponse.status}`);
    }

    const data = await tmdbResponse.json();

    if (data.results && data.results.length > 0) {
      const movie = data.results[0];

      return new Response(
        JSON.stringify({
          poster: movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "https://images.unsplash.com/photo-1489599731893-01139d4e6b5b?w=300&h=450&fit=crop",
          year: movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : new Date().getFullYear(),
          rating: Math.round(movie.vote_average * 10) / 10 || 7.5,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No results found, return fallback
    return new Response(
      JSON.stringify({
        poster:
          "https://images.unsplash.com/photo-1489599731893-01139d4e6b5b?w=300&h=450&fit=crop",
        year: new Date().getFullYear(),
        rating: 7.5,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Return fallback data on any error
    return new Response(
      JSON.stringify({
        poster:
          "https://images.unsplash.com/photo-1489599731893-01139d4e6b5b?w=300&h=450&fit=crop",
        year: new Date().getFullYear(),
        rating: 7.5,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
