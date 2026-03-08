import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  Brain,
  TrendingUp,
  Bell,
  ChevronRight,
  Baby,
  Activity,
  MapPin,
  ClipboardCheck,
  BookOpen,
  Utensils,
  HeartPulse,
  X,
  Package,
  Syringe,
  BarChart3,
  Navigation,
  Camera,
  FileText,
  Download,
} from "lucide-react";
import { StatCard, StatusBadge, RiskGauge } from "@/components/HealthWidgets";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRole, roleLabels, roleIcons, roleColors, type UserRole } from "@/contexts/RoleContext";

const mockHighRisk = [
  { id: "1", name: "Priya Kumari", age: "2y 4m", score: 78, issue: "Severe underweight", village: "Rampur" },
  { id: "2", name: "Arjun Singh", age: "1y 8m", score: 65, issue: "Anemia detected", village: "Sundarpur" },
  { id: "3", name: "Meera Devi", age: "3y 1m", score: 72, issue: "Growth faltering", village: "Rampur" },
  { id: "4", name: "Rahul Kumar", age: "0y 11m", score: 58, issue: "Low weight gain", village: "Keshavpur" },
];

const mockReminders = [
  { text: { en: "Immunization due: 4 children", hi: "टीकाकरण बाकी: 4 बच्चे", mr: "लसीकरण बाकी: 4 मुले" }, type: "risk" as const, time: { en: "Today", hi: "आज", mr: "आज" } },
  { text: { en: "Monthly weighing: 12 pending", hi: "मासिक वजन: 12 बाकी", mr: "मासिक वजन: 12 बाकी" }, type: "normal" as const, time: { en: "This week", hi: "इस सप्ताह", mr: "या आठवड्यात" } },
  { text: { en: "Priya Kumari: Follow-up visit", hi: "प्रिया कुमारी: फॉलो-अप विजिट", mr: "प्रिया कुमारी: फॉलो-अप भेट" }, type: "severe" as const, time: { en: "Overdue", hi: "विलंबित", mr: "मुदत उलटलेली" } },
  { text: { en: "THR distribution: 28 packets", hi: "THR वितरण: 28 पैकेट", mr: "THR वितरण: 28 पॅकेट" }, type: "ai" as const, time: { en: "Tomorrow", hi: "कल", mr: "उद्या" } },
];

// Role-specific welcome messages
const welcomeMessages: Record<string, Record<UserRole, { greeting: string; subtitle: string }>> = {
  en: {
    worker: { greeting: "Good morning, Sunita! 👩‍⚕️", subtitle: "Your daily tasks and children overview" },
    supervisor: { greeting: "Welcome, Supervisor! 👨‍💼", subtitle: "Monitor centers and review performance" },
    district_officer: { greeting: "Welcome, District Officer! 🏛️", subtitle: "District-wide analytics and oversight" },
  },
  hi: {
    worker: { greeting: "सुप्रभात, सुनीता! 👩‍⚕️", subtitle: "आपके दैनिक कार्य और बच्चों का अवलोकन" },
    supervisor: { greeting: "स्वागत है, पर्यवेक्षक! 👨‍💼", subtitle: "केंद्रों की निगरानी और प्रदर्शन समीक्षा" },
    district_officer: { greeting: "स्वागत है, जिला अधिकारी! 🏛️", subtitle: "जिला-स्तरीय विश्लेषण और निगरानी" },
  },
  mr: {
    worker: { greeting: "सुप्रभात, सुनीता! 👩‍⚕️", subtitle: "तुमची दैनंदिन कामे आणि मुलांचा आढावा" },
    supervisor: { greeting: "स्वागत, पर्यवेक्षक! 👨‍💼", subtitle: "केंद्रांचे निरीक्षण आणि कामगिरी आढावा" },
    district_officer: { greeting: "स्वागत, जिल्हा अधिकारी! 🏛️", subtitle: "जिल्हा-स्तरीय विश्लेषण आणि देखरेख" },
  },
};

