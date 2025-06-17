import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const title = url.searchParams.get("title");
    const author = url.searchParams.get("author");

    if (!title) {
      throw new Error("Title parameter is required");
    }

    const googleBooksApiKey = Deno.env.get("GOOGLE_BOOKS_API_KEY");
    if (!googleBooksApiKey) {
      // Return fallback data if API key not set
      return new Response(
        JSON.stringify({
          cover:
            "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop",
          year: new Date().getFullYear(),
          rating: 4.2,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const query = author ? `${title}+inauthor:${author}` : title;
    const googleBooksResponse = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&key=${googleBooksApiKey}&maxResults=1&printType=books`
    );

    if (!googleBooksResponse.ok) {
      throw new Error(`Google Books API error: ${googleBooksResponse.status}`);
    }

    const data = await googleBooksResponse.json();

    if (data.items && data.items.length > 0) {
      const book = data.items[0].volumeInfo;

      return new Response(
        JSON.stringify({
          cover: book.imageLinks?.thumbnail
            ? book.imageLinks.thumbnail
                .replace("http:", "https:")
                .replace("&zoom=1", "&zoom=2")
            : "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop",
          year: book.publishedDate
            ? new Date(book.publishedDate).getFullYear()
            : new Date().getFullYear(),
          rating: book.averageRating || 4.2,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // No results found, return fallback
    return new Response(
      JSON.stringify({
        cover:
          "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop",
        year: new Date().getFullYear(),
        rating: 4.2,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Return fallback data on any error
    return new Response(
      JSON.stringify({
        cover:
          "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop",
        year: new Date().getFullYear(),
        rating: 4.2,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
