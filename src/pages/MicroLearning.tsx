import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Play,
  Pause,
  Volume2,
  Clock,
  ChevronRight,
  Globe,
  Headphones,
  Video,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useLanguage, Language as AppLang } from "@/contexts/LanguageContext";

type ContentLang = "en" | "hi" | "mr";

interface AudioTip {
  id: string;
  title: Record<ContentLang, string>;
  description: Record<ContentLang, string>;
  duration: string;
  category: string;
  completed: boolean;
}

interface VideoCard {
  id: string;
  title: Record<ContentLang, string>;
  description: Record<ContentLang, string>;
  duration: string;
  category: string;
  thumbnail: string;
}

const audioTips: AudioTip[] = [
  {
    id: "a1",
    title: { en: "Breastfeeding Best Practices", hi: "स्तनपान के सर्वोत्तम तरीके", mr: "स्तनपानाच्या सर्वोत्तम पद्धती" },
    description: { en: "Learn the correct latching techniques and feeding schedule for newborns.", hi: "नवजात शिशुओं के लिए सही तरीके और फीडिंग शेड्यूल सीखें।", mr: "नवजात बाळांसाठी योग्य तंत्र आणि आहार वेळापत्रक शिका." },
    duration: "3:45", category: "Nutrition", completed: true,
  },
  {
    id: "a2",
    title: { en: "Identifying Malnutrition Signs", hi: "कुपोषण के लक्षण पहचानें", mr: "कुपोषणाची लक्षणे ओळखा" },
    description: { en: "Key visual and physical signs of malnutrition in children under 5.", hi: "5 साल से कम बच्चों में कुपोषण के प्रमुख लक्षण।", mr: "5 वर्षांखालील मुलांमधील कुपोषणाची प्रमुख लक्षणे." },
    duration: "4:20", category: "Health", completed: false,
  },
  {
    id: "a3",
    title: { en: "ORS Preparation at Home", hi: "घर पर ORS बनाने का तरीका", mr: "घरी ORS तयार करणे" },
    description: { en: "Step-by-step guide to preparing oral rehydration solution at home.", hi: "घर पर ओआरएस बनाने की चरणबद्ध प्रक्रिया।", mr: "घरी ओआरएस तयार करण्याची चरणबद्ध प्रक्रिया." },
    duration: "2:30", category: "First Aid", completed: false,
  },
  {
    id: "a4",
    title: { en: "Immunization Schedule Guide", hi: "टीकाकरण अनुसूची गाइड", mr: "लसीकरण वेळापत्रक मार्गदर्शक" },
    description: { en: "Complete immunization schedule for children from birth to 5 years.", hi: "जन्म से 5 साल तक बच्चों का पूरा टीकाकरण कार्यक्रम।", mr: "जन्मापासून 5 वर्षांपर्यंतच्या मुलांचे संपूर्ण लसीकरण वेळापत्रक." },
    duration: "5:10", category: "Prevention", completed: false,
  },
];

const videoCards: VideoCard[] = [
  {
    id: "v1",
    title: { en: "MUAC Measurement Technique", hi: "MUAC मापन तकनीक", mr: "MUAC मापन तंत्र" },
    description: { en: "Correct way to measure mid-upper arm circumference in children.", hi: "बच्चों में बांह की माप लेने का सही तरीका।", mr: "मुलांमध्ये बाहूचा मध्य-वरचा घेर मोजण्याची योग्य पद्धत." },
    duration: "2:15", category: "Assessment", thumbnail: "📏",
  },
  {
    id: "v2",
    title: { en: "Nutritious Recipe: Khichdi Plus", hi: "पौष्टिक रेसिपी: खिचड़ी प्लस", mr: "पौष्टिक रेसिपी: खिचडी प्लस" },
    description: { en: "Easy recipe for protein-rich khichdi for malnourished children.", hi: "कुपोषित बच्चों के लिए प्रोटीन युक्त खिचड़ी की आसान रेसिपी।", mr: "कुपोषित मुलांसाठी प्रोटीनयुक्त खिचडीची सोपी रेसिपी." },
    duration: "3:40", category: "Nutrition", thumbnail: "🍲",
  },
  {
    id: "v3",
    title: { en: "Growth Chart Reading", hi: "ग्रोथ चार्ट पढ़ना", mr: "ग्रोथ चार्ट वाचणे" },
    description: { en: "How to plot and interpret WHO growth charts accurately.", hi: "WHO ग्रोथ चार्ट को सही तरीके से कैसे पढ़ें।", mr: "WHO ग्रोथ चार्ट अचूकपणे कसे वाचावेत." },
    duration: "4:00", category: "Assessment", thumbnail: "📊",
  },
];

