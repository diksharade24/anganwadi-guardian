import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  CheckCheck,
  Save,
} from "lucide-react";
import { StatCard, StatusBadge, RiskGauge } from "@/components/HealthWidgets";
import { toast } from "sonner";

const mockChildren = [
  { id: "1", name: "Priya Kumari" },
  { id: "2", name: "Arjun Singh" },
  { id: "3", name: "Meera Devi" },
  { id: "4", name: "Rahul Kumar" },
  { id: "5", name: "Sita Yadav" },
  { id: "6", name: "Ravi Prasad" },
  { id: "7", name: "Anita Kumari" },
  { id: "8", name: "Vikram Das" },
  { id: "9", name: "Kavita Devi" },
  { id: "10", name: "Suraj Patel" },
];

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

const Dashboard = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [attendance, setAttendance] = useState<Record<string, "present" | "absent">>(() => {
    const saved = localStorage.getItem(`attendance-${today}`);
    if (saved) return JSON.parse(saved);
    return Object.fromEntries(mockChildren.map((c) => [c.id, "absent" as const]));
  });

  const presentCount = Object.values(attendance).filter((v) => v === "present").length;
  const allPresent = presentCount === mockChildren.length;

  const toggleAttendance = (id: string) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: prev[id] === "present" ? "absent" : "present",
    }));
  };

  const markAllPresent = () => {
    setAttendance(Object.fromEntries(mockChildren.map((c) => [c.id, "present" as const])));
  };

  const saveAttendance = () => {
    const record = { date: today, attendance };
    localStorage.setItem(`attendance-${today}`, JSON.stringify(attendance));
    // Also append to history
    const history = JSON.parse(localStorage.getItem("attendance-history") || "[]");
    const existingIdx = history.findIndex((r: any) => r.date === today);
    if (existingIdx >= 0) history[existingIdx] = record;
    else history.push(record);
    localStorage.setItem("attendance-history", JSON.stringify(history));
    toast.success("Attendance saved successfully!", { description: `${presentCount}/${mockChildren.length} present on ${today}` });
  };

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

      {/* Attendance Marking */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0 flex items-center gap-2">
            <ClipboardCheck className="w-3.5 h-3.5" /> Attendance — Teaching Session
          </h3>
          <span className="text-xs font-medium text-muted-foreground">{today}</span>
        </div>

        <div className="stat-card p-4 mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Present: {presentCount}/{mockChildren.length}</span>
            <button
              onClick={markAllPresent}
              disabled={allPresent}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-health-normal/10 text-health-normal disabled:opacity-40 active:scale-95 transition-transform"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark All Present
            </button>
          </div>
          <div className="w-full h-1.5 rounded-full bg-muted mt-2">
            <motion.div
              className="h-full rounded-full bg-health-normal"
              initial={{ width: 0 }}
              animate={{ width: `${(presentCount / mockChildren.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <div className="space-y-1.5 max-h-[280px] overflow-y-auto">
          {mockChildren.map((child, i) => {
            const isPresent = attendance[child.id] === "present";
            return (
              <motion.button
                key={child.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.95 + i * 0.03 }}
                onClick={() => toggleAttendance(child.id)}
                className="stat-card w-full flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                    isPresent
                      ? "bg-health-normal/15 text-health-normal"
                      : "bg-health-severe/10 text-health-severe"
                  }`}
                >
                  {isPresent ? "P" : "A"}
                </div>
                <span className="text-sm font-medium flex-1">{child.name}</span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isPresent
                      ? "bg-health-normal/10 text-health-normal"
                      : "bg-health-severe/10 text-health-severe"
                  }`}
                >
                  {isPresent ? "Present" : "Absent"}
                </span>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={saveAttendance}
          className="w-full mt-3 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
        >
          <Save className="w-4 h-4" /> Save Attendance
        </motion.button>
      </motion.div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="section-title">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Baby, label: "Add Child", color: "bg-health-ai-bg text-health-ai" },
            { icon: Activity, label: "Record Visit", color: "bg-health-normal-bg text-health-normal" },
            { icon: Brain, label: "AI Scan", color: "bg-health-advanced-bg text-health-advanced" },
          ].map((action, i) => (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.08 }}
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
