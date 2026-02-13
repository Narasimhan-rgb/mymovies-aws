import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchByGenres, Movie, genreNameToId } from "@/lib/tmdb";
import MovieCard from "@/components/MovieCard";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function MoodResults() {
  const [searchParams] = useSearchParams();
  const genreNames = searchParams.get("genres")?.split(",") || [];
  const mood = searchParams.get("mood") || "";
  const { user } = useAuth();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loadingMore, setLoadingMore] = useState(false);

  const genreIds = genreNames.map(genreNameToId).filter(Boolean) as number[];

  const loadFavorites = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("favorites").select("tmdb_id").eq("user_id", user.id);
    if (data) setFavoriteIds(new Set(data.map((f: any) => f.tmdb_id)));
  }, [user]);

  const loadMovies = useCallback(async (p: number, sort: string, append = false) => {
    if (genreIds.length === 0) return;
    append ? setLoadingMore(true) : setLoading(true);
    try {
      const res = await fetchByGenres(genreIds, p, sort);
      setMovies((prev) => (append ? [...prev, ...res.results] : res.results));
      setTotalPages(res.total_pages);
      setPage(p);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [genreIds.join(",")]);

  useEffect(() => {
    loadMovies(1, sortBy);
    loadFavorites();
  }, [sortBy, loadFavorites]);

  return (
    <div className="pt-24 pb-12 container space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/mood">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold font-['Space_Grotesk']">
            Movies for Your Mood
          </motion.h1>
          {mood && <p className="text-sm text-muted-foreground">"{mood}"</p>}
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2 flex-wrap">
          {genreNames.map((g) => (
            <Badge key={g} className="gradient-primary border-0">{g}</Badge>
          ))}
        </div>
        <Select value={sortBy} onValueChange={(v) => { setSortBy(v); }}>
          <SelectTrigger className="w-[180px] bg-secondary">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popularity.desc">Most Popular</SelectItem>
            <SelectItem value="vote_average.desc">Highest Rated</SelectItem>
            <SelectItem value="primary_release_date.desc">Newest First</SelectItem>
            <SelectItem value="primary_release_date.asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <p className="text-center text-muted-foreground py-20">No movies found for these genres</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((m) => (
              <MovieCard key={m.id} movie={m} isFavorite={favoriteIds.has(m.id)} onToggleFavorite={loadFavorites} />
            ))}
          </div>
          {page < totalPages && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={() => loadMovies(page + 1, sortBy, true)}
                disabled={loadingMore}
              >
                {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
