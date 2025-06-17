import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

    const { contentType, userAge } = await req.json();

    // Validate input
    if (!contentType || !userAge) {
      throw new Error("Missing required parameters");
    }

    if (!["movie", "book", "both"].includes(contentType)) {
      throw new Error("Invalid content type");
    }

    if (userAge < 13 || userAge > 120) {
      throw new Error("Invalid age");
    }

    const prompt = `Generate exactly 5 personalized recommendation questions for a ${userAge}-year-old user who wants ${contentType} recommendations. 
    
    Requirements:
    - Questions should be conversational and engaging
    - Age-appropriate for ${userAge} years old
    - Focused on ${
      contentType === "both" ? "movies and books" : contentType
    } preferences
    - Help understand their taste, mood, and interests
    - Return as JSON object with format: {"questions": [{"id": "1", "text": "question text"}, {"id": "2", "text": "question text"}, ...]}
    
    Generate 5 unique questions now as valid JSON object:`;

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
          model: "gpt-4",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that generates personalized recommendation questions. Always respond with valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      }
    );

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const questionsText = openaiData.choices[0].message.content;

    if (!questionsText) {
      throw new Error("No response from OpenAI");
    }

    const parsedResponse = JSON.parse(questionsText);
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error("Invalid response format");
    }

    const formattedQuestions = parsedResponse.questions.map(
      (q: any, index: number) => ({
        id: q.id || `q${index + 1}`,
        text: q.text,
        content_type: contentType,
        user_age_range: `${Math.floor(userAge / 10) * 10}-${
          Math.floor(userAge / 10) * 10 + 9
        }`,
      })
    );

    return new Response(JSON.stringify({ questions: formattedQuestions }), {
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
