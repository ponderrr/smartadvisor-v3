
export interface MovieSearchResult {
  poster: string;
  year: number;
  rating: number;
}

export interface MovieDetails {
  id: number;
  title: string;
  director: string;
  genres: string[];
  year: number;
  rating: number;
  poster: string;
  overview: string;
}

interface TMDBMovieResponse {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

interface TMDBCreditsResponse {
  crew: Array<{
    job: string;
    name: string;
  }>;
}

class TMDBService {
  private apiKey: string;
  private baseUrl = 'https://api.themoviedb.org/3';
  private imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor() {
    this.apiKey = import.meta.env.VITE_TMDB_API_KEY || '';
    if (!this.apiKey) {
      console.warn('TMDB API key not found. Movie data will use fallback images and basic information.');
    }
  }

  /**
   * Search for a movie by title and return enhanced metadata
   */
  async searchMovie(title: string): Promise<MovieSearchResult> {
    if (!this.apiKey) {
      console.warn('TMDB API key missing, using default movie data');
      return this.getDefaultMovieData();
    }

    try {
      const searchUrl = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(title)}&language=en-US`;
      
      const response = await fetch(searchUrl);

      if (!response.ok) {
        console.error(`TMDB API error: ${response.status} ${response.statusText}`);
        return this.getDefaultMovieData();
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const movie: TMDBMovieResponse = data.results[0];
        
        return {
          poster: movie.poster_path 
            ? `${this.imageBaseUrl}${movie.poster_path}` 
            : this.getDefaultMovieData().poster,
          year: movie.release_date 
            ? new Date(movie.release_date).getFullYear() 
            : new Date().getFullYear(),
          rating: Math.round(movie.vote_average * 10) / 10 || 7.5,
        };
      }

      console.log(`No TMDB results found for movie: ${title}`);
      return this.getDefaultMovieData();
    } catch (error) {
      console.error('Error searching movie on TMDB:', error);
      return this.getDefaultMovieData();
    }
  }

  /**
   * Get detailed movie information including director and full metadata
   */
  async getMovieDetails(movieId: string): Promise<MovieDetails | null> {
    if (!this.apiKey) {
      console.warn('TMDB API key missing, cannot fetch detailed movie information');
      return null;
    }

    try {
      const [movieResponse, creditsResponse] = await Promise.all([
        fetch(`${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}&language=en-US`),
        fetch(`${this.baseUrl}/movie/${movieId}/credits?api_key=${this.apiKey}`)
      ]);

      if (!movieResponse.ok || !creditsResponse.ok) {
        console.error('Failed to fetch detailed movie information from TMDB');
        return null;
      }

      const movieData = await movieResponse.json();
      const creditsData: TMDBCreditsResponse = await creditsResponse.json();

      const director = creditsData.crew?.find((person) => person.job === 'Director')?.name || 'Unknown Director';

      return {
        id: movieData.id,
        title: movieData.title || 'Unknown Title',
        director,
        genres: movieData.genres?.map((g: any) => g.name) || [],
        year: movieData.release_date ? new Date(movieData.release_date).getFullYear() : new Date().getFullYear(),
        rating: Math.round(movieData.vote_average * 10) / 10 || 7.5,
        poster: movieData.poster_path ? `${this.imageBaseUrl}${movieData.poster_path}` : this.getDefaultMovieData().poster,
        overview: movieData.overview || 'No description available.',
      };
    } catch (error) {
      console.error('Error fetching detailed movie information:', error);
      return null;
    }
  }

  /**
   * Fallback data when TMDB API is unavailable or returns no results
   */
  private getDefaultMovieData(): MovieSearchResult {
    return {
      poster: 'https://images.unsplash.com/photo-1489599731893-01139d4e6b5b?w=300&h=450&fit=crop',
      year: new Date().getFullYear(),
      rating: 7.5,
    };
  }
}

export const tmdbService = new TMDBService();
