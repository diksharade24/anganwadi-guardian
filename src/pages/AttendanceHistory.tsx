import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Filter, Users, CheckCircle, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AttendanceRecord {
  date: string;
  session: string;
  attendance: Record<string, "present" | "absent">;
}

const mockChildren: Record<string, string> = {
  "1": "Priya Kumari",
  "2": "Arjun Singh",
  "3": "Meera Devi",
  "4": "Rahul Kumar",
  "5": "Sita Yadav",
  "6": "Ravi Prasad",
  "7": "Anita Kumari",
  "8": "Vikram Das",
  "9": "Kavita Devi",
  "10": "Suraj Patel",
};

const AttendanceHistory = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const records: AttendanceRecord[] = useMemo(() => {
    const history = JSON.parse(localStorage.getItem("attendance-history") || "[]");
    return history.sort((a: AttendanceRecord, b: AttendanceRecord) =>
      b.date.localeCompare(a.date)
    );
  }, []);

  const sessions = useMemo(() => {
    const set = new Set(records.map((r) => r.session));
    return Array.from(set);
  }, [records]);

  const [selectedSession, setSelectedSession] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<string>("all");

  const dates = useMemo(() => {
    const set = new Set(records.map((r) => r.date));
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [records]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (selectedSession !== "all" && r.session !== selectedSession) return false;
      if (selectedDate !== "all" && r.date !== selectedDate) return false;
      return true;
    });
  }, [records, selectedSession, selectedDate]);

  const getStats = (record: AttendanceRecord) => {
    const values = Object.values(record.attendance);
    const present = values.filter((v) => v === "present").length;
    return { present, total: values.length };
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
          <h2 className="text-lg font-bold">{t("attendanceHistory")}</h2>
          <p className="text-xs text-muted-foreground">{t("reviewPastRecords")}</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 mb-4"
      >
        <div className="flex-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
            <Filter className="w-3 h-3 inline mr-1" />{t("sessionType")}
          </label>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="all">{t("allSessions")}</option>
            {sessions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">
            <Calendar className="w-3 h-3 inline mr-1" />{t("date")}
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2"
          >
            <option value="all">{t("allDates")}</option>
            {dates.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-2 mb-4"
      >
        <div className="stat-card flex flex-col items-center py-3">
          <Calendar className="w-4 h-4 text-primary mb-1" />
          <span className="text-lg font-bold">{filtered.length}</span>
          <span className="text-[10px] text-muted-foreground">{t("totalRecords")}</span>
        </div>
        <div className="stat-card flex flex-col items-center py-3">
          <CheckCircle className="w-4 h-4 text-health-normal mb-1" />
          <span className="text-lg font-bold">
            {filtered.length > 0
              ? Math.round(
                  (filtered.reduce((sum, r) => sum + getStats(r).present, 0) /
                    filtered.reduce((sum, r) => sum + getStats(r).total, 0)) *
                    100
                )
              : 0}%
          </span>
          <span className="text-[10px] text-muted-foreground">{t("avgAttendance")}</span>
        </div>
        <div className="stat-card flex flex-col items-center py-3">
          <Users className="w-4 h-4 text-health-ai mb-1" />
          <span className="text-lg font-bold">{Object.keys(mockChildren).length}</span>
          <span className="text-[10px] text-muted-foreground">{t("totalChildren")}</span>
        </div>
      </motion.div>

      {/* Records */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="stat-card flex flex-col items-center py-10 text-center"
        >
          <Calendar className="w-8 h-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium text-muted-foreground">{t("noAttendanceRecords")}</p>
        </motion.div>
      ) : (
        filtered.map((record, i) => {
          const { present, total } = getStats(record);
          const pct = Math.round((present / total) * 100);
          return (
            <motion.div
              key={`${record.date}-${record.session}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="stat-card mb-3"
            >
              {/* Record header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-bold">{record.session}</p>
                  <p className="text-xs text-muted-foreground">{record.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    pct >= 80
                      ? "bg-health-normal/10 text-health-normal"
                      : pct >= 50
                      ? "bg-health-risk/10 text-health-risk"
                      : "bg-health-severe/10 text-health-severe"
                  }`}>
                    {present}/{total} ({pct}%)
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-muted mb-3">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 80 ? "bg-health-normal" : pct >= 50 ? "bg-health-risk" : "bg-health-severe"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* Child attendance table */}
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs h-8 px-3">{t("name")}</TableHead>
                      <TableHead className="text-xs h-8 px-3 text-right">{t("status")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(record.attendance).map(([childId, status]) => (
                      <TableRow key={childId}>
                        <TableCell className="text-xs py-1.5 px-3">
                          {mockChildren[childId] || childId}
                        </TableCell>
                        <TableCell className="text-xs py-1.5 px-3 text-right">
                          {status === "present" ? (
                            <span className="inline-flex items-center gap-1 text-health-normal">
                              <CheckCircle className="w-3 h-3" /> {t("present")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-health-severe">
                              <XCircle className="w-3 h-3" /> {t("absent")}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

export default AttendanceHistory;
