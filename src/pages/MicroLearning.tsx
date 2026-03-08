import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Play, Pause, Volume2, Clock, ChevronRight,
  Headphones, Video, Star, CheckCircle2, Trophy, Award,
  Zap, Target, Brain, Heart, Shield, Sparkles,
} from "lucide-react";
import { useLanguage, Language as AppLang } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";

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

interface Quiz {
  id: string;
  title: Record<ContentLang, string>;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  xp: number;
  questions: {
    question: Record<ContentLang, string>;
    options: Record<ContentLang, string[]>;
    correctIndex: number;
  }[];
}

interface BadgeDef {
  id: string;
  icon: React.ReactNode;
  title: Record<ContentLang, string>;
  description: Record<ContentLang, string>;
  condition: string;
  color: string;
}

const audioTips: AudioTip[] = [
  { id: "a1", title: { en: "Breastfeeding Best Practices", hi: "स्तनपान के सर्वोत्तम तरीके", mr: "स्तनपानाच्या सर्वोत्तम पद्धती" }, description: { en: "Learn the correct latching techniques and feeding schedule for newborns.", hi: "नवजात शिशुओं के लिए सही तरीके और फीडिंग शेड्यूल सीखें।", mr: "नवजात बाळांसाठी योग्य तंत्र आणि आहार वेळापत्रक शिका." }, duration: "3:45", category: "Nutrition", completed: true },
  { id: "a2", title: { en: "Identifying Malnutrition Signs", hi: "कुपोषण के लक्षण पहचानें", mr: "कुपोषणाची लक्षणे ओळखा" }, description: { en: "Key visual and physical signs of malnutrition in children under 5.", hi: "5 साल से कम बच्चों में कुपोषण के प्रमुख लक्षण।", mr: "5 वर्षांखालील मुलांमधील कुपोषणाची प्रमुख लक्षणे." }, duration: "4:20", category: "Health", completed: false },
  { id: "a3", title: { en: "ORS Preparation at Home", hi: "घर पर ORS बनाने का तरीका", mr: "घरी ORS तयार करणे" }, description: { en: "Step-by-step guide to preparing oral rehydration solution at home.", hi: "घर पर ओआरएस बनाने की चरणबद्ध प्रक्रिया।", mr: "घरी ओआरएस तयार करण्याची चरणबद्ध प्रक्रिया." }, duration: "2:30", category: "First Aid", completed: false },
  { id: "a4", title: { en: "Immunization Schedule Guide", hi: "टीकाकरण अनुसूची गाइड", mr: "लसीकरण वेळापत्रक मार्गदर्शक" }, description: { en: "Complete immunization schedule for children from birth to 5 years.", hi: "जन्म से 5 साल तक बच्चों का पूरा टीकाकरण कार्यक्रम।", mr: "जन्मापासून 5 वर्षांपर्यंतच्या मुलांचे संपूर्ण लसीकरण वेळापत्रक." }, duration: "5:10", category: "Prevention", completed: false },
];

const videoCards: VideoCard[] = [
  { id: "v1", title: { en: "MUAC Measurement Technique", hi: "MUAC मापन तकनीक", mr: "MUAC मापन तंत्र" }, description: { en: "Correct way to measure mid-upper arm circumference in children.", hi: "बच्चों में बांह की माप लेने का सही तरीका।", mr: "मुलांमध्ये बाहूचा मध्य-वरचा घेर मोजण्याची योग्य पद्धत." }, duration: "2:15", category: "Assessment", thumbnail: "📏" },
  { id: "v2", title: { en: "Nutritious Recipe: Khichdi Plus", hi: "पौष्टिक रेसिपी: खिचड़ी प्लस", mr: "पौष्टिक रेसिपी: खिचडी प्लस" }, description: { en: "Easy recipe for protein-rich khichdi for malnourished children.", hi: "कुपोषित बच्चों के लिए प्रोटीन युक्त खिचड़ी की आसान रेसिपी।", mr: "कुपोषित मुलांसाठी प्रोटीनयुक्त खिचडीची सोपी रेसिपी." }, duration: "3:40", category: "Nutrition", thumbnail: "🍲" },
  { id: "v3", title: { en: "Growth Chart Reading", hi: "ग्रोथ चार्ट पढ़ना", mr: "ग्रोथ चार्ट वाचणे" }, description: { en: "How to plot and interpret WHO growth charts accurately.", hi: "WHO ग्रोथ चार्ट को सही तरीके से कैसे पढ़ें।", mr: "WHO ग्रोथ चार्ट अचूकपणे कसे वाचावेत." }, duration: "4:00", category: "Assessment", thumbnail: "📊" },
];

