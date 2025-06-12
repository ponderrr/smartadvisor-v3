
import { Question } from '@/types/Question';
import { Answer } from '@/types/Answer';

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

class OpenAIService {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('OpenAI API key not found. Some features may not work.');
    }
  }

  async generateQuestions(contentType: 'movie' | 'book' | 'both', userAge: number): Promise<Question[]> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const prompt = `Generate 5 personalized questions for a ${userAge}-year-old user who wants ${contentType} recommendations. 
      Make the questions engaging and help understand their preferences for genres, mood, themes, and past favorites.
      Return as JSON array with format: [{"id": "1", "text": "question text", "content_type": "${contentType}"}]`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that generates personalized questionnaire questions. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const questionsText = data.choices[0].message.content;
      
      try {
        const questions = JSON.parse(questionsText);
        return questions.map((q: any, index: number) => ({
          id: q.id || `q${index + 1}`,
          text: q.text,
          content_type: contentType,
          user_age_range: `${Math.floor(userAge / 10) * 10}-${Math.floor(userAge / 10) * 10 + 9}`,
        }));
      } catch {
        // Fallback to default questions if JSON parsing fails
        return this.getDefaultQuestions(contentType);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      return this.getDefaultQuestions(contentType);
    }
  }

  async generateRecommendations(
    answers: Answer[],
    contentType: 'movie' | 'book' | 'both',
    userAge: number
  ): Promise<{ movieRecommendation?: MovieRecommendation; bookRecommendation?: BookRecommendation }> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const answersText = answers.map(a => `Q: ${a.question_id} A: ${a.answer_text}`).join('\n');
      
      const prompt = `Based on these questionnaire answers from a ${userAge}-year-old user:
${answersText}

Generate ${contentType} recommendation(s). Return as JSON with this exact format:
${contentType === 'movie' || contentType === 'both' ? `
"movieRecommendation": {
  "title": "Movie Title",
  "director": "Director Name", 
  "year": 2020,
  "genres": ["Genre1", "Genre2"],
  "explanation": "Why this movie fits their preferences"
}` : ''}
${contentType === 'book' || contentType === 'both' ? `
"bookRecommendation": {
  "title": "Book Title",
  "author": "Author Name",
  "year": 2020, 
  "genres": ["Genre1", "Genre2"],
  "explanation": "Why this book fits their preferences"
}` : ''}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a personalized recommendation engine. Always respond with valid JSON in the exact format requested.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const recommendationsText = data.choices[0].message.content;
      
      try {
        return JSON.parse(recommendationsText);
      } catch {
        return this.getDefaultRecommendations(contentType);
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return this.getDefaultRecommendations(contentType);
    }
  }

  private getDefaultQuestions(contentType: 'movie' | 'book' | 'both'): Question[] {
    return [
      {
        id: '1',
        text: `What's your favorite genre in ${contentType === 'both' ? 'movies and books' : contentType === 'movie' ? 'movies' : 'books'}?`,
        content_type: contentType,
      },
      {
        id: '2',
        text: 'What kind of mood are you in? Something light and fun, or deep and thought-provoking?',
        content_type: contentType,
      },
      {
        id: '3',
        text: `Tell us about a recent ${contentType === 'both' ? 'movie or book' : contentType} you loved and why.`,
        content_type: contentType,
      },
      {
        id: '4',
        text: 'Are there any themes or settings that especially interest you right now?',
        content_type: contentType,
      },
      {
        id: '5',
        text: 'Do you prefer familiar stories or are you open to something completely different?',
        content_type: contentType,
      },
    ];
  }

  private getDefaultRecommendations(contentType: 'movie' | 'book' | 'both'): any {
    const result: any = {};
    
    if (contentType === 'movie' || contentType === 'both') {
      result.movieRecommendation = {
        title: 'The Shawshank Redemption',
        director: 'Frank Darabont',
        year: 1994,
        genres: ['Drama', 'Crime'],
        explanation: 'A timeless story of hope and friendship that resonates with viewers of all ages.',
      };
    }
    
    if (contentType === 'book' || contentType === 'both') {
      result.bookRecommendation = {
        title: 'The Midnight Library',
        author: 'Matt Haig',
        year: 2020,
        genres: ['Literary Fiction', 'Philosophy'],
        explanation: 'A thought-provoking exploration of life choices and infinite possibilities.',
      };
    }
    
    return result;
  }
}

export const openaiService = new OpenAIService();
