import { useState } from "react";
import { Heart, Star, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Movie, getImageUrl, genreIdToName } from "@/lib/tmdb";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface MovieCardProps {
  movie: Movie;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  variant?: "card" | "wide";
}

export default function MovieCard({ movie, isFavorite = false, onToggleFavorite, variant = "card" }: MovieCardProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [fav, setFav] = useState(isFavorite);

  const toggleFavorite = async () => {
    if (!user) {
      toast.error("Sign in to save favorites");
      return;
    }
    setSaving(true);
    try {
      if (fav) {
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("tmdb_id", movie.id);
        setFav(false);
        toast.success("Removed from favorites");
      } else {
        await supabase.from("favorites").insert({
          user_id: user.id,
          tmdb_id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          rating: movie.vote_average,
          genres: movie.genre_ids?.map((id) => genreIdToName(id) || String(id)),
          release_year: movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : null,
          overview: movie.overview,
        });
        setFav(true);
        toast.success("Added to favorites!");
      }
      onToggleFavorite?.();
    } catch {
      toast.error("Failed to update favorites");
    } finally {
      setSaving(false);
    }
  };

  const poster = getImageUrl(movie.poster_path);
  const year = movie.release_date?.slice(0, 4);
  const genres = movie.genre_ids?.slice(0, 2).map((id) => genreIdToName(id)).filter(Boolean);

  if (variant === "wide") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 p-4 rounded-xl glass card-hover group"
      >
        <div className="w-28 h-40 shrink-0 rounded-lg overflow-hidden bg-secondary">
          {poster ? (
            <img src={poster} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No Image</div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <h3 className="font-semibold text-lg truncate">{movie.title}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 text-gold">
              <Star className="w-3.5 h-3.5 fill-current" />
              {movie.vote_average.toFixed(1)}
            </span>
            {year && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {year}
              </span>
            )}
          </div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {genres?.map((g) => (
              <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{movie.overview}</p>
          <Button
            size="sm"
            variant={fav ? "default" : "outline"}
            className={`mt-auto self-start ${fav ? "gradient-primary border-0" : ""}`}
            onClick={toggleFavorite}
            disabled={saving}
          >
            <Heart className={`w-3.5 h-3.5 ${fav ? "fill-current" : ""}`} />
            {fav ? "Saved" : "Save"}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative group rounded-xl overflow-hidden bg-card card-hover cursor-pointer"
      style={{ minWidth: 180 }}
    >
      <div className="aspect-[2/3] bg-secondary relative overflow-hidden">
        {poster ? (
          <img src={poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-xs text-foreground/80 line-clamp-3">{movie.overview}</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity ${fav ? "text-primary" : "text-foreground"}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(); }}
          disabled={saving}
        >
          <Heart className={`w-4 h-4 ${fav ? "fill-current" : ""}`} />
        </Button>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm truncate">{movie.title}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="flex items-center gap-1 text-xs text-gold">
            <Star className="w-3 h-3 fill-current" />
            {movie.vote_average.toFixed(1)}
          </span>
          {year && <span className="text-xs text-muted-foreground">{year}</span>}
        </div>
        {genres && genres.length > 0 && (
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {genres.map((g) => (
              <Badge key={g} variant="secondary" className="text-[10px] px-1.5 py-0">{g}</Badge>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