// Role-specific quick actions
const roleQuickActions: Record<UserRole, { icon: any; labelKey: string; color: string; path: string }[]> = {
  worker: [
    { icon: Package, labelKey: "stock", color: "bg-health-risk-bg text-health-risk", path: "/nutrition" },
    { icon: Syringe, labelKey: "vaccines", color: "bg-health-normal-bg text-health-normal", path: "/vaccines" },
    { icon: Camera, labelKey: "aiScan", color: "bg-health-advanced-bg text-health-advanced", path: "/scan" },
    { icon: Baby, labelKey: "addChild", color: "bg-health-ai-bg text-health-ai", path: "/children/add" },
    { icon: Navigation, labelKey: "navVisits", color: "bg-health-normal-bg text-health-normal", path: "/visits" },
    { icon: BookOpen, labelKey: "learn", color: "bg-health-ai-bg text-health-ai", path: "/learn" },
  ],
  supervisor: [
    { icon: BarChart3, labelKey: "compareCenters", color: "bg-accent/10 text-accent", path: "/compare" },
    { icon: ClipboardCheck, labelKey: "supervisorDashboard", color: "bg-health-ai-bg text-health-ai", path: "/supervisor" },
    { icon: Syringe, labelKey: "vaccines", color: "bg-health-normal-bg text-health-normal", path: "/vaccines" },
    { icon: Package, labelKey: "stock", color: "bg-health-risk-bg text-health-risk", path: "/nutrition" },
    { icon: Users, labelKey: "navChildren", color: "bg-primary/10 text-primary", path: "/children" },
    { icon: Navigation, labelKey: "navVisits", color: "bg-health-normal-bg text-health-normal", path: "/visits" },
  ],
  district_officer: [
    { icon: BarChart3, labelKey: "compareCenters", color: "bg-accent/10 text-accent", path: "/compare" },
    { icon: ClipboardCheck, labelKey: "supervisorDashboard", color: "bg-health-ai-bg text-health-ai", path: "/supervisor" },
    { icon: Users, labelKey: "navChildren", color: "bg-primary/10 text-primary", path: "/children" },
    { icon: Syringe, labelKey: "vaccines", color: "bg-health-normal-bg text-health-normal", path: "/vaccines" },
    { icon: Package, labelKey: "stock", color: "bg-health-risk-bg text-health-risk", path: "/nutrition" },
    { icon: MapPin, labelKey: "navMap", color: "bg-health-severe-bg text-health-severe", path: "/map" },
  ],
};