const quizzes: Quiz[] = [
  {
    id: "q1", title: { en: "Nutrition Basics", hi: "पोषण मूलभूत", mr: "पोषण मूलभूत" }, category: "Nutrition", difficulty: "easy", xp: 50,
    questions: [
      { question: { en: "At what age should complementary feeding start?", hi: "पूरक आहार कब शुरू करना चाहिए?", mr: "पूरक आहार कधी सुरू करावा?" }, options: { en: ["4 months", "6 months", "8 months", "12 months"], hi: ["4 महीने", "6 महीने", "8 महीने", "12 महीने"], mr: ["4 महिने", "6 महिने", "8 महिने", "12 महिने"] }, correctIndex: 1 },
      { question: { en: "Which nutrient is most important for brain development?", hi: "मस्तिष्क विकास के लिए कौन सा पोषक तत्व सबसे महत्वपूर्ण है?", mr: "मेंदूच्या विकासासाठी कोणते पोषक तत्व सर्वात महत्वाचे आहे?" }, options: { en: ["Iron", "Calcium", "Vitamin C", "Sodium"], hi: ["आयरन", "कैल्शियम", "विटामिन C", "सोडियम"], mr: ["लोह", "कॅल्शियम", "व्हिटॅमिन C", "सोडियम"] }, correctIndex: 0 },
      { question: { en: "How many times should a 9-month-old eat per day?", hi: "9 महीने के बच्चे को दिन में कितनी बार खाना देना चाहिए?", mr: "9 महिन्यांच्या बाळाला दिवसातून किती वेळा खायला द्यावे?" }, options: { en: ["2 times", "3-4 times", "1 time", "6 times"], hi: ["2 बार", "3-4 बार", "1 बार", "6 बार"], mr: ["2 वेळा", "3-4 वेळा", "1 वेळ", "6 वेळा"] }, correctIndex: 1 },
    ],
  },
  {
    id: "q2", title: { en: "Malnutrition Detection", hi: "कुपोषण पहचान", mr: "कुपोषण ओळख" }, category: "Health", difficulty: "medium", xp: 75,
    questions: [
      { question: { en: "What MUAC reading indicates Severe Acute Malnutrition?", hi: "कौन सी MUAC रीडिंग गंभीर कुपोषण दर्शाती है?", mr: "कोणते MUAC वाचन गंभीर कुपोषण दर्शवते?" }, options: { en: ["< 11.5 cm", "< 12.5 cm", "< 13.5 cm", "< 14 cm"], hi: ["< 11.5 सेमी", "< 12.5 सेमी", "< 13.5 सेमी", "< 14 सेमी"], mr: ["< 11.5 सेमी", "< 12.5 सेमी", "< 13.5 सेमी", "< 14 सेमी"] }, correctIndex: 0 },
      { question: { en: "Bilateral pitting edema is a sign of?", hi: "द्विपक्षीय पिटिंग एडिमा किसका लक्षण है?", mr: "द्विपक्षीय पिटिंग एडिमा कशाचे लक्षण आहे?" }, options: { en: ["Kwashiorkor", "Marasmus", "Rickets", "Anemia"], hi: ["क्वाशियोरकोर", "मरास्मस", "रिकेट्स", "एनीमिया"], mr: ["क्वाशिओर्कोर", "मरास्मस", "रिकेट्स", "अॅनिमिया"] }, correctIndex: 0 },
      { question: { en: "What is the Z-score threshold for stunting?", hi: "स्टंटिंग के लिए Z-स्कोर सीमा क्या है?", mr: "स्टंटिंगसाठी Z-स्कोर मर्यादा काय आहे?" }, options: { en: ["< -1", "< -2", "< -3", "< 0"], hi: ["< -1", "< -2", "< -3", "< 0"], mr: ["< -1", "< -2", "< -3", "< 0"] }, correctIndex: 1 },
    ],
  },
  {
    id: "q3", title: { en: "Immunization Mastery", hi: "टीकाकरण विशेषज्ञता", mr: "लसीकरण प्रभुत्व" }, category: "Prevention", difficulty: "hard", xp: 100,
    questions: [
      { question: { en: "Which vaccine is given at birth?", hi: "जन्म के समय कौन सा टीका दिया जाता है?", mr: "जन्माच्या वेळी कोणते लस दिले जाते?" }, options: { en: ["BCG + OPV-0 + Hep B", "DPT", "MMR", "Rotavirus"], hi: ["BCG + OPV-0 + Hep B", "DPT", "MMR", "रोटावायरस"], mr: ["BCG + OPV-0 + Hep B", "DPT", "MMR", "रोटाव्हायरस"] }, correctIndex: 0 },
      { question: { en: "At what age is the Measles-Rubella vaccine first given?", hi: "खसरा-रूबेला का टीका पहली बार कब दिया जाता है?", mr: "गोवर-रुबेला लस प्रथम कधी दिली जाते?" }, options: { en: ["6 months", "9 months", "12 months", "15 months"], hi: ["6 महीने", "9 महीने", "12 महीने", "15 महीने"], mr: ["6 महिने", "9 महिने", "12 महिने", "15 महिने"] }, correctIndex: 1 },
      { question: { en: "How many doses of DPT are in the primary series?", hi: "प्राथमिक श्रृंखला में DPT की कितनी खुराक हैं?", mr: "प्राथमिक मालिकेत DPT चे किती डोस आहेत?" }, options: { en: ["2", "3", "4", "5"], hi: ["2", "3", "4", "5"], mr: ["2", "3", "4", "5"] }, correctIndex: 1 },
    ],
  },
];

