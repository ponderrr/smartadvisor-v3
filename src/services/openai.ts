
import OpenAI from "openai";
import { Question } from "@/types/Question";
import { Answer } from "@/types/Answer";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OpenAI API key is required for Smart Advisor to function");
}

const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true,
});

export interface MovieRecommendation {
  title: string;
  director: string;
  year: number;
  genres: string[];
  explanation: string;
}

export interface BookRecommendation {
  title: string;
  author: string;
  year: number;
  genres: string[];
  explanation: string;
}

export interface RecommendationData {
  movieRecommendation?: MovieRecommendation;
  bookRecommendation?: BookRecommendation;
}

/**
 * Generates personalized recommendation questions using OpenAI
 */
export async function generateQuestions(
  contentType: "movie" | "book" | "both",
  userAge: number
): Promise<Question[]> {
  console.log(`Generating questions for ${contentType}, age ${userAge}`);
  
  try {
    const prompt = `Generate exactly 5 personalized recommendation questions for a ${userAge}-year-old user who wants ${contentType} recommendations. 
    
    Requirements:
    - Questions should be conversational and engaging
    - Age-appropriate for ${userAge} years old
    - Focused on ${
      contentType === "both" ? "movies and books" : contentType
    } preferences
    - Help understand their taste, mood, and interests
    - Return as JSON object with format: {"questions": [{"id": "1", "text": "question text"}, {"id": "2", "text": "question text"}, ...]}
    
    Examples of good questions:
    - "What's your favorite genre and what draws you to it?"
    - "Do you prefer happy endings or complex, thought-provoking conclusions?"
    - "Tell me about a recent ${
      contentType === "both" ? "movie or book" : contentType
    } you absolutely loved and why"
    
    Generate 5 unique questions now as valid JSON object:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
    });

    const questionsText = completion.choices[0].message.content;
    if (!questionsText) {
      throw new Error("No response from OpenAI");
    }

    let questions;
    try {
      const parsedResponse = JSON.parse(questionsText);
      if (
        !parsedResponse.questions ||
        !Array.isArray(parsedResponse.questions)
      ) {
        throw new Error("Invalid response format - missing questions array");
      }
      questions = parsedResponse.questions;
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      throw new Error("Invalid response format from OpenAI");
    }

    const formattedQuestions: Question[] = questions.map(
      (q: any, index: number) => ({
        id: q.id || `q${index + 1}`,
        text: q.text,
        content_type: contentType,
        user_age_range: `${Math.floor(userAge / 10) * 10}-${
          Math.floor(userAge / 10) * 10 + 9
        }`,
      })
    );

    console.log("Successfully generated questions:", formattedQuestions);
    return formattedQuestions;
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}

/**
 * Generates personalized recommendations using OpenAI
 */
export async function generateRecommendations(
  answers: Answer[],
  contentType: "movie" | "book" | "both",
  userAge: number
): Promise<RecommendationData> {
  console.log(`Generating recommendations for ${contentType}, age ${userAge}`);
  
  try {
    const answersText = answers
      .map((a, i) => `Q${i + 1}: ${a.answer_text}`)
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

    const completion = await openai.chat.completions.create({
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
    });

    const recommendationsText = completion.choices[0].message.content;
    if (!recommendationsText) {
      throw new Error("No response from OpenAI");
    }

    let recommendations;
    try {
      recommendations = JSON.parse(recommendationsText);
    } catch (error) {
      console.error("Failed to parse OpenAI response:", error);
      throw new Error("Invalid response format from OpenAI");
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

    console.log("Successfully generated recommendations:", recommendations);
    return recommendations;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    throw error;
  }
}

/**
 * Retry wrapper for question generation with exponential backoff
 */
export async function generateQuestionsWithRetry(
  contentType: "movie" | "book" | "both",
  userAge: number,
  maxRetries: number = 3
): Promise<Question[]> {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateQuestions(contentType, userAge);
    } catch (error) {
      lastError = error;
      console.error(`Question generation attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Retry wrapper for recommendation generation with exponential backoff
 */
export async function generateRecommendationsWithRetry(
  answers: Answer[],
  contentType: "movie" | "book" | "both",
  userAge: number,
  maxRetries: number = 3
): Promise<RecommendationData> {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateRecommendations(answers, contentType, userAge);
    } catch (error) {
      lastError = error;
      console.error(`Recommendation generation attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
