import { prisma } from '@/lib/db/prisma';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  runtime: number | null;
  genres: Array<{ id: number; name: string }>;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
    }>;
  };
}

export interface TMDBSearchResult {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBVideo {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
  published_at: string;
}

class TMDBProvider {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.TMDB_API_KEY || '';
    this.baseUrl = TMDB_BASE_URL;

    if (!this.apiKey) {
      console.warn('TMDB_API_KEY is not set. Movie data will not be available.');
    }
  }

  private async fetchWithRetry<T>(
    endpoint: string,
    retries = 3,
    delay = 1000
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error('TMDB_API_KEY is not configured. Please set it in your .env file.');
    }

    const url = `${this.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${this.apiKey}`;

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limited, wait and retry
            await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
            continue;
          }
          
          // Try to get error details from response
          let errorMessage = `TMDB API error: ${response.status} ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData.status_message) {
              errorMessage = `TMDB API error: ${errorData.status_message} (${response.status})`;
            }
          } catch {
            // If we can't parse error JSON, use default message
          }
          
          throw new Error(errorMessage);
        }

        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
      }
    }

    throw new Error('Failed to fetch from TMDB API after retries');
  }

  async getTrending(page = 1): Promise<TMDBSearchResult> {
    return this.fetchWithRetry<TMDBSearchResult>(`/trending/movie/week?page=${page}`);
  }

  async getTopRated(page = 1): Promise<TMDBSearchResult> {
    return this.fetchWithRetry<TMDBSearchResult>(`/movie/top_rated?page=${page}`);
  }

  async searchMovies(query: string, page = 1): Promise<TMDBSearchResult> {
    const encodedQuery = encodeURIComponent(query);
    return this.fetchWithRetry<TMDBSearchResult>(
      `/search/movie?query=${encodedQuery}&page=${page}`
    );
  }

  async getMovieDetails(tmdbId: number): Promise<TMDBMovie> {
    return this.fetchWithRetry<TMDBMovie>(
      `/movie/${tmdbId}?append_to_response=credits`
    );
  }

  async getMovieVideos(tmdbId: number) {
    return this.fetchWithRetry<{ id: number; results: TMDBVideo[] }>(
      `/movie/${tmdbId}/videos`
    );
  }

  async getMovieCredits(tmdbId: number) {
    return this.fetchWithRetry(`/movie/${tmdbId}/credits`);
  }

  async getSimilarMovies(tmdbId: number, page = 1): Promise<TMDBSearchResult> {
    return this.fetchWithRetry<TMDBSearchResult>(
      `/movie/${tmdbId}/similar?page=${page}`
    );
  }

  async getPersonMovieCredits(personId: number) {
    return this.fetchWithRetry<{ cast: TMDBMovie[] }>(
      `/person/${personId}/movie_credits`
    );
  }

  async getPersonDetails(personId: number) {
    return this.fetchWithRetry<{
      id: number;
      name: string;
      biography: string;
      profile_path: string | null;
      place_of_birth: string | null;
      birthday: string | null;
    }>(`/person/${personId}`);
  }

  getImageUrl(path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }

  getPosterUrl(path: string | null, size: 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string | null {
    if (!path) return null;
    return `${TMDB_IMAGE_BASE}/${size}${path}`;
  }
}

export const tmdb = new TMDBProvider();