// Labels for new keys
const dashLabels: Record<string, Record<string, string>> = {
  en: { compareCenters: "Compare Centers", supervisorDashboard: "Dashboard", quickActions: "Quick Actions" },
  hi: { compareCenters: "केंद्र तुलना", supervisorDashboard: "डैशबोर्ड", quickActions: "त्वरित कार्य" },
  mr: { compareCenters: "केंद्र तुलना", supervisorDashboard: "डॅशबोर्ड", quickActions: "जलद क्रिया" },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [showSessionPicker, setShowSessionPicker] = useState(false);
  const { lang, t } = useLanguage();
  const { role } = useRole();

  const welcome = (welcomeMessages[lang] || welcomeMessages.en)[role];
  const actions = roleQuickActions[role];
  const dl = (key: string) => dashLabels[lang]?.[key] || dashLabels.en[key] || key;

  // Helper to get label — use t() for known keys, dl() for new ones
  const getLabel = (key: string) => {
    try { return t(key as any); } catch { return dl(key); }
  };

  const sessionTypes = [
    { labelKey: "teachingSession" as const, icon: BookOpen, color: "bg-health-ai/10 text-health-ai" },
    { labelKey: "nutritionDistribution" as const, icon: Utensils, color: "bg-health-normal/10 text-health-normal" },
    { labelKey: "healthCheckSession" as const, icon: HeartPulse, color: "bg-health-severe/10 text-health-severe" },
  ];

  return (
    <div className="page-container">
      {/* Role-specific Greeting */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${roleColors[role]}`}>
            {roleIcons[role]}
          </div>
          <div>
            <h2 className="text-xl font-bold">{welcome.greeting}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{welcome.subtitle}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {role === "district_officer" ? (
          <>
            <StatCard icon={MapPin} label="Total Centers" value={5} trend="3 districts" color="ai" delay={0} />
            <StatCard icon={Users} label={t("totalChildren")} value={137} trend="5 centers" color="normal" delay={1} />
            <StatCard icon={AlertTriangle} label={t("atRisk")} value={29} trend="21.2%" color="risk" delay={2} />
            <StatCard icon={ShieldAlert} label={t("severe")} value={12} trend="8.8%" color="severe" delay={3} />
          </>
        ) : role === "supervisor" ? (
          <>
            <StatCard icon={Users} label={t("totalChildren")} value={137} trend="5 centers" color="ai" delay={0} />
            <StatCard icon={TrendingUp} label={t("normal")} value={96} trend="70.1%" color="normal" delay={1} />
            <StatCard icon={AlertTriangle} label={t("atRisk")} value={29} trend="21.2%" color="risk" delay={2} />
            <StatCard icon={ShieldAlert} label={t("severe")} value={12} trend="8.8%" color="severe" delay={3} />
          </>
        ) : (
          <>
            <StatCard icon={Users} label={t("totalChildren")} value={32} trend="+3 this month" color="ai" delay={0} />
            <StatCard icon={TrendingUp} label={t("normal")} value={20} trend="62.5%" color="normal" delay={1} />
            <StatCard icon={AlertTriangle} label={t("atRisk")} value={8} trend="25%" color="risk" delay={2} />
            <StatCard icon={ShieldAlert} label={t("severe")} value={4} trend="12.5%" color="severe" delay={3} />
          </>
        )}
      </div>

      {/* Take Attendance — Worker & Supervisor only */}
      {(role === "worker" || role === "supervisor") && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowSessionPicker(true)}
          className="w-full mb-6 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-primary/20 active:scale-[0.97] transition-transform"
        >
          <ClipboardCheck className="w-5 h-5" />
          {t("takeAttendance")}
        </motion.button>
      )}

      {/* Session Picker Modal */}
      <AnimatePresence>
        {showSessionPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center p-4"
            onClick={() => setShowSessionPicker(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-background rounded-2xl p-5 pb-8 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold">{t("selectSessionType")}</h3>
                <button
                  onClick={() => setShowSessionPicker(false)}
                  className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {sessionTypes.map((s, i) => (
                  <motion.button
                    key={s.labelKey}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => {
                      setShowSessionPicker(false);
                      navigate(`/attendance?session=${encodeURIComponent(t(s.labelKey))}`);
                    }}
                    className="stat-card w-full flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold">{t(s.labelKey)}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Insight Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="health-badge-ai p-4 rounded-xl mb-6 border border-health-ai/20"
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-health-ai/10 flex items-center justify-center flex-shrink-0">
            <Brain className="w-5 h-5 text-health-ai" />
          </div>
          <div>
            <p className="text-sm font-semibold text-health-ai-foreground">{t("aiInsight")}</p>
            <p className="text-xs text-health-ai-foreground/80 mt-0.5">
              {role === "district_officer"
                ? (lang === "hi" ? "कुपोषण दर 3 में से 2 केंद्रों में बढ़ रही है। तत्काल ध्यान आवश्यक।" :
                   lang === "mr" ? "3 पैकी 2 केंद्रांमध्ये कुपोषण दर वाढत आहे. तातडीचे लक्ष आवश्यक." :
                   "Malnutrition rate rising in 2 of 3 blocks. AWC Keshavpur needs immediate intervention.")
                : role === "supervisor"
                ? (lang === "hi" ? "AWC केशवपुर में 44% कुपोषण दर — स्टॉक और विजिट सहायता बढ़ाएं।" :
                   lang === "mr" ? "AWC केशवपूरमध्ये 44% कुपोषण दर — साठा आणि भेट सहाय्य वाढवा." :
                   "AWC Keshavpur has 44% malnutrition rate — increase stock and visit support.")
                : t("aiInsightText")
              }
            </p>
          </div>
        </div>
      </motion.div>

      {/* Community Risk Alert — Worker only */}
      {role === "worker" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="health-badge-severe p-4 rounded-xl mb-6 border border-health-severe/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-health-severe/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-health-severe" />
            </div>
            <div>
              <p className="text-sm font-semibold text-health-severe-foreground">{t("communityAlert")}</p>
              <p className="text-xs text-health-severe-foreground/80 mt-0.5">{t("communityAlertText")}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Supervisor/DO: Center performance summary */}
      {(role === "supervisor" || role === "district_officer") && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="stat-card mb-6"
        >
          <h3 className="section-title mb-3">
            {lang === "hi" ? "केंद्र प्रदर्शन" : lang === "mr" ? "केंद्र कामगिरी" : "Center Performance"}
          </h3>
          <div className="space-y-2">
            {[
              { name: "AWC Sundarpur", score: 86, trend: "up" as const },
              { name: "AWC Rampur-2", score: 81, trend: "up" as const },
              { name: "AWC Bhagwanpur", score: 72, trend: "stable" as const },
              { name: "AWC Rampur-1", score: 66, trend: "down" as const },
              { name: "AWC Keshavpur", score: 54, trend: "down" as const },
            ].map((center, i) => (
              <motion.div
                key={center.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.05 }}
                onClick={() => navigate("/compare")}
                className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 cursor-pointer hover:bg-secondary transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  center.score >= 80 ? "bg-health-normal-bg text-health-normal" :
                  center.score >= 60 ? "bg-health-risk-bg text-health-risk" :
                  "bg-health-severe-bg text-health-severe"
                }`}>
                  {center.score}
                </div>
                <span className="text-xs font-semibold flex-1">{center.name}</span>
                <StatusBadge status={center.score >= 80 ? "normal" : center.score >= 60 ? "risk" : "severe"}>
                  {center.trend === "up" ? "↑" : center.trend === "down" ? "↓" : "→"}
                </StatusBadge>
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => navigate("/compare")}
            className="w-full mt-3 text-xs text-primary font-semibold flex items-center justify-center gap-1"
          >
            {dl("compareCenters")} <ChevronRight className="w-3 h-3" />
          </button>
        </motion.div>
      )}

      {/* High Risk Children */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0">{t("highRiskChildren")}</h3>
          <button
            onClick={() => navigate("/children")}
            className="text-xs text-primary font-medium flex items-center gap-0.5"
          >
            {t("viewAll")} <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2">
          {mockHighRisk.slice(0, role === "district_officer" ? 2 : 4).map((child, i) => (
            <motion.div
              key={child.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              onClick={() => navigate(`/child/${child.id}`)}
              className="stat-card flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <RiskGauge score={child.score} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{child.name}</p>
                <p className="text-xs text-muted-foreground">{child.age} · {child.village}</p>
                <StatusBadge status={child.score >= 70 ? "severe" : "risk"} className="mt-1">
                  {child.issue}
                </StatusBadge>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reminders — Worker & Supervisor */}
      {(role === "worker" || role === "supervisor") && (
        <div className="mb-6">
          <h3 className="section-title flex items-center gap-2">
            <Bell className="w-3.5 h-3.5" /> {t("reminders")}
          </h3>
          <div className="space-y-2">
            {mockReminders.map((reminder, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 + i * 0.06 }}
                className="stat-card flex items-center gap-3"
              >
                <StatusBadge status={reminder.type}>
                  {reminder.time[lang]}
                </StatusBadge>
                <p className="text-sm flex-1">{reminder.text[lang]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions — Role specific */}
      <div className="mb-6">
        <h3 className="section-title">{t("quickActions")}</h3>
        <div className="grid grid-cols-3 gap-3">
          {actions.map((action, i) => (
            <motion.button
              key={action.labelKey}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.08 }}
              onClick={() => navigate(action.path)}
              className="stat-card flex flex-col items-center gap-2 py-5 active:scale-95 transition-transform"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-center">{getLabel(action.labelKey)}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
