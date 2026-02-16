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

interface Milestone {
  id: string;
  label: string;
  category: "motor" | "speech" | "social" | "cognitive";
}

interface AgeGroup {
  range: string;
  minMonths: number;
  maxMonths: number;
  milestones: Milestone[];
}

const ageGroups: AgeGroup[] = [
  {
    range: "0–12 months",
    minMonths: 0,
    maxMonths: 12,
    milestones: [
      { id: "head_control", label: "Holds head steady", category: "motor" },
      { id: "rolls_over", label: "Rolls over", category: "motor" },
      { id: "sits_support", label: "Sits with support", category: "motor" },
      { id: "babbles", label: "Babbles (ba-ba, ma-ma)", category: "speech" },
      { id: "responds_name_0", label: "Responds to name", category: "social" },
      { id: "reaches_objects", label: "Reaches for objects", category: "cognitive" },
    ],
  },
  {
    range: "1–2 years",
    minMonths: 12,
    maxMonths: 24,
    milestones: [
      { id: "walks", label: "Walking independently", category: "motor" },
      { id: "says_words", label: "Saying 2–3 words", category: "speech" },
      { id: "responds_name", label: "Responds to name", category: "social" },
      { id: "holds_spoon", label: "Holds spoon", category: "motor" },
      { id: "points_objects", label: "Points at objects", category: "cognitive" },
      { id: "stacks_blocks", label: "Stacks 2-3 blocks", category: "motor" },
    ],
  },
  {
    range: "2–3 years",
    minMonths: 24,
    maxMonths: 36,
    milestones: [
      { id: "sentences", label: "Speaks short sentences", category: "speech" },
      { id: "identifies", label: "Identifies objects", category: "cognitive" },
      { id: "plays_social", label: "Plays socially", category: "social" },
      { id: "follows_instructions", label: "Follows simple instructions", category: "cognitive" },
      { id: "runs", label: "Runs without falling", category: "motor" },
      { id: "draws_lines", label: "Draws lines/circles", category: "motor" },
    ],
  },
  {
    range: "3–5 years",
    minMonths: 36,
    maxMonths: 60,
    milestones: [
      { id: "tells_stories", label: "Tells simple stories", category: "speech" },
      { id: "counts_10", label: "Counts to 10", category: "cognitive" },
      { id: "dresses_self", label: "Dresses independently", category: "motor" },
      { id: "plays_cooperative", label: "Cooperative play with others", category: "social" },
      { id: "hops_one_foot", label: "Hops on one foot", category: "motor" },
      { id: "knows_colors", label: "Knows basic colors", category: "cognitive" },
    ],
  },
];

const activitySuggestions: Record<string, string[]> = {
  speech: [
    "Sing nursery rhymes and songs daily",
    "Read picture books and ask about them",
    "Name objects during daily activities",
    "Talk to the child throughout the day",
  ],
  motor: [
    "Encourage crawling/walking on different surfaces",
    "Play with building blocks and stacking toys",
    "Practice picking up small objects (supervised)",
    "Simple ball throwing and catching games",
  ],
  social: [
    "Arrange playtime with other children",
    "Play peek-a-boo and interactive games",
    "Encourage sharing during meals",
    "Respond to child's gestures and expressions",
  ],
  cognitive: [
    "Play sorting games with shapes and colors",
    "Hide-and-seek with objects",
    "Simple puzzles (2–4 pieces)",
    "Point and name things during walks",
  ],
};

const categoryIcons: Record<string, string> = {
  motor: "🏃",
  speech: "🗣️",
  social: "👥",
  cognitive: "🧠",
};

interface Props {
  childId: string;
  childAgeMonths: number;
}

const DevelopmentTracker = ({ childId, childAgeMonths }: Props) => {
  const storageKey = `dev-milestones-${childId}`;

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

  // Determine relevant age groups
  const relevantGroups = ageGroups.filter(
    (g) => childAgeMonths >= g.minMonths - 3
  );

  // AI Risk detection
  const riskAnalysis = useMemo(() => {
    const delays: string[] = [];
    const delayCategories = new Set<string>();

    ageGroups
      .filter((g) => childAgeMonths >= g.maxMonths)
      .forEach((g) => {
        const incomplete = g.milestones.filter((m) => !completed.includes(m.id));
        if (incomplete.length > g.milestones.length * 0.4) {
          incomplete.forEach((m) => {
            delays.push(m.label);
            delayCategories.add(m.category);
          });
        }
      });

    return { delays, categories: Array.from(delayCategories) };
  }, [completed, childAgeMonths]);

  // Progress timeline
  const progress = ageGroups.map((g) => {
    const total = g.milestones.length;
    const done = g.milestones.filter((m) => completed.includes(m.id)).length;
    return { range: g.range, pct: Math.round((done / total) * 100), done, total };
  });

  return (
    <div className="space-y-5">
      {/* AI Risk Alert */}
      {riskAnalysis.delays.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="health-badge-severe p-4 rounded-xl border border-health-severe/20"
        >
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-health-severe flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-health-severe-foreground">⚠ Possible Development Delay</p>
              <p className="text-[10px] text-health-severe-foreground/80 mt-1">
                {riskAnalysis.delays.length} milestones not achieved in expected age range. Categories: {riskAnalysis.categories.join(", ")}.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Progress Timeline */}
      <div className="stat-card">
        <h4 className="section-title flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" /> Development Progress
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
        <motion.div
          key={group.range}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: gi * 0.08 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Baby className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-semibold">{group.range}</h4>
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
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-health-normal flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-[11px]">{categoryIcons[m.category]}</span>
                  <span className={`text-sm ${isDone ? "line-through text-muted-foreground" : ""}`}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Activity Suggestions */}
      {riskAnalysis.categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="stat-card"
        >
          <h4 className="section-title flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5" /> Suggested Activities
          </h4>
          {riskAnalysis.categories.map((cat) => (
            <div key={cat} className="mb-3 last:mb-0">
              <p className="text-xs font-semibold capitalize mb-1.5">
                {categoryIcons[cat]} {cat} Development
              </p>
              <div className="space-y-1.5">
                {activitySuggestions[cat]?.map((tip, i) => (
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