const categories = ["All", "Nutrition", "Health", "First Aid", "Prevention", "Assessment"];

const MicroLearning = () => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"audio" | "video">("audio");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [completedTips, setCompletedTips] = useState<string[]>(["a1"]);

  const filteredAudio = audioTips.filter(
    (tip) => selectedCategory === "All" || tip.category === selectedCategory
  );
  const filteredVideos = videoCards.filter(
    (vid) => selectedCategory === "All" || vid.category === selectedCategory
  );

  const togglePlay = (id: string) => {
    setPlayingAudio(playingAudio === id ? null : id);
  };

  const toggleComplete = (id: string) => {
    setCompletedTips((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const progress = Math.round((completedTips.length / audioTips.length) * 100);

  const cl = lang as ContentLang;

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-health-advanced" /> {t("microLearning")}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">{t("audioTipsGuides")}</p>
          </div>
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">{t("yourProgress")}</span>
          <span className="text-xs font-bold text-health-normal">{progress}% {t("complete")}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full rounded-full bg-health-normal" />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">{completedTips.length} / {audioTips.length} {t("tipsCompleted")}</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "audio" as const, icon: Headphones, labelKey: "audioTips" as const },
          { key: "video" as const, icon: Video, labelKey: "videoGuides" as const },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-health-advanced text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "audio" ? (
          <motion.div key="audio" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="space-y-3">
            {filteredAudio.map((tip, i) => {
              const isPlaying = playingAudio === tip.id;
              const isCompleted = completedTips.includes(tip.id);
              return (
                <motion.div key={tip.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`stat-card ${isCompleted ? "border border-health-normal/30" : ""}`}>
                  <div className="flex items-start gap-3">
                    <button onClick={() => togglePlay(tip.id)} className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${isPlaying ? "bg-health-ai text-primary-foreground scale-105" : "bg-health-ai-bg text-health-ai"}`}>
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{tip.title[cl]}</p>
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-health-normal flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{tip.description[cl]}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="w-3 h-3" /> {tip.duration}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">{tip.category}</span>
                        <button onClick={() => toggleComplete(tip.id)} className={`text-[11px] font-medium ml-auto ${isCompleted ? "text-health-normal" : "text-muted-foreground"}`}>
                          {isCompleted ? `${t("done")} ✓` : t("markDone")}
                        </button>
                      </div>
                      {isPlaying && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <motion.div className="h-full rounded-full bg-health-ai" animate={{ width: ["0%", "100%"] }} transition={{ duration: 10, ease: "linear", repeat: Infinity }} />
                            </div>
                            <Volume2 className="w-3.5 h-3.5 text-health-ai animate-pulse" />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
            {filteredAudio.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No audio tips in this category yet.</div>}
          </motion.div>
        ) : (
          <motion.div key="video" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-3">
            {filteredVideos.map((vid, i) => (
              <motion.div key={vid.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="stat-card cursor-pointer active:scale-[0.98] transition-transform">
                <div className="flex items-start gap-3">
                  <div className="w-20 h-14 rounded-lg bg-health-advanced-bg flex items-center justify-center flex-shrink-0 relative">
                    <span className="text-2xl">{vid.thumbnail}</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-health-advanced/90 flex items-center justify-center shadow-sm">
                        <Play className="w-3.5 h-3.5 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{vid.title[cl]}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{vid.description[cl]}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Clock className="w-3 h-3" /> {vid.duration}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">{vid.category}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </motion.div>
            ))}
            {filteredVideos.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No video guides in this category yet.</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MicroLearning;
