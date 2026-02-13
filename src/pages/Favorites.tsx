import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, Trash2, RotateCcw, Star, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Favorite {
  id: string;
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  rating: number | null;
  genres: string[] | null;
  release_year: number | null;
  overview: string | null;
  created_at: string;
}

interface HistoryEntry {
  id: string;
  mood_text: string;
  detected_genres: string[];
  created_at: string;
}

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [favRes, histRes] = await Promise.all([
      supabase.from("favorites").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("search_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    if (favRes.data) setFavorites(favRes.data as Favorite[]);
    if (histRes.data) setHistory(histRes.data as HistoryEntry[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    load();
  }, [user]);

  const removeFavorite = async (id: string) => {
    await supabase.from("favorites").delete().eq("id", id);
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    toast.success("Removed from favorites");
  };

  const deleteHistory = async (id: string) => {
    await supabase.from("search_history").delete().eq("id", id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const rerunSearch = (entry: HistoryEntry) => {
    navigate(`/results?genres=${encodeURIComponent(entry.detected_genres.join(","))}&mood=${encodeURIComponent(entry.mood_text)}`);
  };

  if (loading) {
    return (
      <div className="pt-24 pb-12 container space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[2/3] rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-12 container">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold font-['Space_Grotesk'] mb-6">
        Your Collection
      </motion.h1>

      <Tabs defaultValue="favorites">
        <TabsList className="bg-secondary mb-6">
          <TabsTrigger value="favorites" className="gap-1.5">
            <Heart className="w-4 h-4" /> Favorites ({favorites.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <Clock className="w-4 h-4" /> Search History ({history.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="favorites">
          {favorites.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No favorites yet. Start exploring and save movies you love!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <AnimatePresence>
                {favorites.map((fav) => (
                  <motion.div
                    key={fav.id}
                    layout
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group rounded-xl overflow-hidden bg-card card-hover"
                  >
                    <div className="aspect-[2/3] bg-secondary">
                      {fav.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${fav.poster_path}`}
                          alt={fav.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No Image</div>
                      )}
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeFavorite(fav.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm truncate">{fav.title}</h3>
                      <div className="flex items-center justify-between mt-1">
                        {fav.rating && (
                          <span className="flex items-center gap-1 text-xs text-gold">
                            <Star className="w-3 h-3 fill-current" />{Number(fav.rating).toFixed(1)}
                          </span>
                        )}
                        {fav.release_year && (
                          <span className="text-xs text-muted-foreground">{fav.release_year}</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {history.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No search history yet. Try the mood search!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 rounded-xl glass"
                >
                  <div>
                    <p className="font-medium">"{entry.mood_text}"</p>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {entry.detected_genres.map((g) => (
                        <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => rerunSearch(entry)}>
                      <RotateCcw className="w-3.5 h-3.5 mr-1" /> Re-run
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteHistory(entry.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
