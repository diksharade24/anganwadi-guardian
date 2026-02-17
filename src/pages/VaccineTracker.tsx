import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Syringe,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Users,
  FileText,
} from "lucide-react";
import { StatusBadge } from "@/components/HealthWidgets";
import { exportToPDF } from "@/lib/pdfExport";
import { Download } from "lucide-react";

interface Vaccine {
  id: string;
  name: string;
  ageWeeks: number; // age in weeks when due
  description: string;
}

const immunizationSchedule: Vaccine[] = [
  { id: "bcg", name: "BCG", ageWeeks: 0, description: "At birth" },
  { id: "opv0", name: "OPV-0", ageWeeks: 0, description: "At birth" },
  { id: "hepb0", name: "Hep B - Birth dose", ageWeeks: 0, description: "At birth" },
  { id: "opv1", name: "OPV-1", ageWeeks: 6, description: "6 weeks" },
  { id: "penta1", name: "Pentavalent-1", ageWeeks: 6, description: "6 weeks" },
  { id: "rota1", name: "Rotavirus-1", ageWeeks: 6, description: "6 weeks" },
  { id: "ipv1", name: "IPV-1", ageWeeks: 6, description: "6 weeks" },
  { id: "pcv1", name: "PCV-1", ageWeeks: 6, description: "6 weeks" },
  { id: "opv2", name: "OPV-2", ageWeeks: 10, description: "10 weeks" },
  { id: "penta2", name: "Pentavalent-2", ageWeeks: 10, description: "10 weeks" },
  { id: "rota2", name: "Rotavirus-2", ageWeeks: 10, description: "10 weeks" },
  { id: "opv3", name: "OPV-3", ageWeeks: 14, description: "14 weeks" },
  { id: "penta3", name: "Pentavalent-3", ageWeeks: 14, description: "14 weeks" },
  { id: "rota3", name: "Rotavirus-3", ageWeeks: 14, description: "14 weeks" },
  { id: "ipv2", name: "IPV-2", ageWeeks: 14, description: "14 weeks" },
  { id: "pcv2", name: "PCV-2", ageWeeks: 14, description: "14 weeks" },
  { id: "measles1", name: "Measles/MR-1", ageWeeks: 39, description: "9 months" },
  { id: "jevac1", name: "JE Vaccine-1", ageWeeks: 39, description: "9 months" },
  { id: "pcv_booster", name: "PCV Booster", ageWeeks: 39, description: "9 months" },
  { id: "vitA1", name: "Vitamin A (1st)", ageWeeks: 39, description: "9 months" },
  { id: "dpt_b1", name: "DPT Booster-1", ageWeeks: 72, description: "16-24 months" },
  { id: "measles2", name: "Measles/MR-2", ageWeeks: 72, description: "16-24 months" },
  { id: "opv_booster", name: "OPV Booster", ageWeeks: 72, description: "16-24 months" },
  { id: "jevac2", name: "JE Vaccine-2", ageWeeks: 72, description: "16-24 months" },
  { id: "dpt_b2", name: "DPT Booster-2", ageWeeks: 260, description: "5 years" },
];

interface ChildVaccineData {
  id: string;
  name: string;
  dob: string;
  village: string;
  completedVaccines: string[];
}

const mockChildren: ChildVaccineData[] = [
  { id: "1", name: "Priya Kumari", dob: "2023-08-15", village: "Rampur", completedVaccines: ["bcg", "opv0", "hepb0", "opv1", "penta1", "rota1", "ipv1", "pcv1", "opv2", "penta2", "rota2"] },
  { id: "2", name: "Arjun Singh", dob: "2024-04-10", village: "Sundarpur", completedVaccines: ["bcg", "opv0", "hepb0", "opv1", "penta1", "rota1"] },
  { id: "3", name: "Meera Devi", dob: "2022-11-01", village: "Rampur", completedVaccines: ["bcg", "opv0", "hepb0", "opv1", "penta1", "rota1", "ipv1", "pcv1", "opv2", "penta2", "rota2", "opv3", "penta3", "rota3", "ipv2", "pcv2", "measles1", "jevac1", "pcv_booster", "vitA1"] },
  { id: "4", name: "Rahul Kumar", dob: "2025-01-20", village: "Keshavpur", completedVaccines: ["bcg", "opv0", "hepb0"] },
  { id: "5", name: "Anita Sharma", dob: "2021-10-05", village: "Rampur", completedVaccines: ["bcg", "opv0", "hepb0", "opv1", "penta1", "rota1", "ipv1", "pcv1", "opv2", "penta2", "rota2", "opv3", "penta3", "rota3", "ipv2", "pcv2", "measles1", "jevac1", "pcv_booster", "vitA1", "dpt_b1", "measles2", "opv_booster", "jevac2"] },
  { id: "6", name: "Vikram Yadav", dob: "2023-03-22", village: "Sundarpur", completedVaccines: ["bcg", "opv0", "hepb0", "opv1", "penta1", "rota1", "ipv1", "pcv1", "opv2", "penta2", "rota2", "opv3", "penta3", "rota3", "ipv2", "pcv2"] },
  { id: "7", name: "Sita Kumari", dob: "2024-09-12", village: "Keshavpur", completedVaccines: ["bcg", "opv0", "hepb0"] },
  { id: "8", name: "Ravi Prasad", dob: "2022-05-30", village: "Rampur", completedVaccines: ["bcg", "opv0", "hepb0", "opv1", "penta1", "rota1", "ipv1", "pcv1", "opv2", "penta2", "rota2", "opv3", "penta3", "rota3", "ipv2", "pcv2", "measles1", "jevac1", "pcv_booster", "vitA1", "dpt_b1", "measles2", "opv_booster"] },
];

