import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Droplets,
  TrendingUp,
  Apple,
  Camera,
  ChevronRight,
  AlertTriangle,
  Syringe,
  Baby,
} from "lucide-react";
import { RiskGauge, StatusBadge } from "@/components/HealthWidgets";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import DevelopmentTracker from "@/components/DevelopmentTracker";
import { useLanguage } from "@/contexts/LanguageContext";

const growthData = [
  { month: "Jul", weight: 8.2, predicted: 8.2 },
  { month: "Aug", weight: 8.5, predicted: 8.5 },
  { month: "Sep", weight: 8.4, predicted: 8.7 },
  { month: "Oct", weight: 8.3, predicted: 8.9 },
  { month: "Nov", weight: 8.2, predicted: 9.1 },
  { month: "Dec", weight: null, predicted: 9.3 },
  { month: "Jan", weight: null, predicted: 9.5 },
];

const visits = [
  { date: "Nov 15, 2025", type: "Weighing", note: "Weight decreased 100g. Counseled mother on feeding." },
  { date: "Oct 18, 2025", type: "Immunization", note: "DPT booster given. No adverse reaction." },
  { date: "Sep 20, 2025", type: "Home Visit", note: "Child recovering from fever. ORS provided." },
];

const nutritionTips: Record<string, string[]> = {
  en: [
    "Add mashed dal and ghee to rice for extra calories",
    "Include green leafy vegetables daily for iron",
    "Provide egg or milk at least 3 times per week",
    "Continue breastfeeding alongside solid foods",
  ],
  hi: [
    "अतिरिक्त कैलोरी के लिए चावल में दाल और घी मिलाएं",
    "आयरन के लिए रोज हरी पत्तेदार सब्जियां खिलाएं",
    "हफ्ते में कम से कम 3 बार अंडा या दूध दें",
    "ठोस आहार के साथ स्तनपान जारी रखें",
  ],
  mr: [
    "अतिरिक्त कॅलरीसाठी भातात डाळ आणि तूप मिसळा",
    "लोहासाठी दररोज हिरव्या पालेभाज्या द्या",
    "आठवड्यातून किमान 3 वेळा अंडे किंवा दूध द्या",
    "घन अन्नासोबत स्तनपान चालू ठेवा",
  ],
};

const ChildProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<"health" | "vaccines" | "development">("health");
  const { lang, t } = useLanguage();

  const childAgeMonths = 28;

  const tabs = [
    { key: "health" as const, labelKey: "health" as const, icon: TrendingUp },
    { key: "vaccines" as const, labelKey: "vaccines" as const, icon: Syringe },
    { key: "development" as const, labelKey: "development" as const, icon: Baby },
  ];

  return (
    <div className="page-container">
      {/* Back Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold">Priya Kumari</h2>
          <p className="text-xs text-muted-foreground">ID: AWC47-2023-{id || "001"} · Rampur</p>
        </div>
      </div>

      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stat-card mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-health-severe-bg flex items-center justify-center text-2xl">👶</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">Age: 2 years 4 months</p>
              <StatusBadge status="severe">{t("severe")}</StatusBadge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Mother: Rani Devi · Father: Suresh Kumar</p>
            <p className="text-xs text-muted-foreground">Village: Rampur · Ward: 3</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
              activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Health Tab */}
      {activeTab === "health" && (
        <>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card mb-6">
            <h3 className="section-title">{t("aiRiskAssessment")}</h3>
            <div className="flex items-center gap-6">
              <RiskGauge score={78} size="lg" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t("underweight")}</span>
                  <span className="font-semibold text-health-severe">{t("critical")}</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-health-severe rounded-full" style={{ width: "85%" }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t("stuntingRisk")}</span>
                  <span className="font-semibold text-health-risk">{t("moderate")}</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-health-risk rounded-full" style={{ width: "55%" }} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{t("dropoutRisk")}</span>
                  <span className="font-semibold text-health-risk"><AlertTriangle className="w-3 h-3 inline mr-0.5" />{t("flagged")}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title mb-0"><TrendingUp className="w-3.5 h-3.5 inline mr-1" />{t("growthPrediction")}</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(220 10% 46%)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(220 10% 46%)" domain={[7.5, 10]} />
                  <Tooltip contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(220 13% 91%)", fontSize: "12px" }} />
                  <Area type="monotone" dataKey="predicted" stroke="hsl(210 90% 50%)" fill="hsl(210 90% 50% / 0.1)" strokeDasharray="5 5" strokeWidth={2} />
                  <Line type="monotone" dataKey="weight" stroke="hsl(0 84% 55%)" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(0 84% 55%)" }} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-3 h-0.5 bg-health-severe rounded" />{t("actualWeight")}</div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className="w-3 h-0.5 bg-primary rounded border-dashed" />{t("aiPredicted")}</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card mb-6">
            <h3 className="section-title"><Droplets className="w-3.5 h-3.5 inline mr-1" />{t("hemoglobinLevel")}</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: "100%", background: "linear-gradient(90deg, hsl(0 84% 55%), hsl(38 92% 50%), hsl(142 70% 42%))" }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-card border-2 border-health-risk shadow-md" style={{ left: "45%" }} />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                  <span>{t("severe")} (&lt;7)</span><span>{t("moderate")} (7-10)</span><span>{t("normal")} (&gt;11)</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-health-risk">9.2</p>
                <p className="text-[10px] text-muted-foreground">g/dL</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="stat-card mb-6">
            <h3 className="section-title"><Apple className="w-3.5 h-3.5 inline mr-1" />{t("aiNutritionPlan")}</h3>
            <div className="space-y-2">
              {(nutritionTips[lang] || nutritionTips.en).map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-md bg-health-normal-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-health-normal">{i + 1}</span>
                  </div>
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-6">
            <h3 className="section-title"><Calendar className="w-3.5 h-3.5 inline mr-1" />{t("visitHistory")}</h3>
            <div className="space-y-2">
              {visits.map((visit, i) => (
                <div key={i} className="stat-card">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold">{visit.type}</p>
                    <p className="text-[10px] text-muted-foreground">{visit.date}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{visit.note}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="stat-card mb-6">
            <h3 className="section-title"><Camera className="w-3.5 h-3.5 inline mr-1" />{t("photoTimeline")}</h3>
            <div className="grid grid-cols-4 gap-2">
              {["Jul", "Aug", "Sep", "Oct"].map((month) => (
                <div key={month} className="aspect-square rounded-xl bg-secondary flex flex-col items-center justify-center gap-1">
                  <Camera className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{month}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}

      {activeTab === "vaccines" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="stat-card mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-health-ai-bg flex items-center justify-center">
              <Syringe className="w-5 h-5 text-health-ai" />
            </div>
            <div>
              <p className="text-sm font-semibold">{t("immunizationRecord")}</p>
              <p className="text-[10px] text-muted-foreground">{t("vaccineTracker")}</p>
            </div>
            <button
              onClick={() => navigate("/vaccines")}
              className="ml-auto text-xs text-primary font-semibold flex items-center gap-0.5"
            >
              Open <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}

      {activeTab === "development" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <DevelopmentTracker childId={id || "1"} childAgeMonths={childAgeMonths} />
        </motion.div>
      )}
    </div>
  );
};

export default ChildProfile;
