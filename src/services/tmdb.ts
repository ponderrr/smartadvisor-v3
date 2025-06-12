
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

class TMDBService {
  private apiKey: string;
  private baseUrl = 'https://api.themoviedb.org/3';
  private imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor() {
    this.apiKey = import.meta.env.VITE_TMDB_API_KEY || '';
    if (!this.apiKey) {
      console.warn('TMDB API key not found. Movie data may be limited.');
    }
  }

  async searchMovie(title: string): Promise<MovieSearchResult> {
    if (!this.apiKey) {
      return this.getDefaultMovieData();
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search/movie?api_key=${this.apiKey}&query=${encodeURIComponent(title)}`
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const movie = data.results[0];
        return {
          poster: movie.poster_path ? `${this.imageBaseUrl}${movie.poster_path}` : '',
          year: new Date(movie.release_date).getFullYear() || 0,
          rating: Math.round(movie.vote_average * 10) / 10,
        };
      }

      return this.getDefaultMovieData();
    } catch (error) {
      console.error('Error searching movie:', error);
      return this.getDefaultMovieData();
    }
  }

  async getMovieDetails(movieId: string): Promise<MovieDetails | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const [movieResponse, creditsResponse] = await Promise.all([
        fetch(`${this.baseUrl}/movie/${movieId}?api_key=${this.apiKey}`),
        fetch(`${this.baseUrl}/movie/${movieId}/credits?api_key=${this.apiKey}`)
      ]);

      if (!movieResponse.ok || !creditsResponse.ok) {
        throw new Error('Failed to fetch movie details');
      }

      const movieData = await movieResponse.json();
      const creditsData = await creditsResponse.json();

      const director = creditsData.crew?.find((person: any) => person.job === 'Director')?.name || 'Unknown';

      return {
        id: movieData.id,
        title: movieData.title,
        director,
        genres: movieData.genres?.map((g: any) => g.name) || [],
        year: new Date(movieData.release_date).getFullYear(),
        rating: Math.round(movieData.vote_average * 10) / 10,
        poster: movieData.poster_path ? `${this.imageBaseUrl}${movieData.poster_path}` : '',
        overview: movieData.overview || '',
      };
    } catch (error) {
      console.error('Error fetching movie details:', error);
      return null;
    }
  }

  private getDefaultMovieData(): MovieSearchResult {
    return {
      poster: 'https://images.unsplash.com/photo-1489599731893-01139d4e6b5b?w=300&h=450&fit=crop',
      year: 2020,
      rating: 7.5,
    };
  }
}

export const tmdbService = new TMDBService();
