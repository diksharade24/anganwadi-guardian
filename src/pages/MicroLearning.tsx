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

type Language = "english" | "hindi" | "bhojpuri";

const languageLabels: Record<Language, string> = {
  english: "English",
  hindi: "हिन्दी",
  bhojpuri: "भोजपुरी",
};

interface AudioTip {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  duration: string;
  category: string;
  completed: boolean;
}

interface VideoCard {
  id: string;
  title: Record<Language, string>;
  description: Record<Language, string>;
  duration: string;
  category: string;
  thumbnail: string;
}

const audioTips: AudioTip[] = [
  {
    id: "a1",
    title: {
      english: "Breastfeeding Best Practices",
      hindi: "स्तनपान के सर्वोत्तम तरीके",
      bhojpuri: "दूध पियावे के सबसे बढ़िया तरीका",
    },
    description: {
      english: "Learn the correct latching techniques and feeding schedule for newborns.",
      hindi: "नवजात शिशुओं के लिए सही तरीके और फीडिंग शेड्यूल सीखें।",
      bhojpuri: "नया जनमल बच्चा खातिर सही तरीका आ खियावे के समय जानीं।",
    },
    duration: "3:45",
    category: "Nutrition",
    completed: true,
  },
  {
    id: "a2",
    title: {
      english: "Identifying Malnutrition Signs",
      hindi: "कुपोषण के लक्षण पहचानें",
      bhojpuri: "कुपोषण के पहचान कइसे करीं",
    },
    description: {
      english: "Key visual and physical signs of malnutrition in children under 5.",
      hindi: "5 साल से कम बच्चों में कुपोषण के प्रमुख लक्षण।",
      bhojpuri: "5 साल से छोट बच्चा में कुपोषण के निशानी।",
    },
    duration: "4:20",
    category: "Health",
    completed: false,
  },
  {
    id: "a3",
    title: {
      english: "ORS Preparation at Home",
      hindi: "घर पर ORS बनाने का तरीका",
      bhojpuri: "घरे पर ORS कइसे बनाईं",
    },
    description: {
      english: "Step-by-step guide to preparing oral rehydration solution at home.",
      hindi: "घर पर ओआरएस बनाने की चरणबद्ध प्रक्रिया।",
      bhojpuri: "घरे पर ORS बनावे के पूरा तरीका।",
    },
    duration: "2:30",
    category: "First Aid",
    completed: false,
  },
  {
    id: "a4",
    title: {
      english: "Immunization Schedule Guide",
      hindi: "टीकाकरण अनुसूची गाइड",
      bhojpuri: "टीका लगवावे के समय के जानकारी",
    },
    description: {
      english: "Complete immunization schedule for children from birth to 5 years.",
      hindi: "जन्म से 5 साल तक बच्चों का पूरा टीकाकरण कार्यक्रम।",
      bhojpuri: "जनम से 5 साल तक के बच्चा के टीका के पूरा जानकारी।",
    },
    duration: "5:10",
    category: "Prevention",
    completed: false,
  },
];

const videoCards: VideoCard[] = [
  {
    id: "v1",
    title: {
      english: "MUAC Measurement Technique",
      hindi: "MUAC मापन तकनीक",
      bhojpuri: "MUAC नापे के तरीका",
    },
    description: {
      english: "Correct way to measure mid-upper arm circumference in children.",
      hindi: "बच्चों में बांह की माप लेने का सही तरीका।",
      bhojpuri: "बच्चा के बांह के नाप लेवे के सही तरीका।",
    },
    duration: "2:15",
    category: "Assessment",
    thumbnail: "📏",
  },
  {
    id: "v2",
    title: {
      english: "Nutritious Recipe: Khichdi Plus",
      hindi: "पौष्टिक रेसिपी: खिचड़ी प्लस",
      bhojpuri: "पौष्टिक खाना: खिचड़ी प्लस",
    },
    description: {
      english: "Easy recipe for protein-rich khichdi for malnourished children.",
      hindi: "कुपोषित बच्चों के लिए प्रोटीन युक्त खिचड़ी की आसान रेसिपी।",
      bhojpuri: "कमजोर बच्चा खातिर प्रोटीन वाला खिचड़ी बनावे के आसान तरीका।",
    },
    duration: "3:40",
    category: "Nutrition",
    thumbnail: "🍲",
  },
  {
    id: "v3",
    title: {
      english: "Growth Chart Reading",
      hindi: "ग्रोथ चार्ट पढ़ना",
      bhojpuri: "ग्रोथ चार्ट पढ़े के तरीका",
    },
    description: {
      english: "How to plot and interpret WHO growth charts accurately.",
      hindi: "WHO ग्रोथ चार्ट को सही तरीके से कैसे पढ़ें।",
      bhojpuri: "WHO ग्रोथ चार्ट के सही से कइसे पढ़ीं।",
    },
    duration: "4:00",
    category: "Assessment",
    thumbnail: "📊",
  },
];

