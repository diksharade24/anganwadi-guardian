import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Syringe,
  Package,
  Brain,
  Award,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StatusBadge } from "@/components/HealthWidgets";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";

// Mock data for multiple Anganwadi centers
interface CenterData {
  id: string;
  name: string;
  worker: string;
  village: string;
  totalChildren: number;
  normalChildren: number;
  atRiskChildren: number;
  severeChildren: number;
  vaccineCoverage: number;
  attendanceRate: number;
  stockScore: number; // 0-100
  developmentScore: number; // 0-100
  visitCompletion: number; // 0-100
  malnutritionRate: number;
  trend: "up" | "down" | "stable";
}

const centersData: CenterData[] = [
  {
    id: "awc-01", name: "AWC Rampur-1", worker: "Sunita Devi", village: "Rampur",
    totalChildren: 32, normalChildren: 20, atRiskChildren: 8, severeChildren: 4,
    vaccineCoverage: 78, attendanceRate: 85, stockScore: 65, developmentScore: 72,
    visitCompletion: 90, malnutritionRate: 37.5, trend: "down",
  },
  {
    id: "awc-02", name: "AWC Sundarpur", worker: "Kavita Singh", village: "Sundarpur",
    totalChildren: 28, normalChildren: 22, atRiskChildren: 5, severeChildren: 1,
    vaccineCoverage: 92, attendanceRate: 91, stockScore: 88, developmentScore: 85,
    visitCompletion: 95, malnutritionRate: 21.4, trend: "up",
  },
  {
    id: "awc-03", name: "AWC Keshavpur", worker: "Rani Kumari", village: "Keshavpur",
    totalChildren: 25, normalChildren: 14, atRiskChildren: 7, severeChildren: 4,
    vaccineCoverage: 64, attendanceRate: 72, stockScore: 45, developmentScore: 60,
    visitCompletion: 68, malnutritionRate: 44.0, trend: "down",
  },
  {
    id: "awc-04", name: "AWC Rampur-2", worker: "Meena Sharma", village: "Rampur",
    totalChildren: 30, normalChildren: 24, atRiskChildren: 5, severeChildren: 1,
    vaccineCoverage: 88, attendanceRate: 88, stockScore: 78, developmentScore: 80,
    visitCompletion: 85, malnutritionRate: 20.0, trend: "up",
  },
  {
    id: "awc-05", name: "AWC Bhagwanpur", worker: "Lata Yadav", village: "Bhagwanpur",
    totalChildren: 22, normalChildren: 16, atRiskChildren: 4, severeChildren: 2,
    vaccineCoverage: 82, attendanceRate: 79, stockScore: 70, developmentScore: 75,
    visitCompletion: 78, malnutritionRate: 27.3, trend: "stable",
  },
];

type SortKey = "malnutritionRate" | "vaccineCoverage" | "attendanceRate" | "stockScore" | "visitCompletion";

const labels: Record<string, Record<string, string>> = {
  en: {
    title: "Center Comparison",
    subtitle: "Compare performance across Anganwadi centers",
    overallPerformance: "Overall Performance",
    sortBy: "Sort by",
    malnutrition: "Malnutrition Rate",
    vaccine: "Vaccine Coverage",
    attendance: "Attendance",
    stock: "Stock Health",
    visits: "Visit Completion",
    children: "Children",
    normal: "Normal",
    atRisk: "At Risk",
    severe: "Severe",
    worker: "Worker",
    radarTitle: "Performance Radar",
    barTitle: "Malnutrition Comparison",
    rankTitle: "Center Rankings",
    best: "Best",
    needsAttention: "Needs Attention",
    improving: "Improving",
    declining: "Declining",
    stable: "Stable",
  },
  hi: {
    title: "केंद्र तुलना",
    subtitle: "आंगनवाड़ी केंद्रों के प्रदर्शन की तुलना करें",
    overallPerformance: "समग्र प्रदर्शन",
    sortBy: "क्रमबद्ध करें",
    malnutrition: "कुपोषण दर",
    vaccine: "टीका कवरेज",
    attendance: "उपस्थिति",
    stock: "स्टॉक स्वास्थ्य",
    visits: "विजिट पूर्णता",
    children: "बच्चे",
    normal: "सामान्य",
    atRisk: "जोखिम में",
    severe: "गंभीर",
    worker: "कार्यकर्ता",
    radarTitle: "प्रदर्शन रडार",
    barTitle: "कुपोषण तुलना",
    rankTitle: "केंद्र रैंकिंग",
    best: "सर्वश्रेष्ठ",
    needsAttention: "ध्यान आवश्यक",
    improving: "सुधार हो रहा",
    declining: "गिरावट",
    stable: "स्थिर",
  },
  mr: {
    title: "केंद्र तुलना",
    subtitle: "अंगणवाडी केंद्रांच्या कामगिरीची तुलना करा",
    overallPerformance: "एकंदर कामगिरी",
    sortBy: "क्रमवारी",
    malnutrition: "कुपोषण दर",
    vaccine: "लस कव्हरेज",
    attendance: "उपस्थिती",
    stock: "साठा आरोग्य",
    visits: "भेट पूर्णता",
    children: "मुले",
    normal: "सामान्य",
    atRisk: "धोक्यात",
    severe: "गंभीर",
    worker: "कर्मचारी",
    radarTitle: "कामगिरी रडार",
    barTitle: "कुपोषण तुलना",
    rankTitle: "केंद्र क्रमवारी",
    best: "सर्वोत्तम",
    needsAttention: "लक्ष आवश्यक",
    improving: "सुधारत आहे",
    declining: "घसरत आहे",
    stable: "स्थिर",
  },
};

