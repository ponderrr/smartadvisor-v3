import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      throw new Error("Invalid token");
    }

    const { answers, contentType, userAge } = await req.json();

    // Validate input
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      throw new Error("Answers are required");
    }

    if (!contentType || !["movie", "book", "both"].includes(contentType)) {
      throw new Error("Invalid content type");
    }

    if (!userAge || userAge < 13 || userAge > 120) {
      throw new Error("Invalid age");
    }

    const answersText = answers
      .map((a: any, i: number) => `Q${i + 1}: ${a.answer_text}`)
      .join("\n");

    const prompt = `Based on these user answers, generate ${contentType} recommendations for a ${userAge}-year-old:

${answersText}

Requirements:
- Generate ${
      contentType === "both" ? "both 1 movie AND 1 book" : `1 ${contentType}`
    }
- Consider user's age (${userAge}) for appropriate content
- Base recommendations on their stated preferences
- Provide detailed explanations for why each recommendation fits
- Return as JSON with this exact format:

${
  contentType === "movie" || contentType === "both"
    ? `{
  "movieRecommendation": {
    "title": "Movie Title",
    "director": "Director Name", 
    "year": 2023,
    "genres": ["Genre1", "Genre2"],
    "explanation": "Why this movie fits their preferences"
  }${contentType === "both" ? "," : ""}`
    : ""
}
${
  contentType === "book" || contentType === "both"
    ? `${contentType === "both" ? "  " : ""}"bookRecommendation": {
    "title": "Book Title",
    "author": "Author Name",
    "year": 2023, 
    "genres": ["Genre1", "Genre2"],
    "explanation": "Why this book fits their preferences"
  }`
    : ""
}
}

Generate personalized recommendations now:`;

    // Call OpenAI API
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are a personalized recommendation engine. Always respond with valid JSON in the exact format requested.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1500,
          temperature: 0.8,
        }),
      }
    );

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const recommendationsText = openaiData.choices[0].message.content;

    if (!recommendationsText) {
      throw new Error("No response from OpenAI");
    }

    let recommendations;
    try {
      recommendations = JSON.parse(recommendationsText);
    } catch (error) {
      throw new Error("OpenAI returned invalid JSON");
    }

    // Validate the response format
    if (
      contentType === "both" &&
      (!recommendations.movieRecommendation ||
        !recommendations.bookRecommendation)
    ) {
      throw new Error("Missing required recommendations");
    } else if (
      contentType === "movie" &&
      !recommendations.movieRecommendation
    ) {
      throw new Error("Missing movie recommendation");
    } else if (contentType === "book" && !recommendations.bookRecommendation) {
      throw new Error("Missing book recommendation");
    }

    return new Response(JSON.stringify(recommendations), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