const getVaccineStatus = (vaccine: Vaccine, dob: string, completed: string[]) => {
  if (completed.includes(vaccine.id)) return "done";
  const dobDate = new Date(dob);
  const dueDate = new Date(dobDate.getTime() + vaccine.ageWeeks * 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffDays = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "overdue";
  if (diffDays <= 30) return "due-soon";
  return "upcoming";
};

const VaccineTracker = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"dashboard" | "children" | "camp">("dashboard");
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [completedState, setCompletedState] = useState<Record<string, string[]>>(() => {
    const saved = localStorage.getItem("vaccine-completed");
    if (saved) return JSON.parse(saved);
    const init: Record<string, string[]> = {};
    mockChildren.forEach((c) => { init[c.id] = [...c.completedVaccines]; });
    return init;
  });

  const toggleVaccine = (childId: string, vaccineId: string) => {
    setCompletedState((prev) => {
      const current = prev[childId] || [];
      const updated = current.includes(vaccineId)
        ? current.filter((v) => v !== vaccineId)
        : [...current, vaccineId];
      const next = { ...prev, [childId]: updated };
      localStorage.setItem("vaccine-completed", JSON.stringify(next));
      return next;
    });
  };

  // Dashboard stats
  const stats = useMemo(() => {
    let totalVaccines = 0;
    let completedCount = 0;
    let overdueCount = 0;
    let dueSoonCount = 0;

    mockChildren.forEach((child) => {
      const completed = completedState[child.id] || [];
      immunizationSchedule.forEach((v) => {
        const status = getVaccineStatus(v, child.dob, completed);
        totalVaccines++;
        if (status === "done") completedCount++;
        if (status === "overdue") overdueCount++;
        if (status === "due-soon") dueSoonCount++;
      });
    });
    return {
      pct: Math.round((completedCount / totalVaccines) * 100),
      overdue: overdueCount,
      dueSoon: dueSoonCount,
    };
  }, [completedState]);

  // Monthly camp: children due this month
  const campList = useMemo(() => {
    const results: { child: ChildVaccineData; vaccines: Vaccine[] }[] = [];
    mockChildren.forEach((child) => {
      const completed = completedState[child.id] || [];
      const dueVaccines = immunizationSchedule.filter((v) => {
        const status = getVaccineStatus(v, child.dob, completed);
        return status === "due-soon" || status === "overdue";
      });
      if (dueVaccines.length > 0) results.push({ child, vaccines: dueVaccines });
    });
    return results;
  }, [completedState]);

  const exportCampPDF = () => {
    const rows = campList.map((entry) => {
      const vaccines = entry.vaccines.map((v) => {
        const status = getVaccineStatus(v, entry.child.dob, completedState[entry.child.id] || []);
        return `<span class="badge ${status === "overdue" ? "badge-red" : "badge-yellow"}">${v.name}</span>`;
      }).join(" ");
      return `<tr><td>${entry.child.name}</td><td>${entry.child.village}</td><td>${entry.child.dob}</td><td>${vaccines}</td></tr>`;
    }).join("");

    exportToPDF("Monthly Vaccination Camp List", `
      <div class="header">
        <h1>📋 Monthly Vaccination Camp List</h1>
        <p>${campList.length} children due for vaccination · ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
      </div>
      <table>
        <thead><tr><th>Child Name</th><th>Village</th><th>DOB</th><th>Due Vaccines</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `);
  };

  const child = selectedChild ? mockChildren.find((c) => c.id === selectedChild) : null;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => (selectedChild ? setSelectedChild(null) : navigate(-1))}
          className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold">{selectedChild && child ? child.name : "Vaccine Tracker"}</h2>
          <p className="text-xs text-muted-foreground">{selectedChild ? "Immunization Record" : "Smart Immunization Calendar"}</p>
        </div>
      </div>

      {/* Child Vaccine Detail */}
      {selectedChild && child ? (
        <div className="space-y-3">
          {immunizationSchedule.map((vaccine, i) => {
            const completed = completedState[child.id] || [];
            const status = getVaccineStatus(vaccine, child.dob, completed);
            const isDone = status === "done";
            const isOverdue = status === "overdue";
            const isDueSoon = status === "due-soon";

            return (
              <motion.div
                key={vaccine.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => toggleVaccine(child.id, vaccine.id)}
                className={`stat-card flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform ${
                  isOverdue ? "border border-health-severe/30" : isDueSoon ? "border border-health-risk/30" : ""
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    isDone
                      ? "bg-health-normal-bg"
                      : isOverdue
                      ? "bg-health-severe-bg"
                      : isDueSoon
                      ? "bg-health-risk-bg"
                      : "bg-secondary"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-health-normal" />
                  ) : isOverdue ? (
                    <AlertTriangle className="w-4 h-4 text-health-severe" />
                  ) : isDueSoon ? (
                    <Clock className="w-4 h-4 text-health-risk" />
                  ) : (
                    <Syringe className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{vaccine.name}</p>
                  <p className="text-[10px] text-muted-foreground">{vaccine.description}</p>
                </div>
                <StatusBadge
                  status={isDone ? "normal" : isOverdue ? "severe" : isDueSoon ? "risk" : "ai"}
                >
                  {isDone ? "Done" : isOverdue ? "Overdue" : isDueSoon ? "Due Soon" : "Upcoming"}
                </StatusBadge>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {([
              { key: "dashboard" as const, label: "Summary" },
              { key: "children" as const, label: "Children" },
              { key: "camp" as const, label: "Camp List" },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "dashboard" && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="stat-card text-center">
                  <div className="w-10 h-10 rounded-xl bg-health-normal-bg flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-5 h-5 text-health-normal" />
                  </div>
                  <p className="text-xl font-bold text-health-normal">{stats.pct}%</p>
                  <p className="text-[10px] text-muted-foreground">Vaccinated</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="stat-card text-center">
                  <div className="w-10 h-10 rounded-xl bg-health-severe-bg flex items-center justify-center mx-auto mb-2">
                    <AlertTriangle className="w-5 h-5 text-health-severe" />
                  </div>
                  <p className="text-xl font-bold text-health-severe">{stats.overdue}</p>
                  <p className="text-[10px] text-muted-foreground">Overdue</p>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card text-center">
                  <div className="w-10 h-10 rounded-xl bg-health-risk-bg flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-5 h-5 text-health-risk" />
                  </div>
                  <p className="text-xl font-bold text-health-risk">{stats.dueSoon}</p>
                  <p className="text-[10px] text-muted-foreground">Due Soon</p>
                </motion.div>
              </div>

              {/* Overdue alerts */}
              {campList.filter((c) => c.vaccines.some((v) => getVaccineStatus(v, c.child.dob, completedState[c.child.id] || []) === "overdue")).slice(0, 5).map((entry, i) => (
                <motion.div
                  key={entry.child.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="health-badge-severe p-3 rounded-xl border border-health-severe/20"
                >
                  <p className="text-xs font-semibold text-health-severe-foreground">
                    ⚠ {entry.child.name}: {entry.vaccines.filter((v) => getVaccineStatus(v, entry.child.dob, completedState[entry.child.id] || []) === "overdue").map((v) => v.name).join(", ")} overdue
                  </p>
                </motion.div>
              ))}
            </div>
          )}

          {tab === "children" && (
            <div className="space-y-2">
              {mockChildren.map((child, i) => {
                const completed = completedState[child.id] || [];
                const total = immunizationSchedule.length;
                const done = completed.length;
                const overdue = immunizationSchedule.filter(
                  (v) => getVaccineStatus(v, child.dob, completed) === "overdue"
                ).length;

                return (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedChild(child.id)}
                    className="stat-card flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className="w-10 h-10 rounded-xl bg-health-ai-bg flex items-center justify-center text-lg">
                      💉
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{child.name}</p>
                      <p className="text-[10px] text-muted-foreground">{child.village} · {done}/{total} doses</p>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-health-normal rounded-full" style={{ width: `${(done / total) * 100}%` }} />
                      </div>
                    </div>
                    {overdue > 0 && (
                      <StatusBadge status="severe">{overdue} overdue</StatusBadge>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </motion.div>
                );
              })}
            </div>
          )}

          {tab === "camp" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="health-badge-ai p-3 rounded-xl border border-health-ai/20 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-health-ai" />
                    <p className="text-xs font-semibold text-health-ai-foreground">Monthly Vaccination Camp List</p>
                  </div>
                  <p className="text-[10px] text-health-ai-foreground/80">{campList.length} children due for vaccination</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={exportCampPDF}
                  className="ml-3 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-primary/20"
                >
                  <Download className="w-3.5 h-3.5" /> PDF
                </motion.button>
              </div>
              {campList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No vaccinations due this month 🎉</p>
              ) : (
                campList.map((entry, i) => (
                  <motion.div
                    key={entry.child.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="stat-card"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold">{entry.child.name}</p>
                      <p className="text-[10px] text-muted-foreground">{entry.child.village}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.vaccines.map((v) => {
                        const status = getVaccineStatus(v, entry.child.dob, completedState[entry.child.id] || []);
                        return (
                          <StatusBadge key={v.id} status={status === "overdue" ? "severe" : "risk"}>
                            {v.name}
                          </StatusBadge>
                        );
                      })}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VaccineTracker;