const categories = ["All", "Nutrition", "Health", "First Aid", "Prevention", "Assessment"];

const MicroLearning = () => {
  const [language, setLanguage] = useState<Language>("english");
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

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-health-advanced" /> Micro Learning
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">Audio tips & video guides</p>
          </div>

          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
            {(Object.keys(languageLabels) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`text-[10px] font-medium px-2 py-1.5 rounded-md transition-all ${
                  language === lang
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {languageLabels[lang]}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="stat-card mb-5"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground">Your Progress</span>
          <span className="text-xs font-bold text-health-normal">{progress}% Complete</span>
        </div>
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full rounded-full bg-health-normal"
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">
          {completedTips.length} of {audioTips.length} tips completed
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "audio" as const, icon: Headphones, label: "Audio Tips" },
          { key: "video" as const, icon: Video, label: "Video Guides" },
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
            {tab.label}
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
          <motion.div
            key="audio"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            className="space-y-3"
          >
            {filteredAudio.map((tip, i) => {
              const isPlaying = playingAudio === tip.id;
              const isCompleted = completedTips.includes(tip.id);
              return (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={`stat-card ${isCompleted ? "border border-health-normal/30" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Play Button */}
                    <button
                      onClick={() => togglePlay(tip.id)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                        isPlaying
                          ? "bg-health-ai text-primary-foreground scale-105"
                          : "bg-health-ai-bg text-health-ai"
                      }`}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{tip.title[language]}</p>
                        {isCompleted && <CheckCircle2 className="w-4 h-4 text-health-normal flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {tip.description[language]}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Clock className="w-3 h-3" /> {tip.duration}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                          {tip.category}
                        </span>
                        <button
                          onClick={() => toggleComplete(tip.id)}
                          className={`text-[11px] font-medium ml-auto ${
                            isCompleted ? "text-health-normal" : "text-muted-foreground"
                          }`}
                        >
                          {isCompleted ? "Done ✓" : "Mark done"}
                        </button>
                      </div>

                      {/* Playback indicator */}
                      {isPlaying && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-2.5"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-health-ai"
                                animate={{ width: ["0%", "100%"] }}
                                transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                              />
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

            {filteredAudio.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No audio tips in this category yet.
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="video"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            className="space-y-3"
          >
            {filteredVideos.map((vid, i) => (
              <motion.div
                key={vid.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="stat-card cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="w-20 h-14 rounded-lg bg-health-advanced-bg flex items-center justify-center flex-shrink-0 relative">
                    <span className="text-2xl">{vid.thumbnail}</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-7 h-7 rounded-full bg-health-advanced/90 flex items-center justify-center shadow-sm">
                        <Play className="w-3.5 h-3.5 text-primary-foreground ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{vid.title[language]}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {vid.description[language]}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="w-3 h-3" /> {vid.duration}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                        {vid.category}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </motion.div>
            ))}

            {filteredVideos.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">
                No video guides in this category yet.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="health-badge-ai p-3 rounded-xl mt-6 flex items-center gap-3"
      >
        <Globe className="w-5 h-5 text-health-ai flex-shrink-0" />
        <p className="text-xs text-health-ai-foreground">
          {language === "english"
            ? "All content available in Hindi, English & Bhojpuri. Switch using the toggle above."
            : language === "hindi"
            ? "सभी सामग्री हिंदी, अंग्रेज़ी और भोजपुरी में उपलब्ध है।"
            : "सगरी जानकारी हिंदी, अंग्रेज़ी आ भोजपुरी में मौजूद बा।"}
        </p>
      </motion.div>
    </div>
  );
};

export default MicroLearning;
