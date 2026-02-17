import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  Baby,
} from "lucide-react";
import { StatusBadge } from "@/components/HealthWidgets";
import { useLanguage } from "@/contexts/LanguageContext";

interface Milestone {
  id: string;
  label: Record<string, string>;
  category: "motor" | "speech" | "social" | "cognitive";
}

interface AgeGroup {
  range: Record<string, string>;
  minMonths: number;
  maxMonths: number;
  milestones: Milestone[];
}

const ageGroups: AgeGroup[] = [
  {
    range: { en: "0–12 months", hi: "0–12 महीने", mr: "0–12 महिने" },
    minMonths: 0, maxMonths: 12,
    milestones: [
      { id: "head_control", label: { en: "Holds head steady", hi: "सिर स्थिर रखता है", mr: "डोके स्थिर धरते" }, category: "motor" },
      { id: "rolls_over", label: { en: "Rolls over", hi: "करवट लेता है", mr: "कूस बदलते" }, category: "motor" },
      { id: "sits_support", label: { en: "Sits with support", hi: "सहारे से बैठता है", mr: "आधाराने बसते" }, category: "motor" },
      { id: "babbles", label: { en: "Babbles (ba-ba, ma-ma)", hi: "बोलता है (बा-बा, मा-मा)", mr: "बोबडे बोलते (बा-बा, मा-मा)" }, category: "speech" },
      { id: "responds_name_0", label: { en: "Responds to name", hi: "नाम पर प्रतिक्रिया", mr: "नावाला प्रतिसाद" }, category: "social" },
      { id: "reaches_objects", label: { en: "Reaches for objects", hi: "वस्तुओं की ओर हाथ बढ़ाता है", mr: "वस्तूंकडे हात पुढे करते" }, category: "cognitive" },
    ],
  },
  {
    range: { en: "1–2 years", hi: "1–2 साल", mr: "1–2 वर्षे" },
    minMonths: 12, maxMonths: 24,
    milestones: [
      { id: "walks", label: { en: "Walking independently", hi: "स्वतंत्र रूप से चलना", mr: "स्वतंत्रपणे चालणे" }, category: "motor" },
      { id: "says_words", label: { en: "Saying 2–3 words", hi: "2–3 शब्द बोलना", mr: "2–3 शब्द बोलणे" }, category: "speech" },
      { id: "responds_name", label: { en: "Responds to name", hi: "नाम पर प्रतिक्रिया", mr: "नावाला प्रतिसाद" }, category: "social" },
      { id: "holds_spoon", label: { en: "Holds spoon", hi: "चम्मच पकड़ना", mr: "चमचा धरणे" }, category: "motor" },
      { id: "points_objects", label: { en: "Points at objects", hi: "वस्तुओं की ओर इशारा", mr: "वस्तूंकडे बोट दाखवणे" }, category: "cognitive" },
      { id: "stacks_blocks", label: { en: "Stacks 2-3 blocks", hi: "2-3 ब्लॉक रखना", mr: "2-3 ब्लॉक रचणे" }, category: "motor" },
    ],
  },
  {
    range: { en: "2–3 years", hi: "2–3 साल", mr: "2–3 वर्षे" },
    minMonths: 24, maxMonths: 36,
    milestones: [
      { id: "sentences", label: { en: "Speaks short sentences", hi: "छोटे वाक्य बोलना", mr: "लहान वाक्ये बोलणे" }, category: "speech" },
      { id: "identifies", label: { en: "Identifies objects", hi: "वस्तुओं की पहचान", mr: "वस्तू ओळखणे" }, category: "cognitive" },
      { id: "plays_social", label: { en: "Plays socially", hi: "सामाजिक खेल", mr: "सामाजिक खेळ" }, category: "social" },
      { id: "follows_instructions", label: { en: "Follows simple instructions", hi: "साधारण निर्देश मानना", mr: "साध्या सूचना पाळणे" }, category: "cognitive" },
      { id: "runs", label: { en: "Runs without falling", hi: "बिना गिरे दौड़ना", mr: "न पडता धावणे" }, category: "motor" },
      { id: "draws_lines", label: { en: "Draws lines/circles", hi: "रेखाएं/वृत्त बनाना", mr: "रेषा/वर्तुळ काढणे" }, category: "motor" },
    ],
  },
  {
    range: { en: "3–5 years", hi: "3–5 साल", mr: "3–5 वर्षे" },
    minMonths: 36, maxMonths: 60,
    milestones: [
      { id: "tells_stories", label: { en: "Tells simple stories", hi: "साधारण कहानियां सुनाना", mr: "साध्या गोष्टी सांगणे" }, category: "speech" },
      { id: "counts_10", label: { en: "Counts to 10", hi: "10 तक गिनना", mr: "10 पर्यंत मोजणे" }, category: "cognitive" },
      { id: "dresses_self", label: { en: "Dresses independently", hi: "स्वतंत्र रूप से कपड़े पहनना", mr: "स्वतःच कपडे घालणे" }, category: "motor" },
      { id: "plays_cooperative", label: { en: "Cooperative play with others", hi: "दूसरों के साथ सहयोगी खेल", mr: "इतरांसोबत सहकारी खेळ" }, category: "social" },
      { id: "hops_one_foot", label: { en: "Hops on one foot", hi: "एक पैर पर कूदना", mr: "एका पायावर उड्या मारणे" }, category: "motor" },
      { id: "knows_colors", label: { en: "Knows basic colors", hi: "बुनियादी रंगों की पहचान", mr: "मूलभूत रंग ओळखणे" }, category: "cognitive" },
    ],
  },
];