const CenterComparison = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const tl = (key: string) => labels[lang]?.[key] || labels.en[key] || key;

  const [sortKey, setSortKey] = useState<SortKey>("malnutritionRate");
  const [expandedCenter, setExpandedCenter] = useState<string | null>(null);

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "malnutritionRate", label: tl("malnutrition") },
    { key: "vaccineCoverage", label: tl("vaccine") },
    { key: "attendanceRate", label: tl("attendance") },
    { key: "stockScore", label: tl("stock") },
    { key: "visitCompletion", label: tl("visits") },
  ];

  const sorted = useMemo(() => {
    return [...centersData].sort((a, b) => {
      if (sortKey === "malnutritionRate") return a[sortKey] - b[sortKey]; // lower is better
      return b[sortKey] - a[sortKey]; // higher is better
    });
  }, [sortKey]);

  const getOverallScore = (c: CenterData) =>
    Math.round((c.vaccineCoverage + c.attendanceRate + c.stockScore + c.developmentScore + c.visitCompletion + (100 - c.malnutritionRate)) / 6);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-health-normal";
    if (score >= 60) return "text-health-risk";
    return "text-health-severe";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-health-normal-bg";
    if (score >= 60) return "bg-health-risk-bg";
    return "bg-health-severe-bg";
  };

  const getStatusForScore = (score: number): "normal" | "risk" | "severe" => {
    if (score >= 80) return "normal";
    if (score >= 60) return "risk";
    return "severe";
  };

  // Radar chart data
  const radarData = [
    { metric: tl("vaccine"), ...Object.fromEntries(centersData.map((c) => [c.name, c.vaccineCoverage])) },
    { metric: tl("attendance"), ...Object.fromEntries(centersData.map((c) => [c.name, c.attendanceRate])) },
    { metric: tl("stock"), ...Object.fromEntries(centersData.map((c) => [c.name, c.stockScore])) },
    { metric: tl("visits"), ...Object.fromEntries(centersData.map((c) => [c.name, c.visitCompletion])) },
    { metric: "Dev. Score", ...Object.fromEntries(centersData.map((c) => [c.name, c.developmentScore])) },
  ];

  const radarColors = [
    "hsl(var(--primary))",
    "hsl(var(--health-normal))",
    "hsl(var(--health-risk))",
    "hsl(var(--accent))",
    "hsl(var(--health-severe))",
  ];

  // Bar chart data
  const barData = centersData.map((c) => ({
    name: c.name.replace("AWC ", ""),
    normal: c.normalChildren,
    atRisk: c.atRiskChildren,
    severe: c.severeChildren,
  }));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{tl("title")}</h2>
          <p className="text-xs text-muted-foreground">{tl("subtitle")}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
      </div>

      {/* Overall Score Cards */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h3 className="section-title mb-3">{tl("overallPerformance")}</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sorted.map((center, i) => {
            const score = getOverallScore(center);
            return (
              <motion.div
                key={center.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="stat-card min-w-[130px] flex-shrink-0 text-center relative"
              >
                {i === 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-health-normal flex items-center justify-center">
                    <Award className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl ${getScoreBg(score)} flex items-center justify-center mx-auto mb-2`}>
                  <span className={`text-lg font-bold ${getScoreColor(score)}`}>{score}</span>
                </div>
                <p className="text-xs font-semibold truncate">{center.name.replace("AWC ", "")}</p>
                <p className="text-[10px] text-muted-foreground">{center.worker}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {center.trend === "up" && <TrendingUp className="w-3 h-3 text-health-normal" />}
                  {center.trend === "down" && <TrendingDown className="w-3 h-3 text-health-severe" />}
                  <span className={`text-[10px] font-semibold ${
                    center.trend === "up" ? "text-health-normal" : center.trend === "down" ? "text-health-severe" : "text-muted-foreground"
                  }`}>
                    {tl(center.trend === "up" ? "improving" : center.trend === "down" ? "declining" : "stable")}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Radar Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card mb-6">
        <h3 className="section-title mb-3">{tl("radarTitle")}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 8 }} stroke="hsl(var(--border))" />
              {centersData.map((center, i) => (
                <Radar
                  key={center.id}
                  name={center.name.replace("AWC ", "")}
                  dataKey={center.name}
                  stroke={radarColors[i]}
                  fill={radarColors[i]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              ))}
              <Legend
                wrapperStyle={{ fontSize: "10px" }}
                formatter={(value: string) => <span className="text-muted-foreground">{value}</span>}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Nutrition Status Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card mb-6">
        <h3 className="section-title mb-3">{tl("barTitle")}</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid hsl(var(--border))",
                  fontSize: "12px",
                  backgroundColor: "hsl(var(--card))",
                }}
              />
              <Bar dataKey="normal" name={tl("normal")} fill="hsl(var(--health-normal))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="atRisk" name={tl("atRisk")} fill="hsl(var(--health-risk))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="severe" name={tl("severe")} fill="hsl(var(--health-severe))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2">
          <div className="flex items-center gap-1.5 text-[10px]"><div className="w-3 h-3 rounded bg-health-normal" /><span className="text-muted-foreground">{tl("normal")}</span></div>
          <div className="flex items-center gap-1.5 text-[10px]"><div className="w-3 h-3 rounded bg-health-risk" /><span className="text-muted-foreground">{tl("atRisk")}</span></div>
          <div className="flex items-center gap-1.5 text-[10px]"><div className="w-3 h-3 rounded bg-health-severe" /><span className="text-muted-foreground">{tl("severe")}</span></div>
        </div>
      </motion.div>

      {/* Sort & Ranking */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0">{tl("rankTitle")}</h3>
        </div>

        {/* Sort pills */}
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortKey(opt.key)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors ${
                sortKey === opt.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Center Cards */}
        <div className="space-y-2 mb-20">
          {sorted.map((center, i) => {
            const score = sortKey === "malnutritionRate"
              ? center.malnutritionRate
              : center[sortKey];
            const isExpanded = expandedCenter === center.id;
            const overall = getOverallScore(center);

            return (
              <motion.div
                key={center.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="stat-card"
              >
                <button
                  onClick={() => setExpandedCenter(isExpanded ? null : center.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      i === 0 ? "bg-health-normal-bg text-health-normal" :
                      i === sorted.length - 1 ? "bg-health-severe-bg text-health-severe" :
                      "bg-secondary text-muted-foreground"
                    }`}>
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{center.name}</p>
                      <p className="text-[10px] text-muted-foreground">{center.worker} · {center.village}</p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className={`text-sm font-bold ${
                          sortKey === "malnutritionRate"
                            ? getScoreColor(100 - score)
                            : getScoreColor(score)
                        }`}>
                          {score}{sortKey === "malnutritionRate" ? "%" : "%"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {sortOptions.find((o) => o.key === sortKey)?.label}
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 pt-3 border-t border-border space-y-3"
                  >
                    {/* Children breakdown */}
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{tl("children")}:</span>
                      <span className="text-xs font-semibold">{center.totalChildren}</span>
                      <div className="flex gap-1 ml-auto">
                        <StatusBadge status="normal">{center.normalChildren} {tl("normal")}</StatusBadge>
                        <StatusBadge status="risk">{center.atRiskChildren} {tl("atRisk")}</StatusBadge>
                        <StatusBadge status="severe">{center.severeChildren} {tl("severe")}</StatusBadge>
                      </div>
                    </div>

                    {/* Metric bars */}
                    {([
                      { key: "vaccineCoverage", label: tl("vaccine"), icon: Syringe, value: center.vaccineCoverage },
                      { key: "attendanceRate", label: tl("attendance"), icon: Users, value: center.attendanceRate },
                      { key: "stockScore", label: tl("stock"), icon: Package, value: center.stockScore },
                      { key: "visitCompletion", label: tl("visits"), icon: TrendingUp, value: center.visitCompletion },
                      { key: "developmentScore", label: "Dev. Score", icon: Brain, value: center.developmentScore },
                    ] as const).map((m) => (
                      <div key={m.key}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <m.icon className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">{m.label}</span>
                          </div>
                          <span className={`text-xs font-bold ${getScoreColor(m.value)}`}>{m.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full rounded-full ${
                              m.value >= 80 ? "bg-health-normal" : m.value >= 60 ? "bg-health-risk" : "bg-health-severe"
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${m.value}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}

                    {/* Overall */}
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs font-semibold">{tl("overallPerformance")}</span>
                      <StatusBadge status={getStatusForScore(overall)}>
                        {overall}/100
                      </StatusBadge>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default CenterComparison;
