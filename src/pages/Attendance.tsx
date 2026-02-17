import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCheck, Save } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

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

const Attendance = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const session = searchParams.get("session") || "Teaching Session";
  const today = new Date().toISOString().split("T")[0];
  const storageKey = `attendance-${today}-${session}`;
  const { t } = useLanguage();

  const [attendance, setAttendance] = useState<Record<string, "present" | "absent">>(() => {
    const saved = localStorage.getItem(storageKey);
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
    const record = { date: today, session, attendance };
    localStorage.setItem(storageKey, JSON.stringify(attendance));
    const history = JSON.parse(localStorage.getItem("attendance-history") || "[]");
    const existingIdx = history.findIndex((r: any) => r.date === today && r.session === session);
    if (existingIdx >= 0) history[existingIdx] = record;
    else history.push(record);
    localStorage.setItem("attendance-history", JSON.stringify(history));
    toast.success(t("attendanceSaved"), {
      description: `${session}: ${presentCount}/${mockChildren.length} ${t("present")} — ${today}`,
    });
  };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold">{session}</h2>
          <p className="text-xs text-muted-foreground">{today}</p>
        </div>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="stat-card p-4 mb-4"
      >
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">
            {t("present")}: {presentCount}/{mockChildren.length}
          </span>
          <button
            onClick={markAllPresent}
            disabled={allPresent}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-health-normal/10 text-health-normal disabled:opacity-40 active:scale-95 transition-transform"
          >
            <CheckCheck className="w-3.5 h-3.5" /> {t("markAllPresent")}
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
      </motion.div>

      {/* Children list */}
      <div className="space-y-1.5 mb-4">
        {mockChildren.map((child, i) => {
          const isPresent = attendance[child.id] === "present";
          return (
            <motion.button
              key={child.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.03 }}
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
                {isPresent ? t("present") : t("absent")}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Save */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileTap={{ scale: 0.97 }}
        onClick={saveAttendance}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
      >
        <Save className="w-4 h-4" /> {t("saveAttendance")}
      </motion.button>
    </div>
  );
};

export default Attendance;
