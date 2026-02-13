import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const MOOD_CHIPS = [
  { label: "😊 Happy", value: "I'm feeling happy and joyful" },
  { label: "😢 Sad", value: "I'm feeling sad and melancholy" },
  { label: "💕 Romantic", value: "I'm in a romantic mood" },
  { label: "😰 Stressed", value: "I'm feeling stressed and need to relax" },
  { label: "😴 Bored", value: "I'm bored and need something exciting" },
  { label: "🎉 Excited", value: "I'm feeling excited and energetic" },
  { label: "💪 Motivated", value: "I need motivation and inspiration" },
  { label: "😨 Scared", value: "I'm in the mood for something thrilling" },
];

export default function MoodInput() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mood, setMood] = useState("");
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<string[] | null>(null);
  const [reasoning, setReasoning] = useState("");

  const analyzeMood = async (moodText: string) => {
    if (!moodText.trim()) return;
    setLoading(true);
    setGenres(null);
    try {
      const { data, error } = await supabase.functions.invoke("mood-to-genre", {
        body: { mood: moodText },
      });
      if (error) throw error;
      setGenres(data.genres);
      setReasoning(data.reasoning);
    } catch (e: any) {
      toast.error(e.message || "Failed to analyze mood");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => analyzeMood(mood);

  const confirmGenres = async () => {
    if (!genres) return;
    // Save to history if logged in
    if (user) {
      await supabase.from("search_history").insert({
        user_id: user.id,
        mood_text: mood,
        detected_genres: genres,
      });
    }
    navigate(`/results?genres=${encodeURIComponent(genres.join(","))}&mood=${encodeURIComponent(mood)}`);
  };

  const removeGenre = (g: string) => {
    if (genres) setGenres(genres.filter((x) => x !== g));
  };

  return (
    <div className="pt-24 pb-12 container max-w-2xl min-h-screen flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold font-['Space_Grotesk'] gradient-text">
            What's your mood?
          </h1>
          <p className="text-muted-foreground mt-3">Tell us how you're feeling and we'll find the perfect movies</p>
        </div>

        {/* Quick Chips */}
        <div className="flex flex-wrap gap-2 justify-center">
          {MOOD_CHIPS.map((chip) => (
            <Badge
              key={chip.label}
              variant="secondary"
              className="cursor-pointer text-sm px-4 py-2 hover:bg-primary/10 hover:text-primary transition-colors"
              onClick={() => {
                setMood(chip.value);
                analyzeMood(chip.value);
              }}
            >
              {chip.label}
            </Badge>
          ))}
        </div>

        {/* Text Input */}
        <div className="space-y-4">
          <Textarea
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="How are you feeling today?"
            className="min-h-[120px] text-lg bg-secondary border-border/50 resize-none text-center"
          />
          <Button
            size="lg"
            className="gradient-primary border-0 text-lg px-8"
            onClick={handleSubmit}
            disabled={loading || !mood.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Find My Movies
              </>
            )}
          </Button>
        </div>

        {/* Loading Animation */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-8"
            >
              <div className="w-16 h-16 rounded-full gradient-primary animate-pulse-glow flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <p className="text-muted-foreground">Analyzing your mood...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Genre Results */}
        <AnimatePresence>
          {genres && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 glass p-6 rounded-2xl"
            >
              <h3 className="font-semibold text-lg">Detected Genres</h3>
              <p className="text-sm text-muted-foreground">{reasoning}</p>
              <div className="flex gap-2 flex-wrap justify-center">
                {genres.map((g) => (
                  <Badge key={g} className="gradient-primary border-0 text-sm px-4 py-1.5 cursor-pointer" onClick={() => removeGenre(g)}>
                    {g} ✕
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Click a genre to remove it</p>
              <Button size="lg" className="gradient-primary border-0" onClick={confirmGenres} disabled={genres.length === 0}>
                Show Movies →
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
