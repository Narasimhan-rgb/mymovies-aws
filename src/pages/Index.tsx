import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchTrending, fetchTopRated, fetchByGenres, searchMovies, fetchGenres, Movie, Genre } from "@/lib/tmdb";
import MovieCarousel from "@/components/MovieCarousel";
import MovieCard from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function Index() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  const { user } = useAuth();

  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("favorites").select("tmdb_id").eq("user_id", user.id);
    if (data) setFavoriteIds(new Set(data.map((f: any) => f.tmdb_id)));
  }, [user]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (searchQuery) {
          const res = await searchMovies(searchQuery);
          setSearchResults(res.results);
        } else {
          const [t, r, g] = await Promise.all([fetchTrending(), fetchTopRated(), fetchGenres()]);
          setTrending(t.results);
          setTopRated(r.results);
          setGenres(g.genres);
        }
        await loadFavorites();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchQuery, loadFavorites]);

  useEffect(() => {
    if (!selectedGenre) {
      setGenreMovies([]);
      return;
    }
    fetchByGenres([selectedGenre]).then((r) => setGenreMovies(r.results));
  }, [selectedGenre]);

  if (loading) {
    return (
      <div className="pt-24 pb-12 container space-y-8">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <Skeleton key={j} className="w-[180px] h-[310px] rounded-xl shrink-0" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (searchQuery) {
    return (
      <div className="pt-24 pb-12 container">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold mb-6">
          Results for "{searchQuery}"
        </motion.h1>
        {searchResults.length === 0 ? (
          <p className="text-muted-foreground text-center py-20">No movies found</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {searchResults.map((m) => (
              <MovieCard key={m.id} movie={m} isFavorite={favoriteIds.has(m.id)} onToggleFavorite={loadFavorites} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 container space-y-10">
      {/* Hero */}
      {trending[0] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden h-[300px] md:h-[400px]"
        >
          <img
            src={`https://image.tmdb.org/t/p/w1280${trending[0].backdrop_path}`}
            alt={trending[0].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-8 max-w-lg">
            <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk']">{trending[0].title}</h1>
            <p className="text-sm text-foreground/70 mt-2 line-clamp-2">{trending[0].overview}</p>
          </div>
        </motion.div>
      )}

      {/* Genre Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-muted-foreground">Filter:</span>
        <div className="flex gap-2 flex-wrap">
          <Badge
            variant={selectedGenre === null ? "default" : "secondary"}
            className={`cursor-pointer ${selectedGenre === null ? "gradient-primary border-0" : ""}`}
            onClick={() => setSelectedGenre(null)}
          >
            All
          </Badge>
          {genres.slice(0, 10).map((g) => (
            <Badge
              key={g.id}
              variant={selectedGenre === g.id ? "default" : "secondary"}
              className={`cursor-pointer ${selectedGenre === g.id ? "gradient-primary border-0" : ""}`}
              onClick={() => setSelectedGenre(g.id)}
            >
              {g.name}
            </Badge>
          ))}
        </div>
      </div>

      {selectedGenre && genreMovies.length > 0 && (
        <MovieCarousel title="Filtered Results" movies={genreMovies} favoriteIds={favoriteIds} onToggleFavorite={loadFavorites} />
      )}

      <MovieCarousel title="🔥 Trending This Week" movies={trending} favoriteIds={favoriteIds} onToggleFavorite={loadFavorites} />
      <MovieCarousel title="⭐ Top Rated" movies={topRated} favoriteIds={favoriteIds} onToggleFavorite={loadFavorites} />
    </div>
  );
}