const badgeDefs: BadgeDef[] = [
  { id: "b1", icon: <Zap className="w-6 h-6" />, title: { en: "First Steps", hi: "पहला कदम", mr: "पहिले पाऊल" }, description: { en: "Complete your first quiz", hi: "अपनी पहली क्विज़ पूरी करें", mr: "तुमची पहिली क्विज पूर्ण करा" }, condition: "first_quiz", color: "bg-health-risk" },
  { id: "b2", icon: <Star className="w-6 h-6" />, title: { en: "Perfect Score", hi: "परफेक्ट स्कोर", mr: "परिपूर्ण गुण" }, description: { en: "Score 100% on any quiz", hi: "किसी भी क्विज़ में 100% स्कोर करें", mr: "कोणत्याही क्विजमध्ये 100% गुण मिळवा" }, condition: "perfect_score", color: "bg-health-normal" },
  { id: "b3", icon: <Brain className="w-6 h-6" />, title: { en: "Knowledge Seeker", hi: "ज्ञान साधक", mr: "ज्ञान साधक" }, description: { en: "Complete all audio tips", hi: "सभी ऑडियो टिप्स पूरी करें", mr: "सर्व ऑडिओ टिप्स पूर्ण करा" }, condition: "all_audio", color: "bg-health-ai" },
  { id: "b4", icon: <Trophy className="w-6 h-6" />, title: { en: "Quiz Champion", hi: "क्विज़ चैंपियन", mr: "क्विज चँपियन" }, description: { en: "Complete all quizzes", hi: "सभी क्विज़ पूरी करें", mr: "सर्व क्विज पूर्ण करा" }, condition: "all_quizzes", color: "bg-health-advanced" },
  { id: "b5", icon: <Shield className="w-6 h-6" />, title: { en: "Health Guardian", hi: "स्वास्थ्य रक्षक", mr: "आरोग्य रक्षक" }, description: { en: "Earn 200+ XP points", hi: "200+ XP अंक अर्जित करें", mr: "200+ XP गुण मिळवा" }, condition: "xp_200", color: "bg-health-severe" },
  { id: "b6", icon: <Heart className="w-6 h-6" />, title: { en: "Dedicated Learner", hi: "समर्पित शिक्षार्थी", mr: "समर्पित शिकणारा" }, description: { en: "3-day learning streak", hi: "3-दिन की लर्निंग स्ट्रीक", mr: "3-दिवसांची शिकण्याची मालिका" }, condition: "streak_3", color: "bg-primary" },
];

