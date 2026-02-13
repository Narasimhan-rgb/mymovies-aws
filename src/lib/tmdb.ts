import { supabase } from "@/integrations/supabase/client";

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  release_date: string;
  genre_ids: number[];
}

export interface TMDBResponse {
  results: Movie[];
  total_pages: number;
  total_results: number;
  page: number;
}

export interface Genre {
  id: number;
  name: string;
}

const TMDB_IMG = "https://image.tmdb.org/t/p";

export const getImageUrl = (path: string | null, size: string = "w500") =>
  path ? `${TMDB_IMG}/${size}${path}` : null;

export const getBackdropUrl = (path: string | null) =>
  path ? `${TMDB_IMG}/w1280${path}` : null;

async function tmdbCall(action: string, params?: Record<string, any>): Promise<any> {
  const { data, error } = await supabase.functions.invoke("tmdb-proxy", {
    body: { action, params },
  });
  if (error) throw new Error(error.message);
  return data;
}

export const fetchTrending = (page = 1): Promise<TMDBResponse> =>
  tmdbCall("trending", { page });

export const fetchTopRated = (page = 1): Promise<TMDBResponse> =>
  tmdbCall("top_rated", { page });

export const fetchByGenres = (
  genreIds: number[],
  page = 1,
  sortBy = "popularity.desc",
  year?: number,
  minRating?: number
): Promise<TMDBResponse> =>
  tmdbCall("discover", { genre_ids: genreIds, page, sort_by: sortBy, year, min_rating: minRating });

export const searchMovies = (query: string, page = 1): Promise<TMDBResponse> =>
  tmdbCall("search", { query, page });

export const fetchGenres = (): Promise<{ genres: Genre[] }> =>
  tmdbCall("genres");

// Genre name to ID mapping
const GENRE_MAP: Record<string, number> = {
  Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80,
  Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, History: 36,
  Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749,
  "Science Fiction": 878, "TV Movie": 10770, Thriller: 53, War: 10752, Western: 37,
};

export const genreNameToId = (name: string): number | undefined => GENRE_MAP[name];
export const genreIdToName = (id: number): string | undefined =>
  Object.entries(GENRE_MAP).find(([, v]) => v === id)?.[0];
