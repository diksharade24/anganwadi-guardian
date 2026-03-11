import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Syringe,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Users,
  Download,
  ShieldAlert,
  TrendingUp,
  Activity,
  Navigation,
  MapPin,
  BarChart3,
  UserCheck,
  Star,
  Filter,
  Calendar,
  X,
  Home,
  Award,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, AreaChart, Area } from "recharts";
import { StatCard, StatusBadge } from "@/components/HealthWidgets";
import { exportToPDF } from "@/lib/pdfExport";
import { useLanguage, type TranslationKey } from "@/contexts/LanguageContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";

// ─── Stock data (mirrors NutritionStock) ──────────────────────
interface StockItem {
  id: string;
  nameKey: string;
  unit: string;
  current: number;
  minimum: number;
  maximum: number;
  perChildPerDay: number;
}

const defaultStock: StockItem[] = [
  { id: "rice", nameKey: "rice", unit: "kg", current: 45, minimum: 10, maximum: 100, perChildPerDay: 0.15 },
  { id: "dal", nameKey: "dal", unit: "kg", current: 8, minimum: 5, maximum: 50, perChildPerDay: 0.05 },
  { id: "oil", nameKey: "oil", unit: "liters", current: 3, minimum: 2, maximum: 20, perChildPerDay: 0.01 },
  { id: "eggs", nameKey: "eggs", unit: "count", current: 120, minimum: 50, maximum: 500, perChildPerDay: 0.5 },
  { id: "supplement", nameKey: "supplementPackets", unit: "packets", current: 15, minimum: 20, maximum: 200, perChildPerDay: 0.1 },
];

const getStockStatus = (current: number, minimum: number) => {
  if (current <= minimum) return "severe" as const;
  if (current <= minimum * 2) return "risk" as const;
  return "normal" as const;
};

// ─── Vaccine data (mirrors VaccineTracker) ────────────────────
interface Vaccine { id: string; name: string; ageWeeks: number; }

const immunizationSchedule: Vaccine[] = [
  { id: "bcg", name: "BCG", ageWeeks: 0 },
  { id: "opv0", name: "OPV-0", ageWeeks: 0 },
  { id: "hepb0", name: "Hep B", ageWeeks: 0 },
  { id: "opv1", name: "OPV-1", ageWeeks: 6 },
  { id: "penta1", name: "Penta-1", ageWeeks: 6 },
  { id: "rota1", name: "Rota-1", ageWeeks: 6 },
  { id: "ipv1", name: "IPV-1", ageWeeks: 6 },
  { id: "pcv1", name: "PCV-1", ageWeeks: 6 },
  { id: "opv2", name: "OPV-2", ageWeeks: 10 },
  { id: "penta2", name: "Penta-2", ageWeeks: 10 },
  { id: "rota2", name: "Rota-2", ageWeeks: 10 },
  { id: "opv3", name: "OPV-3", ageWeeks: 14 },
  { id: "penta3", name: "Penta-3", ageWeeks: 14 },
  { id: "rota3", name: "Rota-3", ageWeeks: 14 },
  { id: "ipv2", name: "IPV-2", ageWeeks: 14 },
  { id: "pcv2", name: "PCV-2", ageWeeks: 14 },
  { id: "measles1", name: "MR-1", ageWeeks: 39 },
  { id: "jevac1", name: "JE-1", ageWeeks: 39 },
  { id: "pcv_booster", name: "PCV-B", ageWeeks: 39 },
  { id: "vitA1", name: "Vit A", ageWeeks: 39 },
  { id: "dpt_b1", name: "DPT-B1", ageWeeks: 72 },
  { id: "measles2", name: "MR-2", ageWeeks: 72 },
  { id: "opv_booster", name: "OPV-B", ageWeeks: 72 },
  { id: "jevac2", name: "JE-2", ageWeeks: 72 },
  { id: "dpt_b2", name: "DPT-B2", ageWeeks: 260 },
];

interface ChildData {
  id: string;
  name: string;
  dob: string;
  village: string;
  completedVaccines: string[];
}

const mockChildren: ChildData[] = [
  { id: "1", name: "Priya Kumari", dob: "2023-08-15", village: "Rampur", completedVaccines: ["bcg","opv0","hepb0","opv1","penta1","rota1","ipv1","pcv1","opv2","penta2","rota2"] },
  { id: "2", name: "Arjun Singh", dob: "2024-04-10", village: "Sundarpur", completedVaccines: ["bcg","opv0","hepb0","opv1","penta1","rota1"] },
  { id: "3", name: "Meera Devi", dob: "2022-11-01", village: "Rampur", completedVaccines: ["bcg","opv0","hepb0","opv1","penta1","rota1","ipv1","pcv1","opv2","penta2","rota2","opv3","penta3","rota3","ipv2","pcv2","measles1","jevac1","pcv_booster","vitA1"] },
  { id: "4", name: "Rahul Kumar", dob: "2025-01-20", village: "Keshavpur", completedVaccines: ["bcg","opv0","hepb0"] },
  { id: "5", name: "Anita Sharma", dob: "2021-10-05", village: "Rampur", completedVaccines: ["bcg","opv0","hepb0","opv1","penta1","rota1","ipv1","pcv1","opv2","penta2","rota2","opv3","penta3","rota3","ipv2","pcv2","measles1","jevac1","pcv_booster","vitA1","dpt_b1","measles2","opv_booster","jevac2"] },
  { id: "6", name: "Vikram Yadav", dob: "2023-03-22", village: "Sundarpur", completedVaccines: ["bcg","opv0","hepb0","opv1","penta1","rota1","ipv1","pcv1","opv2","penta2","rota2","opv3","penta3","rota3","ipv2","pcv2"] },
  { id: "7", name: "Sita Kumari", dob: "2024-09-12", village: "Keshavpur", completedVaccines: ["bcg","opv0","hepb0"] },
  { id: "8", name: "Ravi Prasad", dob: "2022-05-30", village: "Rampur", completedVaccines: ["bcg","opv0","hepb0","opv1","penta1","rota1","ipv1","pcv1","opv2","penta2","rota2","opv3","penta3","rota3","ipv2","pcv2","measles1","jevac1","pcv_booster","vitA1","dpt_b1","measles2","opv_booster"] },
];

