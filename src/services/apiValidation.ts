
/**
 * API validation and monitoring service for external integrations
 */
export interface ApiValidationResult {
  service: string;
  isAvailable: boolean;
  hasApiKey: boolean;
  error?: string;
}

class ApiValidationService {
  /**
   * Validate all external API services
   */
  async validateAllApis(): Promise<ApiValidationResult[]> {
    const results = await Promise.all([
      this.validateTmdbApi(),
      this.validateGoogleBooksApi(),
      this.validateOpenAiApi(),
    ]);

    return results;
  }

  /**
   * Validate TMDB API availability and key
   */
  async validateTmdbApi(): Promise<ApiValidationResult> {
    const apiKey = import.meta.env.VITE_TMDB_API_KEY;
    
    if (!apiKey) {
      return {
        service: 'TMDB',
        isAvailable: false,
        hasApiKey: false,
        error: 'API key not configured'
      };
    }

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/configuration?api_key=${apiKey}`
      );
      
      return {
        service: 'TMDB',
        isAvailable: response.ok,
        hasApiKey: true,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };
    } catch (error) {
      return {
        service: 'TMDB',
        isAvailable: false,
        hasApiKey: true,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate Google Books API availability and key
   */
  async validateGoogleBooksApi(): Promise<ApiValidationResult> {
    const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
    
    if (!apiKey) {
      return {
        service: 'Google Books',
        isAvailable: false,
        hasApiKey: false,
        error: 'API key not configured'
      };
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=test&key=${apiKey}&maxResults=1`
      );
      
      return {
        service: 'Google Books',
        isAvailable: response.ok,
        hasApiKey: true,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };
    } catch (error) {
      return {
        service: 'Google Books',
        isAvailable: false,
        hasApiKey: true,
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Validate OpenAI API availability and key
   */
  async validateOpenAiApi(): Promise<ApiValidationResult> {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      return {
        service: 'OpenAI',
        isAvailable: false,
        hasApiKey: false,
        error: 'API key not configured'
      };
    }

    // For OpenAI, we just check if the key exists and has the right format
    // Making an actual API call would consume tokens unnecessarily
    const isValidFormat = apiKey.startsWith('sk-') && apiKey.length > 20;
    
    return {
      service: 'OpenAI',
      isAvailable: isValidFormat,
      hasApiKey: true,
      error: isValidFormat ? undefined : 'API key format appears invalid'
    };
  }

  /**
   * Log API validation results for debugging
   */
  logValidationResults(results: ApiValidationResult[]): void {
    console.group('🔍 API Services Validation');
    
    results.forEach(result => {
      const status = result.isAvailable ? '✅' : '❌';
      const keyStatus = result.hasApiKey ? '🔑' : '🚫';
      
      console.log(`${status} ${keyStatus} ${result.service}`, result.error ? `- ${result.error}` : '');
    });
    
    console.groupEnd();
  }
}

export const apiValidationService = new ApiValidationService();
