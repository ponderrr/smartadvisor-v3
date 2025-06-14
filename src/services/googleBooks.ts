
export interface BookSearchResult {
  cover: string;
  year: number;
  rating: number;
}

export interface BookDetails {
  id: string;
  title: string;
  authors: string[];
  genres: string[];
  year: number;
  rating: number;
  cover: string;
  description: string;
}

interface GoogleBooksResponse {
  items?: Array<{
    id: string;
    volumeInfo: {
      title: string;
      authors?: string[];
      categories?: string[];
      publishedDate?: string;
      averageRating?: number;
      description?: string;
      imageLinks?: {
        thumbnail?: string;
        smallThumbnail?: string;
      };
    };
  }>;
}

class GoogleBooksService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/books/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Google Books API key not found. Book data will use fallback images and basic information.');
    }
  }

  /**
   * Search for a book by title and optional author
   */
  async searchBook(title: string, author?: string): Promise<BookSearchResult> {
    if (!this.apiKey) {
      console.warn('Google Books API key missing, using default book data');
      return this.getDefaultBookData();
    }

    try {
      const query = author ? `${title}+inauthor:${author}` : title;
      const searchUrl = `${this.baseUrl}/volumes?q=${encodeURIComponent(query)}&key=${this.apiKey}&maxResults=1&printType=books`;
      
      const response = await fetch(searchUrl);

      if (!response.ok) {
        console.error(`Google Books API error: ${response.status} ${response.statusText}`);
        return this.getDefaultBookData();
      }

      const data: GoogleBooksResponse = await response.json();
      
      if (data.items && data.items.length > 0) {
        const book = data.items[0].volumeInfo;
        
        return {
          cover: this.getBookCoverUrl(book.imageLinks?.thumbnail),
          year: book.publishedDate ? new Date(book.publishedDate).getFullYear() : new Date().getFullYear(),
          rating: book.averageRating || 4.2,
        };
      }

      console.log(`No Google Books results found for: ${title}${author ? ` by ${author}` : ''}`);
      return this.getDefaultBookData();
    } catch (error) {
      console.error('Error searching book on Google Books:', error);
      return this.getDefaultBookData();
    }
  }

  /**
   * Get detailed book information by Google Books ID
   */
  async getBookDetails(bookId: string): Promise<BookDetails | null> {
    if (!this.apiKey) {
      console.warn('Google Books API key missing, cannot fetch detailed book information');
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/volumes/${bookId}?key=${this.apiKey}`
      );

      if (!response.ok) {
        console.error('Failed to fetch detailed book information from Google Books');
        return null;
      }

      const data = await response.json();
      const book = data.volumeInfo;

      return {
        id: data.id,
        title: book.title || 'Unknown Title',
        authors: book.authors || ['Unknown Author'],
        genres: book.categories || [],
        year: book.publishedDate ? new Date(book.publishedDate).getFullYear() : new Date().getFullYear(),
        rating: book.averageRating || 4.2,
        cover: this.getBookCoverUrl(book.imageLinks?.thumbnail),
        description: book.description || 'No description available.',
      };
    } catch (error) {
      console.error('Error fetching detailed book information:', error);
      return null;
    }
  }

  /**
   * Process book cover URL with fallback
   */
  private getBookCoverUrl(thumbnailUrl?: string): string {
    if (thumbnailUrl) {
      // Ensure HTTPS and higher quality
      return thumbnailUrl.replace('http:', 'https:').replace('&zoom=1', '&zoom=2');
    }
    return this.getDefaultBookData().cover;
  }

  /**
   * Fallback data when Google Books API is unavailable or returns no results
   */
  private getDefaultBookData(): BookSearchResult {
    return {
      cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop',
      year: new Date().getFullYear(),
      rating: 4.2,
    };
  }
}

export const googleBooksService = new GoogleBooksService();