// ─── Development delay mock data ──────────────────────────────
interface DelayChild {
  id: string;
  name: string;
  age: string;
  village: string;
  delays: string[];
}

const childrenWithDelays: DelayChild[] = [
  { id: "1", name: "Priya Kumari", age: "2y 4m", village: "Rampur", delays: ["speechDev", "cognitiveDev"] },
  { id: "4", name: "Rahul Kumar", age: "1y 1m", village: "Keshavpur", delays: ["motorDev"] },
  { id: "7", name: "Sita Kumari", age: "1y 5m", village: "Keshavpur", delays: ["speechDev", "socialDev"] },
];

// ─── Helpers ──────────────────────────────────────────────────
const getVaccineStatus = (vaccine: Vaccine, dob: string, completed: string[]) => {
  if (completed.includes(vaccine.id)) return "done";
  const dueDate = new Date(new Date(dob).getTime() + vaccine.ageWeeks * 7 * 86400000);
  const diff = (dueDate.getTime() - Date.now()) / 86400000;
  if (diff < 0) return "overdue";
  if (diff <= 30) return "due-soon";
  return "upcoming";
};

// ─── Component ────────────────────────────────────────────────
const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const [activeSection, setActiveSection] = useState<"overview" | "workers" | "rankings" | "stock" | "vaccine" | "development" | "visits">("overview");
  const [workerAreaFilter, setWorkerAreaFilter] = useState<string>("all");
  const [workerTimeFilter, setWorkerTimeFilter] = useState<"3m" | "6m" | "12m">("6m");
  const [rankingSortBy, setRankingSortBy] = useState<"score" | "attendance" | "visits" | "vaccineRate">("score");
  const [rankingSortDir, setRankingSortDir] = useState<"desc" | "asc">("desc");
  const [selectedWorker, setSelectedWorker] = useState<{ name: string; area: string; attendance: number; visits: number; vaccineRate: number; score: number; trend: string } | null>(null);

  // Stock data from localStorage or defaults
  const stock: StockItem[] = useMemo(() => {
    const saved = localStorage.getItem("nutrition-stock");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((s: any, i: number) => ({
        ...defaultStock[i],
        ...s,
        nameKey: defaultStock.find((d) => d.id === s.id)?.nameKey || s.id,
      }));
    }
    return defaultStock;
  }, []);

  // Vaccine completion state
  const completedState: Record<string, string[]> = useMemo(() => {
    const saved = localStorage.getItem("vaccine-completed");
    if (saved) return JSON.parse(saved);
    const init: Record<string, string[]> = {};
    mockChildren.forEach((c) => { init[c.id] = [...c.completedVaccines]; });
    return init;
  }, []);

  // Computed stats
  const stockAlerts = stock.filter((s) => s.current <= s.minimum);
  const lowStockCount = stock.filter((s) => s.current <= s.minimum * 2).length;

  const vaccineStats = useMemo(() => {
    let total = 0, completed = 0, overdue = 0, dueSoon = 0;
    mockChildren.forEach((child) => {
      const done = completedState[child.id] || [];
      immunizationSchedule.forEach((v) => {
        const s = getVaccineStatus(v, child.dob, done);
        total++;
        if (s === "done") completed++;
        if (s === "overdue") overdue++;
        if (s === "due-soon") dueSoon++;
      });
    });
    return { pct: Math.round((completed / total) * 100), overdue, dueSoon };
  }, [completedState]);

  const overdueChildren = useMemo(() => {
    return mockChildren.filter((child) => {
      const done = completedState[child.id] || [];
      return immunizationSchedule.some((v) => getVaccineStatus(v, child.dob, done) === "overdue");
    }).map((child) => {
      const done = completedState[child.id] || [];
      const overdueVaccines = immunizationSchedule.filter((v) => getVaccineStatus(v, child.dob, done) === "overdue");
      return { child, vaccines: overdueVaccines };
    });
  }, [completedState]);

  const exportSupervisorPDF = () => {
    const stockRows = stock.map((s) => {
      const status = getStockStatus(s.current, s.minimum);
      const label = status === "severe" ? "Critical" : status === "risk" ? "Low" : "OK";
      const cls = status === "severe" ? "badge-red" : status === "risk" ? "badge-yellow" : "badge-green";
      return `<tr><td>${t(s.nameKey as TranslationKey)}</td><td>${s.current} ${s.unit}</td><td><span class="badge ${cls}">${label}</span></td></tr>`;
    }).join("");

    const vaccineRows = overdueChildren.map((e) =>
      `<tr><td>${e.child.name}</td><td>${e.child.village}</td><td>${e.vaccines.map((v) => v.name).join(", ")}</td></tr>`
    ).join("");

    const delayRows = childrenWithDelays.map((c) =>
      `<tr><td>${c.name}</td><td>${c.age}</td><td>${c.village}</td><td>${c.delays.map((d) => t(d as TranslationKey)).join(", ")}</td></tr>`
    ).join("");

    exportToPDF("Supervisor Report", `
      <h2>📦 Stock Status</h2>
      <table><thead><tr><th>Item</th><th>Current</th><th>Status</th></tr></thead><tbody>${stockRows}</tbody></table>
      <h2>💉 Vaccine Overdue (${overdueChildren.length} children)</h2>
      <table><thead><tr><th>Name</th><th>Village</th><th>Overdue Vaccines</th></tr></thead><tbody>${vaccineRows}</tbody></table>
      <h2>🧠 Development Delays (${childrenWithDelays.length} children)</h2>
      <table><thead><tr><th>Name</th><th>Age</th><th>Village</th><th>Delay Areas</th></tr></thead><tbody>${delayRows}</tbody></table>
    `);
  };

  const sectionLabels: Record<string, Record<string, string>> = {
    supervisorDashboard: { en: "Supervisor Dashboard", hi: "पर्यवेक्षक डैशबोर्ड", mr: "पर्यवेक्षक डॅशबोर्ड" },
    centerOverview: { en: "Center Overview & Analytics", hi: "केंद्र अवलोकन और विश्लेषण", mr: "केंद्र आढावा आणि विश्लेषण" },
    stockAlerts: { en: "Stock Alerts", hi: "स्टॉक अलर्ट", mr: "साठा अलर्ट" },
    vaccineCoverage: { en: "Vaccine Coverage", hi: "वैक्सीन कवरेज", mr: "लस कव्हरेज" },
    devDelays: { en: "Development Delays", hi: "विकास विलंब", mr: "विकास विलंब" },
    childrenAtRisk: { en: "Children at Risk", hi: "जोखिम वाले बच्चे", mr: "धोक्यातील मुले" },
    noAlerts: { en: "All stock levels sufficient ✓", hi: "सभी स्टॉक स्तर पर्याप्त ✓", mr: "सर्व साठा पातळी पुरेशी ✓" },
    overdueVaccines: { en: "Overdue Vaccines", hi: "विलंबित टीके", mr: "मुदत उलटलेल्या लसी" },
    noOverdue: { en: "No overdue vaccinations ✓", hi: "कोई विलंबित टीकाकरण नहीं ✓", mr: "मुदत उलटलेले लसीकरण नाही ✓" },
    delayAreas: { en: "Delay Areas", hi: "विलंब क्षेत्र", mr: "विलंब क्षेत्रे" },
    noDelays: { en: "No development delays detected ✓", hi: "कोई विकास विलंब नहीं ✓", mr: "विकास विलंब आढळले नाही ✓" },
    exportReport: { en: "Export Full Report", hi: "पूर्ण रिपोर्ट निर्यात", mr: "पूर्ण अहवाल निर्यात" },
    totalVisits: { en: "Total Visits", hi: "कुल विजिट", mr: "एकूण भेटी" },
    missedHouseholds: { en: "Missed Households", hi: "छूटे हुए घर", mr: "चुकलेली घरे" },
    missedPct: { en: "Missed %", hi: "छूटा %", mr: "चुकलेला %" },
    distanceCovered: { en: "Distance Covered", hi: "तय दूरी", mr: "अंतर कापले" },
    workerVisitStats: { en: "Worker Visit Summary", hi: "कार्यकर्ता विजिट सारांश", mr: "कर्मचारी भेट सारांश" },
    householdsNeedFollowUp: { en: "Households Needing Follow-up", hi: "अनुसरण आवश्यक घर", mr: "अनुसरण आवश्यक घरे" },
    workerTrends: { en: "Worker Trends", hi: "कार्यकर्ता रुझान", mr: "कर्मचारी ट्रेंड" },
    areaPerformance: { en: "Area-wise Performance", hi: "क्षेत्र-वार प्रदर्शन", mr: "क्षेत्रनिहाय कामगिरी" },
    attendanceRate: { en: "Attendance Rate", hi: "उपस्थिति दर", mr: "उपस्थिती दर" },
    visitsCompleted: { en: "Visits Done", hi: "विजिट पूर्ण", mr: "भेटी पूर्ण" },
    overallScore: { en: "Overall Score", hi: "कुल स्कोर", mr: "एकूण स्कोर" },
    monthlyTrend: { en: "Monthly Trend (6 months)", hi: "मासिक रुझान (6 महीने)", mr: "मासिक ट्रेंड (6 महिने)" },
    topPerformers: { en: "Top Performers", hi: "शीर्ष प्रदर्शक", mr: "सर्वोत्तम कामगिरी" },
    needsImprovement: { en: "Needs Improvement", hi: "सुधार आवश्यक", mr: "सुधारणा आवश्यक" },
    allAreas: { en: "All Areas", hi: "सभी क्षेत्र", mr: "सर्व क्षेत्रे" },
    timePeriod: { en: "Period", hi: "अवधि", mr: "कालावधी" },
    threeMonths: { en: "3 Months", hi: "3 महीने", mr: "3 महिने" },
    sixMonths: { en: "6 Months", hi: "6 महीने", mr: "6 महिने" },
    twelveMonths: { en: "12 Months", hi: "12 महीने", mr: "12 महिने" },
    viewProfile: { en: "View Profile", hi: "प्रोफ़ाइल देखें", mr: "प्रोफाइल पहा" },
    monthlyBreakdown: { en: "Monthly Breakdown", hi: "मासिक विवरण", mr: "मासिक तपशील" },
    skillRadar: { en: "Skills Overview", hi: "कौशल अवलोकन", mr: "कौशल्य आढावा" },
    performanceTrend: { en: "Performance Trend", hi: "प्रदर्शन रुझान", mr: "कामगिरी ट्रेंड" },
    homeVisits: { en: "Home Visits", hi: "घर विजिट", mr: "घरभेटी" },
    avgRating: { en: "Avg Rating", hi: "औसत रेटिंग", mr: "सरासरी रेटिंग" },
    childrenCovered: { en: "Children Covered", hi: "शामिल बच्चे", mr: "समाविष्ट मुले" },
    reportsSubmitted: { en: "Reports", hi: "रिपोर्ट", mr: "अहवाल" },
    rankings: { en: "Rankings", hi: "रैंकिंग", mr: "क्रमवारी" },
    rank: { en: "Rank", hi: "रैंक", mr: "क्रमांक" },
    workerName: { en: "Worker", hi: "कार्यकर्ता", mr: "कर्मचारी" },
    area: { en: "Area", hi: "क्षेत्र", mr: "क्षेत्र" },
    sortBy: { en: "Sort by", hi: "इसके अनुसार क्रमबद्ध", mr: "यानुसार क्रमवारी" },
    allWorkerRankings: { en: "All Worker Rankings", hi: "सभी कार्यकर्ता रैंकिंग", mr: "सर्व कर्मचारी क्रमवारी" },
    clickToSort: { en: "Click column to sort", hi: "क्रमबद्ध करने के लिए कॉलम पर क्लिक करें", mr: "क्रमवारीसाठी स्तंभावर क्लिक करा" },
  };

  const tl = (key: string) => sectionLabels[key]?.[lang] || sectionLabels[key]?.en || key;

  // Generate detailed monthly history for selected worker
  const workerMonthlyHistory = useMemo(() => {
    if (!selectedWorker) return [];
    const months = lang === "hi"
      ? ["जन", "फर", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अग", "सित", "अक्टू", "नवं", "दिसं"]
      : lang === "mr"
      ? ["जाने", "फेब्रु", "मार्च", "एप्रि", "मे", "जून", "जुलै", "ऑग", "सप्टें", "ऑक्टो", "नोव्हें", "डिसें"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const base = selectedWorker.score;
    // Seed from name for consistent data
    const seed = selectedWorker.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    
    return months.map((m, i) => {
      const variance = Math.sin(seed + i * 1.3) * 8;
      const att = Math.min(100, Math.max(50, Math.round(selectedWorker.attendance + variance - (11 - i) * 0.8)));
      const vis = Math.max(10, Math.round(selectedWorker.visits / 12 * (0.7 + Math.sin(seed + i) * 0.3) * 12));
      const vac = Math.min(100, Math.max(40, Math.round(selectedWorker.vaccineRate + variance * 0.7 - (11 - i) * 0.6)));
      const sc = Math.min(100, Math.max(40, Math.round(base + variance - (11 - i) * 0.7)));
      return { month: m, attendance: att, visits: vis, vaccineRate: vac, score: sc, children: Math.round(15 + Math.sin(seed + i) * 5), reports: Math.round(3 + Math.sin(seed + i * 2) * 2) };
    });
  }, [selectedWorker, lang]);

  const workerRadarData = useMemo(() => {
    if (!selectedWorker) return [];
    return [
      { skill: tl("attendanceRate"), value: selectedWorker.attendance },
      { skill: tl("homeVisits"), value: Math.min(100, Math.round(selectedWorker.visits * 2.2)) },
      { skill: t("vaccines"), value: selectedWorker.vaccineRate },
      { skill: tl("reportsSubmitted"), value: Math.min(100, Math.round(selectedWorker.score * 0.95 + 5)) },
      { skill: tl("childrenCovered"), value: Math.min(100, Math.round(selectedWorker.score * 1.02)) },
    ];
  }, [selectedWorker]);

  const sections = [
    { key: "overview" as const, labelKey: "summary" as TranslationKey },
    { key: "workers" as const, label: tl("workerTrends") },
    { key: "rankings" as const, label: tl("rankings") },
    { key: "stock" as const, labelKey: "stock" as TranslationKey },
    { key: "vaccine" as const, labelKey: "vaccines" as TranslationKey },
    { key: "development" as const, labelKey: "development" as TranslationKey },
    { key: "visits" as const, labelKey: "navVisits" as TranslationKey },
  ];

  // ─── Worker trends mock data ─────────────────────────────
  const workersByArea = useMemo(() => [
    { area: "Rampur", workers: [
      { name: "Sunita Devi", attendance: 94, visits: 42, vaccineRate: 88, score: 91, trend: "up" },
      { name: "Geeta Kumari", attendance: 87, visits: 35, vaccineRate: 82, score: 84, trend: "stable" },
    ]},
    { area: "Sundarpur", workers: [
      { name: "Kavita Singh", attendance: 78, visits: 28, vaccineRate: 75, score: 72, trend: "down" },
      { name: "Rani Yadav", attendance: 91, visits: 38, vaccineRate: 90, score: 89, trend: "up" },
    ]},
    { area: "Keshavpur", workers: [
      { name: "Meena Sharma", attendance: 82, visits: 30, vaccineRate: 70, score: 76, trend: "stable" },
      { name: "Pooja Gupta", attendance: 69, visits: 22, vaccineRate: 65, score: 63, trend: "down" },
    ]},
    { area: "Laxmipur", workers: [
      { name: "Sarita Devi", attendance: 96, visits: 45, vaccineRate: 92, score: 94, trend: "up" },
    ]},
  ], []);

  const allMonthlyData = useMemo(() => [
    { month: lang === "hi" ? "अप्रैल" : lang === "mr" ? "एप्रिल" : "Apr", Rampur: 78, Sundarpur: 70, Keshavpur: 66, Laxmipur: 84, idx: 0 },
    { month: lang === "hi" ? "मई" : lang === "mr" ? "मे" : "May", Rampur: 79, Sundarpur: 71, Keshavpur: 67, Laxmipur: 85, idx: 1 },
    { month: lang === "hi" ? "जून" : lang === "mr" ? "जून" : "Jun", Rampur: 80, Sundarpur: 72, Keshavpur: 68, Laxmipur: 86, idx: 2 },
    { month: lang === "hi" ? "जुलाई" : lang === "mr" ? "जुलै" : "Jul", Rampur: 80, Sundarpur: 73, Keshavpur: 67, Laxmipur: 87, idx: 3 },
    { month: lang === "hi" ? "अगस्त" : lang === "mr" ? "ऑगस्ट" : "Aug", Rampur: 81, Sundarpur: 73, Keshavpur: 69, Laxmipur: 87, idx: 4 },
    { month: lang === "hi" ? "सितंबर" : lang === "mr" ? "सप्टें" : "Sep", Rampur: 81, Sundarpur: 74, Keshavpur: 69, Laxmipur: 88, idx: 5 },
    { month: lang === "hi" ? "अक्टू" : lang === "mr" ? "ऑक्टो" : "Oct", Rampur: 82, Sundarpur: 74, Keshavpur: 70, Laxmipur: 88, idx: 6 },
    { month: lang === "hi" ? "नवं" : lang === "mr" ? "नोव्हें" : "Nov", Rampur: 85, Sundarpur: 76, Keshavpur: 72, Laxmipur: 90, idx: 7 },
    { month: lang === "hi" ? "दिसं" : lang === "mr" ? "डिसें" : "Dec", Rampur: 83, Sundarpur: 78, Keshavpur: 68, Laxmipur: 91, idx: 8 },
    { month: lang === "hi" ? "जन" : lang === "mr" ? "जाने" : "Jan", Rampur: 87, Sundarpur: 80, Keshavpur: 74, Laxmipur: 93, idx: 9 },
    { month: lang === "hi" ? "फर" : lang === "mr" ? "फेब्रु" : "Feb", Rampur: 88, Sundarpur: 77, Keshavpur: 73, Laxmipur: 94, idx: 10 },
    { month: lang === "hi" ? "मार्च" : lang === "mr" ? "मार्च" : "Mar", Rampur: 88, Sundarpur: 79, Keshavpur: 70, Laxmipur: 95, idx: 11 },
  ], [lang]);

  const monthlyTrendData = useMemo(() => {
    const count = workerTimeFilter === "3m" ? 3 : workerTimeFilter === "6m" ? 6 : 12;
    return allMonthlyData.slice(-count);
  }, [allMonthlyData, workerTimeFilter]);

  const filteredAreas = useMemo(() => 
    workerAreaFilter === "all" ? workersByArea : workersByArea.filter(a => a.area === workerAreaFilter)
  , [workersByArea, workerAreaFilter]);

  const areaBarData = useMemo(() => filteredAreas.map(a => {
    const avgAtt = Math.round(a.workers.reduce((s, w) => s + w.attendance, 0) / a.workers.length);
    const avgScore = Math.round(a.workers.reduce((s, w) => s + w.score, 0) / a.workers.length);
    return { area: a.area, [tl("attendanceRate")]: avgAtt, [tl("overallScore")]: avgScore };
  }), [filteredAreas]);

  const areaNames = useMemo(() => workersByArea.map(a => a.area), [workersByArea]);
  const visibleAreaNames = useMemo(() => filteredAreas.map(a => a.area), [filteredAreas]);

  // Ranked workers across all areas
  const rankedWorkers = useMemo(() => {
    const all = workersByArea.flatMap(a => a.workers.map(w => ({ ...w, area: a.area })));
    return [...all].sort((a, b) => {
      const aVal = a[rankingSortBy] as number;
      const bVal = b[rankingSortBy] as number;
      return rankingSortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [workersByArea, rankingSortBy, rankingSortDir]);

  const toggleRankingSort = useCallback((col: "score" | "attendance" | "visits" | "vaccineRate") => {
    if (rankingSortBy === col) {
      setRankingSortDir(d => d === "desc" ? "asc" : "desc");
    } else {
      setRankingSortBy(col);
      setRankingSortDir("desc");
    }
  }, [rankingSortBy]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{tl("supervisorDashboard")}</h2>
          <p className="text-xs text-muted-foreground">{tl("centerOverview")}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={exportSupervisorPDF}
          className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-primary/20"
        >
          <Download className="w-3.5 h-3.5" /> PDF
        </motion.button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeSection === s.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {'label' in s ? s.label : t((s as any).labelKey)}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW ────────────────────────────────────── */}
      {activeSection === "overview" && (
        <div className="space-y-5">
          {/* Top Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Users} label={t("totalChildren")} value={mockChildren.length} trend={`${mockChildren.length} registered`} color="ai" delay={0} />
            <StatCard icon={Package} label={tl("stockAlerts")} value={stockAlerts.length} trend={`${lowStockCount} low`} color={stockAlerts.length > 0 ? "severe" : "normal"} delay={1} />
            <StatCard icon={Syringe} label={t("vaccinated")} value={`${vaccineStats.pct}%`} trend={`${vaccineStats.overdue} ${t("overdue").toLowerCase()}`} color={vaccineStats.overdue > 0 ? "risk" : "normal"} delay={2} />
            <StatCard icon={Brain} label={tl("devDelays")} value={childrenWithDelays.length} trend={tl("childrenAtRisk")} color={childrenWithDelays.length > 0 ? "risk" : "normal"} delay={3} />
          </div>

          {/* Critical Alerts */}
          {stockAlerts.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              {stockAlerts.map((a) => (
                <div key={a.id} className="health-badge-severe p-3 rounded-xl border border-health-severe/20 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-health-severe flex-shrink-0" />
                  <p className="text-xs font-semibold text-health-severe-foreground">
                    ⚠ {t(a.nameKey as TranslationKey)}: {a.current} {a.unit} ({t("critical").toLowerCase()})
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {overdueChildren.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-2">
              {overdueChildren.slice(0, 3).map((e) => (
                <div key={e.child.id} className="health-badge-risk p-3 rounded-xl border border-health-risk/20 flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-health-risk flex-shrink-0" />
                  <p className="text-xs font-semibold text-health-risk-foreground">
                    {e.child.name}: {e.vaccines.map((v) => v.name).join(", ")} {t("overdue").toLowerCase()}
                  </p>
                </div>
              ))}
            </motion.div>
          )}

          {/* Quick Links */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Package, labelKey: "stock" as TranslationKey, path: "/nutrition", color: "bg-health-risk-bg text-health-risk" },
              { icon: Syringe, labelKey: "vaccines" as TranslationKey, path: "/vaccines", color: "bg-health-normal-bg text-health-normal" },
              { icon: Users, labelKey: "children" as TranslationKey, path: "/children", color: "bg-health-ai-bg text-health-ai" },
            ].map((a, i) => (
              <motion.button
                key={a.labelKey}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                onClick={() => navigate(a.path)}
                className="stat-card flex flex-col items-center gap-2 py-4 active:scale-95 transition-transform"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.color}`}>
                  <a.icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium">{t(a.labelKey)}</span>
              </motion.button>
            ))}
          </div>

          {/* Compare Centers Button */}
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/compare")}
            className="w-full py-3 rounded-xl bg-accent/10 border border-accent/20 text-accent font-semibold text-sm flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            {lang === "hi" ? "केंद्रों की तुलना करें" : lang === "mr" ? "केंद्रांची तुलना करा" : "Compare Centers"}
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {/* ─── WORKER TRENDS ─────────────────────────────────── */}
      {activeSection === "workers" && (
        <div className="space-y-5">
          {/* Filter Controls */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold">{lang === "hi" ? "फ़िल्टर" : lang === "mr" ? "फिल्टर" : "Filters"}</span>
            </div>
            <div className="space-y-3">
              {/* Area filter */}
              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5">{tl("areaPerformance")}</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setWorkerAreaFilter("all")}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
                      workerAreaFilter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {tl("allAreas")}
                  </button>
                  {areaNames.map(name => (
                    <button
                      key={name}
                      onClick={() => setWorkerAreaFilter(name)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
                        workerAreaFilter === name ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Time filter */}
              <div>
                <p className="text-[10px] text-muted-foreground mb-1.5">{tl("timePeriod")}</p>
                <div className="flex gap-1.5">
                  {([["3m", tl("threeMonths")], ["6m", tl("sixMonths")], ["12m", tl("twelveMonths")]] as const).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setWorkerTimeFilter(val as "3m" | "6m" | "12m")}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                        workerTimeFilter === val ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      <Calendar className="w-3 h-3" /> {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Area-wise bar chart */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="stat-card">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> {tl("areaPerformance")}
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={areaBarData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="area" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                  <Bar dataKey={tl("attendanceRate")} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={tl("overallScore")} fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2 justify-center">
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-2.5 h-2.5 rounded-sm bg-primary" /> {tl("attendanceRate")}</span>
              <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-2.5 h-2.5 rounded-sm bg-accent" /> {tl("overallScore")}</span>
            </div>
          </motion.div>

          {/* Monthly trend line chart */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" /> {tl("monthlyTrend")}
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[50, 100]} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                  {visibleAreaNames.includes("Rampur") && <Line type="monotone" dataKey="Rampur" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />}
                  {visibleAreaNames.includes("Sundarpur") && <Line type="monotone" dataKey="Sundarpur" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ r: 3 }} />}
                  {visibleAreaNames.includes("Keshavpur") && <Line type="monotone" dataKey="Keshavpur" stroke="hsl(var(--health-risk))" strokeWidth={2} dot={{ r: 3 }} />}
                  {visibleAreaNames.includes("Laxmipur") && <Line type="monotone" dataKey="Laxmipur" stroke="hsl(var(--health-normal))" strokeWidth={2} dot={{ r: 3 }} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Workers by area cards */}
          {filteredAreas.map((area, ai) => (
            <motion.div
              key={area.area}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + ai * 0.05 }}
            >
              <h3 className="section-title flex items-center gap-2 mb-2">
                <MapPin className="w-3.5 h-3.5" /> {area.area}
              </h3>
              <div className="space-y-2">
                {area.workers.map((w, wi) => (
                  <motion.div
                    key={w.name}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + ai * 0.05 + wi * 0.03 }}
                    className="stat-card cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => setSelectedWorker({ ...w, area: area.area })}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        w.score >= 85 ? "bg-health-normal-bg" : w.score >= 70 ? "bg-health-risk-bg" : "bg-health-severe-bg"
                      }`}>
                        <UserCheck className={`w-4 h-4 ${
                          w.score >= 85 ? "text-health-normal" : w.score >= 70 ? "text-health-risk" : "text-health-severe"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold">{w.name}</p>
                        <p className="text-[10px] text-muted-foreground">{tl("overallScore")}: {w.score}%</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {w.trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-health-normal" />}
                        {w.trend === "down" && <TrendingUp className="w-3.5 h-3.5 text-health-severe rotate-180" />}
                        {w.trend === "stable" && <Activity className="w-3.5 h-3.5 text-muted-foreground" />}
                        <StatusBadge status={w.score >= 85 ? "normal" : w.score >= 70 ? "risk" : "severe"}>
                          {w.score >= 85 ? "★" : w.score >= 70 ? "▬" : "▼"} {w.score}%
                        </StatusBadge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-1.5 rounded-lg bg-secondary">
                        <p className="text-xs font-bold">{w.attendance}%</p>
                        <p className="text-[9px] text-muted-foreground">{tl("attendanceRate")}</p>
                      </div>
                      <div className="text-center p-1.5 rounded-lg bg-secondary">
                        <p className="text-xs font-bold">{w.visits}</p>
                        <p className="text-[9px] text-muted-foreground">{tl("visitsCompleted")}</p>
                      </div>
                      <div className="text-center p-1.5 rounded-lg bg-secondary">
                        <p className="text-xs font-bold">{w.vaccineRate}%</p>
                        <p className="text-[9px] text-muted-foreground">{t("vaccines")}</p>
                      </div>
                    </div>
                    <p className="text-[9px] text-primary mt-2 text-center font-medium">{tl("viewProfile")} →</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeSection === "stock" && (
        <div className="space-y-3">
          {stock.map((item, i) => {
            const status = getStockStatus(item.current, item.minimum);
            const pct = Math.min((item.current / item.maximum) * 100, 100);
            const statusLabel = status === "severe" ? t("critical") : status === "risk" ? t("lowStock") : t("sufficient");
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="stat-card"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">{t(item.nameKey as TranslationKey)}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{item.current} {item.unit}</span>
                    <StatusBadge status={status}>{statusLabel}</StatusBadge>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      status === "severe" ? "bg-health-severe" : status === "risk" ? "bg-health-risk" : "bg-health-normal"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.05 }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Min: {item.minimum} {item.unit}</p>
              </motion.div>
            );
          })}

          {stockAlerts.length === 0 && (
            <div className="text-center py-8 text-sm text-muted-foreground">{tl("noAlerts")}</div>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/nutrition")}
            className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2"
          >
            {t("viewAll")} <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {/* ─── VACCINE DETAIL ────────────────────────────────── */}
      {activeSection === "vaccine" && (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="stat-card text-center">
              <div className="w-10 h-10 rounded-xl bg-health-normal-bg flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5 text-health-normal" />
              </div>
              <p className="text-xl font-bold text-health-normal">{vaccineStats.pct}%</p>
              <p className="text-[10px] text-muted-foreground">{t("vaccinated")}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="stat-card text-center">
              <div className="w-10 h-10 rounded-xl bg-health-severe-bg flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-5 h-5 text-health-severe" />
              </div>
              <p className="text-xl font-bold text-health-severe">{vaccineStats.overdue}</p>
              <p className="text-[10px] text-muted-foreground">{t("overdue")}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card text-center">
              <div className="w-10 h-10 rounded-xl bg-health-risk-bg flex items-center justify-center mx-auto mb-2">
                <Clock className="w-5 h-5 text-health-risk" />
              </div>
              <p className="text-xl font-bold text-health-risk">{vaccineStats.dueSoon}</p>
              <p className="text-[10px] text-muted-foreground">{t("dueSoon")}</p>
            </motion.div>
          </div>

          {/* Overdue list */}
          <h3 className="section-title flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5" /> {tl("overdueVaccines")}
          </h3>
          {overdueChildren.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">{tl("noOverdue")}</div>
          ) : (
            overdueChildren.map((entry, i) => (
              <motion.div
                key={entry.child.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/child/${entry.child.id}`)}
                className="stat-card flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="w-10 h-10 rounded-xl bg-health-severe-bg flex items-center justify-center text-lg">💉</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{entry.child.name}</p>
                  <p className="text-[10px] text-muted-foreground">{entry.child.village}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {entry.vaccines.map((v) => (
                      <StatusBadge key={v.id} status="severe">{v.name}</StatusBadge>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </motion.div>
            ))
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/vaccines")}
            className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2"
          >
            {t("viewAll")} <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {/* ─── DEVELOPMENT DELAY DETAIL ──────────────────────── */}
      {activeSection === "development" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon={Brain} label={tl("devDelays")} value={childrenWithDelays.length} color={childrenWithDelays.length > 0 ? "risk" : "normal"} delay={0} />
            <StatCard icon={Activity} label={t("totalChildren")} value={mockChildren.length} trend={`${Math.round(((mockChildren.length - childrenWithDelays.length) / mockChildren.length) * 100)}% ${t("normal").toLowerCase()}`} color="normal" delay={1} />
          </div>

          <h3 className="section-title flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" /> {tl("childrenAtRisk")}
          </h3>

          {childrenWithDelays.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted-foreground">{tl("noDelays")}</div>
          ) : (
            childrenWithDelays.map((child, i) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/child/${child.id}`)}
                className="stat-card cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-health-risk-bg flex items-center justify-center text-lg">🧠</div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{child.name}</p>
                    <p className="text-[10px] text-muted-foreground">{child.age} · {child.village}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2 ml-13">
                  <span className="text-[10px] text-muted-foreground">{tl("delayAreas")}:</span>
                  <div className="flex flex-wrap gap-1">
                    {child.delays.map((d) => (
                      <StatusBadge key={d} status="risk">{t(d as TranslationKey)}</StatusBadge>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/children")}
            className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2"
          >
            {t("viewAll")} <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}

      {/* ─── VISITS DETAIL ──────────────────────────────────── */}
      {activeSection === "visits" && (() => {
        const savedVisits: { id: string; householdId: string; date: string; time: string; lat: number | null; lng: number | null; workerName: string }[] = JSON.parse(localStorage.getItem("gps-visits") || "[]");
        const totalHouseholds = 8;
        const visitedHouseholdIds = new Set(savedVisits.map((v) => v.householdId));
        const missedCount = totalHouseholds - visitedHouseholdIds.size;
        const missedPct = Math.round((missedCount / totalHouseholds) * 100);
        // Estimate distance: ~0.5km per visit
        const distanceKm = (savedVisits.length * 0.5).toFixed(1);

        const followUpHouseholds = [
          { id: "h1", name: "Kumari Family", village: "Rampur", child: "Priya Kumari", isHighRisk: true },
          { id: "h2", name: "Singh Family", village: "Sundarpur", child: "Arjun Singh", isHighRisk: false },
          { id: "h3", name: "Devi Family", village: "Rampur", child: "Meera Devi", isHighRisk: false },
          { id: "h4", name: "Kumar Family", village: "Keshavpur", child: "Rahul Kumar", isHighRisk: true },
          { id: "h5", name: "Sharma Family", village: "Rampur", child: "Anita Sharma", isHighRisk: false },
          { id: "h6", name: "Yadav Family", village: "Sundarpur", child: "Vikram Yadav", isHighRisk: false },
          { id: "h7", name: "Kumari-K Family", village: "Keshavpur", child: "Sita Kumari", isHighRisk: true },
          { id: "h8", name: "Prasad Family", village: "Rampur", child: "Ravi Prasad", isHighRisk: false },
        ].filter((h) => !visitedHouseholdIds.has(h.id));

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <StatCard icon={Navigation} label={tl("totalVisits")} value={savedVisits.length} trend={`by Sunita`} color="ai" delay={0} />
              <StatCard icon={AlertTriangle} label={tl("missedHouseholds")} value={missedCount} trend={`${missedPct}%`} color={missedCount > 0 ? "severe" : "normal"} delay={1} />
              <StatCard icon={MapPin} label={tl("distanceCovered")} value={`${distanceKm} km`} color="normal" delay={2} />
              <StatCard icon={Users} label={t("totalChildren")} value={totalHouseholds} trend={`${visitedHouseholdIds.size} ${tl("totalVisits").toLowerCase()}`} color="ai" delay={3} />
            </div>

            {followUpHouseholds.length > 0 && (
              <>
                <h3 className="section-title flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" /> {tl("householdsNeedFollowUp")}
                </h3>
                {followUpHouseholds.map((h, i) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="stat-card flex items-center gap-3"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${h.isHighRisk ? "bg-health-severe-bg" : "bg-health-risk-bg"}`}>
                      <AlertTriangle className={`w-4 h-4 ${h.isHighRisk ? "text-health-severe" : "text-health-risk"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{h.name}</p>
                      <p className="text-[10px] text-muted-foreground">{h.village} · {h.child}</p>
                    </div>
                    <StatusBadge status={h.isHighRisk ? "severe" : "risk"}>
                      {h.isHighRisk ? "⚠ High Risk" : "Not visited"}
                    </StatusBadge>
                  </motion.div>
                ))}
              </>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/visits")}
              className="w-full py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2"
            >
              {t("viewAll")} <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        );
      })()}

      {/* ─── WORKER PROFILE DIALOG ──────────────────────────── */}
      <Dialog open={!!selectedWorker} onOpenChange={(open) => !open && setSelectedWorker(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedWorker && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selectedWorker.score >= 85 ? "bg-health-normal-bg" : selectedWorker.score >= 70 ? "bg-health-risk-bg" : "bg-health-severe-bg"
                  }`}>
                    <UserCheck className={`w-5 h-5 ${
                      selectedWorker.score >= 85 ? "text-health-normal" : selectedWorker.score >= 70 ? "text-health-risk" : "text-health-severe"
                    }`} />
                  </div>
                  <div>
                    <p className="text-base font-bold">{selectedWorker.name}</p>
                    <p className="text-xs text-muted-foreground font-normal flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {selectedWorker.area}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[
                  { label: tl("attendanceRate"), value: `${selectedWorker.attendance}%`, icon: UserCheck },
                  { label: tl("homeVisits"), value: selectedWorker.visits, icon: Home },
                  { label: t("vaccines"), value: `${selectedWorker.vaccineRate}%`, icon: Syringe },
                  { label: tl("overallScore"), value: `${selectedWorker.score}%`, icon: Award },
                ].map((s, i) => (
                  <div key={i} className="text-center p-2 rounded-xl bg-secondary">
                    <s.icon className="w-3.5 h-3.5 mx-auto mb-1 text-primary" />
                    <p className="text-sm font-bold">{s.value}</p>
                    <p className="text-[8px] text-muted-foreground leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Radar Chart - Skills */}
              <div className="mt-4">
                <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-accent" /> {tl("skillRadar")}
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={workerRadarData} outerRadius="70%">
                      <PolarGrid strokeDasharray="3 3" className="opacity-30" />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 9 }} />
                      <PolarRadiusAxis tick={{ fontSize: 8 }} domain={[0, 100]} />
                      <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance Trend - Area Chart */}
              <div className="mt-4">
                <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" /> {tl("performanceTrend")}
                </h4>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={workerMonthlyHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="month" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} domain={[40, 100]} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 12 }} />
                      <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} name={tl("overallScore")} />
                      <Area type="monotone" dataKey="attendance" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.1} strokeWidth={1.5} name={tl("attendanceRate")} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Breakdown Table */}
              <div className="mt-4">
                <h4 className="text-xs font-bold mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> {tl("monthlyBreakdown")}
                </h4>
                <div className="rounded-xl border overflow-hidden">
                  <div className="grid grid-cols-5 gap-0 text-[9px] font-semibold text-muted-foreground bg-secondary p-2">
                    <span>{lang === "hi" ? "माह" : lang === "mr" ? "महिना" : "Month"}</span>
                    <span className="text-center">{tl("attendanceRate")}</span>
                    <span className="text-center">{tl("homeVisits")}</span>
                    <span className="text-center">{t("vaccines")}</span>
                    <span className="text-center">{tl("overallScore")}</span>
                  </div>
                  {workerMonthlyHistory.map((m, i) => (
                    <div key={i} className={`grid grid-cols-5 gap-0 text-[10px] p-2 ${i % 2 === 0 ? "" : "bg-secondary/50"}`}>
                      <span className="font-medium">{m.month}</span>
                      <span className="text-center">{m.attendance}%</span>
                      <span className="text-center">{m.visits}</span>
                      <span className="text-center">{m.vaccineRate}%</span>
                      <span className={`text-center font-bold ${
                        m.score >= 85 ? "text-health-normal" : m.score >= 70 ? "text-health-risk" : "text-health-severe"
                      }`}>{m.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupervisorDashboard;