const activitySuggestions: Record<string, Record<string, string[]>> = {
  speech: {
    en: ["Sing nursery rhymes and songs daily", "Read picture books and ask about them", "Name objects during daily activities", "Talk to the child throughout the day"],
    hi: ["रोज नर्सरी गीत गाएं", "चित्र की किताबें पढ़ें और उनके बारे में पूछें", "दैनिक गतिविधियों में वस्तुओं के नाम बताएं", "पूरे दिन बच्चे से बात करें"],
    mr: ["दररोज बालगीते गा", "चित्रपुस्तके वाचा आणि त्याबद्दल विचारा", "दैनंदिन कामात वस्तूंची नावे सांगा", "दिवसभर मुलाशी बोला"],
  },
  motor: {
    en: ["Encourage crawling/walking on different surfaces", "Play with building blocks and stacking toys", "Practice picking up small objects (supervised)", "Simple ball throwing and catching games"],
    hi: ["विभिन्न सतहों पर रेंगने/चलने को प्रोत्साहित करें", "बिल्डिंग ब्लॉक और स्टैकिंग खिलौनों से खेलें", "छोटी वस्तुएं उठाने का अभ्यास (निगरानी में)", "गेंद फेंकने और पकड़ने का खेल"],
    mr: ["वेगवेगळ्या पृष्ठभागावर रांगणे/चालणे प्रोत्साहित करा", "बिल्डिंग ब्लॉक आणि स्टॅकिंग खेळणी वापरा", "लहान वस्तू उचलण्याचा सराव (देखरेखीत)", "चेंडू फेकणे आणि पकडणे खेळ"],
  },
  social: {
    en: ["Arrange playtime with other children", "Play peek-a-boo and interactive games", "Encourage sharing during meals", "Respond to child's gestures and expressions"],
    hi: ["अन्य बच्चों के साथ खेलने का समय दें", "पीक-अ-बू और इंटरैक्टिव खेल खेलें", "भोजन के दौरान साझा करने को प्रोत्साहित करें", "बच्चे के इशारों और भावों का जवाब दें"],
    mr: ["इतर मुलांसोबत खेळण्याची वेळ ठरवा", "लपाछपी आणि संवादात्मक खेळ खेळा", "जेवताना वाटून घेण्यास प्रोत्साहित करा", "मुलाच्या हावभावांना प्रतिसाद द्या"],
  },
  cognitive: {
    en: ["Play sorting games with shapes and colors", "Hide-and-seek with objects", "Simple puzzles (2–4 pieces)", "Point and name things during walks"],
    hi: ["आकार और रंगों से छांटने का खेल खेलें", "वस्तुओं के साथ छुपन-छुपाई", "सरल पहेलियां (2–4 टुकड़े)", "सैर के दौरान चीजों को दिखाएं और नाम बताएं"],
    mr: ["आकार आणि रंगांनी वर्गीकरण खेळ खेळा", "वस्तूंसह लपाछपी", "साधी कोडी (2–4 तुकडे)", "फिरताना गोष्टी दाखवा आणि नावे सांगा"],
  },
};

const categoryLabels: Record<string, Record<string, string>> = {
  motor: { en: "Motor Development", hi: "मोटर विकास", mr: "मोटर विकास" },
  speech: { en: "Speech Development", hi: "भाषा विकास", mr: "भाषा विकास" },
  social: { en: "Social Development", hi: "सामाजिक विकास", mr: "सामाजिक विकास" },
  cognitive: { en: "Cognitive Development", hi: "संज्ञानात्मक विकास", mr: "संज्ञानात्मक विकास" },
};

