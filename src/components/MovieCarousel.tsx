import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Movie } from "@/lib/tmdb";
import MovieCard from "./MovieCard";

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  favoriteIds?: Set<number>;
  onToggleFavorite?: () => void;
}

export default function MovieCarousel({ title, movies, favoriteIds, onToggleFavorite }: MovieCarouselProps) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth * 0.8;
    ref.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (!movies.length) return null;

  return (
    <section className="relative group/carousel">
      <h2 className="text-xl font-bold font-['Space_Grotesk'] mb-4">{title}</h2>
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div ref={ref} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x">
          {movies.map((movie) => (
            <div key={movie.id} className="snap-start shrink-0 w-[180px]">
              <MovieCard
                movie={movie}
                isFavorite={favoriteIds?.has(movie.id)}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </section>
  );
}
