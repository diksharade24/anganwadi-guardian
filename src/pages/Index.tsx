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
} from "lucide-react";
import { StatCard, StatusBadge, RiskGauge } from "@/components/HealthWidgets";

const mockHighRisk = [
  { id: "1", name: "Priya Kumari", age: "2y 4m", score: 78, issue: "Severe underweight", village: "Rampur" },
  { id: "2", name: "Arjun Singh", age: "1y 8m", score: 65, issue: "Anemia detected", village: "Sundarpur" },
  { id: "3", name: "Meera Devi", age: "3y 1m", score: 72, issue: "Growth faltering", village: "Rampur" },
  { id: "4", name: "Rahul Kumar", age: "0y 11m", score: 58, issue: "Low weight gain", village: "Keshavpur" },
];

const mockReminders = [
  { text: "Immunization due: 4 children", type: "risk" as const, time: "Today" },
  { text: "Monthly weighing: 12 pending", type: "normal" as const, time: "This week" },
  { text: "Priya Kumari: Follow-up visit", type: "severe" as const, time: "Overdue" },
  { text: "THR distribution: 28 packets", type: "ai" as const, time: "Tomorrow" },
];

const sessionTypes = [
  { label: "Teaching Session", icon: BookOpen, color: "bg-health-ai/10 text-health-ai" },
  { label: "Nutrition Distribution", icon: Utensils, color: "bg-health-normal/10 text-health-normal" },
  { label: "Health Check Session", icon: HeartPulse, color: "bg-health-severe/10 text-health-severe" },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [showSessionPicker, setShowSessionPicker] = useState(false);

  return (
    <div className="page-container">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold">Good Morning, Sunita 👋</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Anganwadi Center #47, Rampur Block</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={Users} label="Total Children" value={142} trend="+3 this month" color="ai" delay={0} />
        <StatCard icon={TrendingUp} label="Normal" value={98} trend="69%" color="normal" delay={1} />
        <StatCard icon={AlertTriangle} label="At Risk" value={32} trend="22.5%" color="risk" delay={2} />
        <StatCard icon={ShieldAlert} label="Severe" value={12} trend="8.4%" color="severe" delay={3} />
      </div>

      {/* Take Attendance Button */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowSessionPicker(true)}
        className="w-full mb-6 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-primary/20 active:scale-[0.97] transition-transform"
      >
        <ClipboardCheck className="w-5 h-5" />
        Take Attendance
      </motion.button>

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
                <h3 className="text-base font-bold">Select Session Type</h3>
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
                    key={s.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => {
                      setShowSessionPicker(false);
                      navigate(`/attendance?session=${encodeURIComponent(s.label)}`);
                    }}
                    className="stat-card w-full flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold">{s.label}</span>
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
            <p className="text-sm font-semibold text-health-ai-foreground">AI Insight</p>
            <p className="text-xs text-health-ai-foreground/80 mt-0.5">
              3 children in Rampur show early signs of growth faltering. Recommend nutritional intervention this week.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Community Risk Alert */}
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
            <p className="text-sm font-semibold text-health-severe-foreground">Community Alert</p>
            <p className="text-xs text-health-severe-foreground/80 mt-0.5">
              Diarrhea outbreak reported in Sundarpur village. 5 children affected. Immediate ORS distribution needed.
            </p>
          </div>
        </div>
      </motion.div>

      {/* High Risk Children */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0">High-Risk Children</h3>
          <button
            onClick={() => navigate("/children")}
            className="text-xs text-primary font-medium flex items-center gap-0.5"
          >
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-2">
          {mockHighRisk.map((child, i) => (
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

      {/* Reminders */}
      <div className="mb-6">
        <h3 className="section-title flex items-center gap-2">
          <Bell className="w-3.5 h-3.5" /> Reminders & Tasks
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
                {reminder.time}
              </StatusBadge>
              <p className="text-sm flex-1">{reminder.text}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="section-title">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Package, label: "Stock", color: "bg-health-risk-bg text-health-risk", path: "/nutrition" },
            { icon: Syringe, label: "Vaccines", color: "bg-health-normal-bg text-health-normal", path: "/vaccines" },
            { icon: Brain, label: "AI Scan", color: "bg-health-advanced-bg text-health-advanced", path: "/scan" },
            { icon: Baby, label: "Add Child", color: "bg-health-ai-bg text-health-ai", path: "/children" },
            { icon: Activity, label: "Record Visit", color: "bg-health-normal-bg text-health-normal", path: "/" },
            { icon: BookOpen, label: "Learn", color: "bg-health-ai-bg text-health-ai", path: "/learn" },
          ].map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.08 }}
              onClick={() => navigate(action.path)}
              className="stat-card flex flex-col items-center gap-2 py-5 active:scale-95 transition-transform"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