const categories = ["All", "Nutrition", "Health", "First Aid", "Prevention", "Assessment"];

const difficultyColors = {
  easy: "text-health-normal bg-health-normal-bg",
  medium: "text-health-risk-foreground bg-health-risk-bg",
  hard: "text-health-severe-foreground bg-health-severe-bg",
};

const MicroLearning = () => {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"audio" | "video" | "quiz" | "badges">("audio");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [completedTips, setCompletedTips] = useState<string[]>(() => {
    const saved = localStorage.getItem("completedTips");
    return saved ? JSON.parse(saved) : ["a1"];
  });

  // Quiz state
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Gamification state (persisted)
  const [totalXP, setTotalXP] = useState(() => {
    return parseInt(localStorage.getItem("trainingXP") || "0");
  });
  const [completedQuizzes, setCompletedQuizzes] = useState<string[]>(() => {
    const saved = localStorage.getItem("completedQuizzes");
    return saved ? JSON.parse(saved) : [];
  });
  const [perfectQuizzes, setPerfectQuizzes] = useState<string[]>(() => {
    const saved = localStorage.getItem("perfectQuizzes");
    return saved ? JSON.parse(saved) : [];
  });
  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem("learningStreak") || "1");
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem("completedTips", JSON.stringify(completedTips));
  }, [completedTips]);
  useEffect(() => {
    localStorage.setItem("trainingXP", totalXP.toString());
  }, [totalXP]);
  useEffect(() => {
    localStorage.setItem("completedQuizzes", JSON.stringify(completedQuizzes));
  }, [completedQuizzes]);
  useEffect(() => {
    localStorage.setItem("perfectQuizzes", JSON.stringify(perfectQuizzes));
  }, [perfectQuizzes]);

  const cl = lang as ContentLang;

  // Badge unlock logic
  const earnedBadges = badgeDefs.filter((b) => {
    switch (b.condition) {
      case "first_quiz": return completedQuizzes.length >= 1;
      case "perfect_score": return perfectQuizzes.length >= 1;
      case "all_audio": return completedTips.length >= audioTips.length;
      case "all_quizzes": return completedQuizzes.length >= quizzes.length;
      case "xp_200": return totalXP >= 200;
      case "streak_3": return streak >= 3;
      default: return false;
    }
  });

  const level = Math.floor(totalXP / 100) + 1;
  const xpInLevel = totalXP % 100;

  const filteredAudio = audioTips.filter((tip) => selectedCategory === "All" || tip.category === selectedCategory);
  const filteredVideos = videoCards.filter((vid) => selectedCategory === "All" || vid.category === selectedCategory);
  const filteredQuizzes = quizzes.filter((q) => selectedCategory === "All" || q.category === selectedCategory);

  const togglePlay = (id: string) => setPlayingAudio(playingAudio === id ? null : id);
  const toggleComplete = (id: string) => {
    setCompletedTips((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  };

  const startQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setQuizScore(0);
    setQuizFinished(false);
  };

  const submitAnswer = () => {
    if (selectedAnswer === null || !activeQuiz) return;
    setShowResult(true);
    if (selectedAnswer === activeQuiz.questions[currentQ].correctIndex) {
      setQuizScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQ + 1 < activeQuiz.questions.length) {
      setCurrentQ((q) => q + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz finished
      setQuizFinished(true);
      const isPerfect = quizScore + (selectedAnswer === activeQuiz.questions[currentQ].correctIndex ? 1 : 0) === activeQuiz.questions.length;
      const earnedXP = Math.round(activeQuiz.xp * ((quizScore + (selectedAnswer === activeQuiz.questions[currentQ].correctIndex ? 1 : 0)) / activeQuiz.questions.length));
      setTotalXP((x) => x + earnedXP);
      if (!completedQuizzes.includes(activeQuiz.id)) {
        setCompletedQuizzes((prev) => [...prev, activeQuiz.id]);
      }
      if (isPerfect && !perfectQuizzes.includes(activeQuiz.id)) {
        setPerfectQuizzes((prev) => [...prev, activeQuiz.id]);
      }
    }
  };

  const progress = Math.round((completedTips.length / audioTips.length) * 100);

  // Quiz UI
  if (activeQuiz && !quizFinished) {
    const q = activeQuiz.questions[currentQ];
    const finalScore = quizScore + (showResult && selectedAnswer === q.correctIndex ? 1 : 0);
    return (
      <div className="page-container">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Quiz header */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setActiveQuiz(null)} className="text-sm font-medium text-muted-foreground">← Back</button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-health-advanced">{activeQuiz.xp} XP</span>
              <span className="text-xs text-muted-foreground">Q{currentQ + 1}/{activeQuiz.questions.length}</span>
            </div>
          </div>

          <h3 className="text-lg font-bold mb-1">{activeQuiz.title[cl]}</h3>
          <Progress value={((currentQ + (showResult ? 1 : 0)) / activeQuiz.questions.length) * 100} className="h-2 mb-6" />

          {/* Question */}
          <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="stat-card mb-4">
            <p className="text-sm font-semibold mb-4">{q.question[cl]}</p>
            <div className="space-y-2.5">
              {q.options[cl].map((opt, i) => {
                let optClass = "border-border bg-secondary/50 hover:bg-secondary";
                if (showResult) {
                  if (i === q.correctIndex) optClass = "border-health-normal bg-health-normal-bg";
                  else if (i === selectedAnswer) optClass = "border-health-severe bg-health-severe-bg";
                } else if (i === selectedAnswer) {
                  optClass = "border-primary bg-primary/10";
                }
                return (
                  <button
                    key={i}
                    onClick={() => !showResult && setSelectedAnswer(i)}
                    disabled={showResult}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${optClass}`}
                  >
                    <span className="text-muted-foreground mr-2">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                    {showResult && i === q.correctIndex && <CheckCircle2 className="w-4 h-4 inline ml-2 text-health-normal" />}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Action */}
          {!showResult ? (
            <button
              onClick={submitAnswer}
              disabled={selectedAnswer === null}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground disabled:opacity-40 transition-all"
            >
              Check Answer
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              className="w-full py-3 rounded-xl font-semibold text-sm bg-health-advanced text-primary-foreground transition-all"
            >
              {currentQ + 1 < activeQuiz.questions.length ? "Next Question →" : "See Results 🎉"}
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  // Quiz results
  if (activeQuiz && quizFinished) {
    const totalQs = activeQuiz.questions.length;
    const pct = Math.round((quizScore / totalQs) * 100);
    const earnedXP = Math.round(activeQuiz.xp * (quizScore / totalQs));
    return (
      <div className="page-container">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center pt-8">
          <div className="w-20 h-20 rounded-full bg-health-advanced-bg flex items-center justify-center mx-auto mb-4">
            {pct === 100 ? <Trophy className="w-10 h-10 text-health-risk" /> : pct >= 60 ? <Star className="w-10 h-10 text-health-advanced" /> : <Target className="w-10 h-10 text-muted-foreground" />}
          </div>
          <h2 className="text-2xl font-bold mb-1">
            {pct === 100 ? "🎉 Perfect!" : pct >= 60 ? "👏 Well Done!" : "📚 Keep Learning!"}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">{activeQuiz.title[cl]}</p>

          <div className="stat-card mb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{quizScore}/{totalQs}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-health-advanced">+{earnedXP}</p>
                <p className="text-xs text-muted-foreground">XP Earned</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-health-normal">{pct}%</p>
                <p className="text-xs text-muted-foreground">Score</p>
              </div>
            </div>
          </div>

          {pct === 100 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="stat-card border-2 border-health-normal/30 mb-4">
              <div className="flex items-center gap-3">
                <Award className="w-8 h-8 text-health-risk" />
                <div className="text-left">
                  <p className="text-sm font-bold">Perfect Score Badge Earned!</p>
                  <p className="text-xs text-muted-foreground">You aced this quiz with 100%</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={() => startQuiz(activeQuiz)} className="flex-1 py-3 rounded-xl font-semibold text-sm bg-secondary text-foreground">
              Retry
            </button>
            <button onClick={() => setActiveQuiz(null)} className="flex-1 py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground">
              Continue
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-health-advanced" /> {t("microLearning")}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">{t("audioTipsGuides")}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-health-risk" />
              <span className="text-sm font-bold">Lv.{level}</span>
            </div>
            <span className="text-[11px] text-muted-foreground">{totalXP} XP</span>
          </div>
        </div>
      </motion.div>

      {/* XP Progress Bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="stat-card mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-health-risk" />
            <span className="text-xs font-semibold">Level {level}</span>
          </div>
          <span className="text-xs text-muted-foreground">{xpInLevel}/100 XP to next level</span>
        </div>
        <Progress value={xpInLevel} className="h-2" />
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-health-advanced" />
            <span className="text-[11px] text-muted-foreground">{earnedBadges.length}/{badgeDefs.length} badges</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-health-risk" />
            <span className="text-[11px] text-muted-foreground">{streak} day streak</span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide">
        {([
          { key: "audio" as const, icon: Headphones, label: "Audio" },
          { key: "video" as const, icon: Video, label: "Video" },
          { key: "quiz" as const, icon: Brain, label: "Quizzes" },
          { key: "badges" as const, icon: Award, label: "Badges" },
        ]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-health-advanced text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Filters (not for badges) */}
      {activeTab !== "badges" && (
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
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === "audio" && (
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
        )}

        {activeTab === "video" && (
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

        {activeTab === "quiz" && (
          <motion.div key="quiz" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-3">
            {filteredQuizzes.map((quiz, i) => {
              const isDone = completedQuizzes.includes(quiz.id);
              const isPerfect = perfectQuizzes.includes(quiz.id);
              return (
                <motion.div key={quiz.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <button onClick={() => startQuiz(quiz)} className={`w-full stat-card text-left active:scale-[0.98] transition-transform ${isDone ? "border border-health-normal/30" : ""}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isPerfect ? "bg-health-risk-bg" : isDone ? "bg-health-normal-bg" : "bg-health-advanced-bg"}`}>
                        {isPerfect ? <Trophy className="w-5 h-5 text-health-risk" /> : isDone ? <CheckCircle2 className="w-5 h-5 text-health-normal" /> : <Brain className="w-5 h-5 text-health-advanced" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{quiz.title[cl]}</p>
                          {isPerfect && <Star className="w-3.5 h-3.5 text-health-risk flex-shrink-0" />}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${difficultyColors[quiz.difficulty]}`}>
                            {quiz.difficulty}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">{quiz.category}</span>
                          <span className="text-[11px] text-health-advanced font-bold ml-auto">{quiz.xp} XP</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1">{quiz.questions.length} questions</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </button>
                </motion.div>
              );
            })}
            {filteredQuizzes.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No quizzes in this category yet.</div>}
          </motion.div>
        )}

        {activeTab === "badges" && (
          <motion.div key="badges" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-3">
            <div className="stat-card mb-4 text-center">
              <p className="text-3xl font-bold">{earnedBadges.length}<span className="text-lg text-muted-foreground">/{badgeDefs.length}</span></p>
              <p className="text-xs text-muted-foreground mt-1">Badges Earned</p>
            </div>
            {badgeDefs.map((badge, i) => {
              const unlocked = earnedBadges.some((b) => b.id === badge.id);
              return (
                <motion.div key={badge.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={`stat-card ${unlocked ? "border border-health-advanced/30" : "opacity-60"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${unlocked ? badge.color + " text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{badge.title[cl]}</p>
                        {unlocked && <Sparkles className="w-3.5 h-3.5 text-health-risk" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{badge.description[cl]}</p>
                    </div>
                    {unlocked ? (
                      <CheckCircle2 className="w-5 h-5 text-health-normal flex-shrink-0" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MicroLearning;
