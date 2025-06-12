
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

class GoogleBooksService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/books/v1';

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Google Books API key not found. Book data may be limited.');
    }
  }

  async searchBook(title: string, author?: string): Promise<BookSearchResult> {
    if (!this.apiKey) {
      return this.getDefaultBookData();
    }

    try {
      const query = author ? `${title}+inauthor:${author}` : title;
      const response = await fetch(
        `${this.baseUrl}/volumes?q=${encodeURIComponent(query)}&key=${this.apiKey}&maxResults=1`
      );

      if (!response.ok) {
        throw new Error(`Google Books API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const book = data.items[0].volumeInfo;
        return {
          cover: book.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
          year: book.publishedDate ? new Date(book.publishedDate).getFullYear() : 0,
          rating: book.averageRating || 4.0,
        };
      }

      return this.getDefaultBookData();
    } catch (error) {
      console.error('Error searching book:', error);
      return this.getDefaultBookData();
    }
  }

  async getBookDetails(bookId: string): Promise<BookDetails | null> {
    if (!this.apiKey) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/volumes/${bookId}?key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch book details');
      }

      const data = await response.json();
      const book = data.volumeInfo;

      return {
        id: data.id,
        title: book.title || '',
        authors: book.authors || [],
        genres: book.categories || [],
        year: book.publishedDate ? new Date(book.publishedDate).getFullYear() : 0,
        rating: book.averageRating || 4.0,
        cover: book.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        description: book.description || '',
      };
    } catch (error) {
      console.error('Error fetching book details:', error);
      return null;
    }
  }

  private getDefaultBookData(): BookSearchResult {
    return {
      cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=450&fit=crop',
      year: 2020,
      rating: 4.2,
    };
  }
}

export const googleBooksService = new GoogleBooksService();