const categoryIcons: Record<string, string> = {
  motor: "🏃", speech: "🗣️", social: "👥", cognitive: "🧠",
};

interface Props {
  childId: string;
  childAgeMonths: number;
}

const DevelopmentTracker = ({ childId, childAgeMonths }: Props) => {
  const storageKey = `dev-milestones-${childId}`;
  const { lang, t } = useLanguage();

  const [completed, setCompleted] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(completed));
  }, [completed, storageKey]);

  const toggleMilestone = (id: string) => {
    setCompleted((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const relevantGroups = ageGroups.filter((g) => childAgeMonths >= g.minMonths - 3);

  const riskAnalysis = useMemo(() => {
    const delays: string[] = [];
    const delayCategories = new Set<string>();

    ageGroups
      .filter((g) => childAgeMonths >= g.maxMonths)
      .forEach((g) => {
        const incomplete = g.milestones.filter((m) => !completed.includes(m.id));
        if (incomplete.length > g.milestones.length * 0.4) {
          incomplete.forEach((m) => {
            delays.push(m.label[lang] || m.label.en);
            delayCategories.add(m.category);
          });
        }
      });

    return { delays, categories: Array.from(delayCategories) };
  }, [completed, childAgeMonths, lang]);

  const progress = ageGroups.map((g) => {
    const total = g.milestones.length;
    const done = g.milestones.filter((m) => completed.includes(m.id)).length;
    return { range: g.range[lang] || g.range.en, pct: Math.round((done / total) * 100), done, total };
  });

  return (
    <div className="space-y-5">
      {/* AI Risk Alert */}
      {riskAnalysis.delays.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="health-badge-severe p-4 rounded-xl border border-health-severe/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-health-severe flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-health-severe-foreground">{t("possibleDelay")}</p>
              <p className="text-[10px] text-health-severe-foreground/80 mt-1">
                {riskAnalysis.delays.length} milestones · {riskAnalysis.categories.map(c => categoryLabels[c]?.[lang] || categoryLabels[c]?.en).join(", ")}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Timeline */}
      <div className="stat-card">
        <h4 className="section-title flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" /> {t("developmentProgress")}
        </h4>
        <div className="space-y-3">
          {progress.map((p, i) => (
            <div key={p.range}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">{p.range}</span>
                <span className="text-[10px] text-muted-foreground">{p.done}/{p.total} ({p.pct}%)</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${p.pct >= 80 ? "bg-health-normal" : p.pct >= 40 ? "bg-health-risk" : "bg-health-severe"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${p.pct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Age-based checklists */}
      {relevantGroups.map((group, gi) => (
        <motion.div key={group.range.en} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gi * 0.08 }} className="stat-card">
          <div className="flex items-center gap-2 mb-3">
            <Baby className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold">{group.range[lang] || group.range.en}</h4>
            <StatusBadge
              status={
                group.milestones.every((m) => completed.includes(m.id))
                  ? "normal"
                  : childAgeMonths >= group.maxMonths
                  ? "severe"
                  : "ai"
              }
            >
              {group.milestones.filter((m) => completed.includes(m.id)).length}/{group.milestones.length}
            </StatusBadge>
          </div>
          <div className="space-y-2">
            {group.milestones.map((m) => {
              const isDone = completed.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => toggleMilestone(m.id)}
                  className="w-full flex items-center gap-3 py-2 px-1 rounded-lg active:bg-secondary/50 transition-colors text-left"
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5 text-health-normal flex-shrink-0" /> : <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                  <span className="text-[11px]">{categoryIcons[m.category]}</span>
                  <span className={`text-sm ${isDone ? "line-through text-muted-foreground" : ""}`}>{m.label[lang] || m.label.en}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Activity Suggestions */}
      {riskAnalysis.categories.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
          <h4 className="section-title flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5" /> {t("suggestedActivities")}
          </h4>
          {riskAnalysis.categories.map((cat) => (
            <div key={cat} className="mb-3 last:mb-0">
              <p className="text-xs font-semibold capitalize mb-1.5">
                {categoryIcons[cat]} {categoryLabels[cat]?.[lang] || categoryLabels[cat]?.en}
              </p>
              <div className="space-y-1.5">
                {(activitySuggestions[cat]?.[lang] || activitySuggestions[cat]?.en)?.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-md bg-health-ai-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[8px] font-bold text-health-ai">{i + 1}</span>
                    </div>
                    <p className="text-xs">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default DevelopmentTracker;
