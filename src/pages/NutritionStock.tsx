import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Package, AlertTriangle, TrendingUp, Plus, History, X,
  ChevronDown, ChevronUp, Download, Calendar, BarChart3, Brain, Zap,
} from "lucide-react";
import { StatusBadge } from "@/components/HealthWidgets";
import { toast } from "@/components/ui/sonner";
import { exportToPDF } from "@/lib/pdfExport";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";

interface StockItem {
  id: string;
  nameKey: string;
  unit: string;
  current: number;
  minimum: number;
  maximum: number;
  perChildPerDay: number;
}

interface StockLog {
  date: string;
  item: string;
  qty: number;
  type: "added" | "consumed";
}

interface AttendanceRecord {
  date: string;
  session: string;
  attendance: Record<string, "present" | "absent">;
}

const defaultStock: StockItem[] = [
  { id: "rice", nameKey: "rice", unit: "kg", current: 45, minimum: 10, maximum: 100, perChildPerDay: 0.15 },
  { id: "dal", nameKey: "dal", unit: "kg", current: 8, minimum: 5, maximum: 50, perChildPerDay: 0.05 },
  { id: "oil", nameKey: "oil", unit: "liters", current: 3, minimum: 2, maximum: 20, perChildPerDay: 0.01 },
  { id: "eggs", nameKey: "eggs", unit: "count", current: 120, minimum: 50, maximum: 500, perChildPerDay: 0.5 },
  { id: "supplement", nameKey: "supplementPackets", unit: "packets", current: 15, minimum: 20, maximum: 200, perChildPerDay: 0.1 },
];

const getStockStatus = (current: number, minimum: number, maximum: number) => {
  const pct = (current / maximum) * 100;
  if (current <= minimum) return { status: "severe" as const, labelKey: "critical" as const, pct };
  if (current <= minimum * 2) return { status: "risk" as const, labelKey: "lowStock" as const, pct };
  return { status: "normal" as const, labelKey: "sufficient" as const, pct };
};

const stockBarColor = (status: "normal" | "risk" | "severe") => {
  if (status === "severe") return "bg-health-severe";
  if (status === "risk") return "bg-health-risk";
  return "bg-health-normal";
};

const NutritionStock = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [stock, setStock] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem("nutrition-stock");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((s: any, i: number) => ({ ...defaultStock[i], ...s, nameKey: defaultStock.find(d => d.id === s.id)?.nameKey || s.id }));
    }
    return defaultStock;
  });
  const [logs, setLogs] = useState<StockLog[]>(() => {
    const saved = localStorage.getItem("stock-logs");
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [addQty, setAddQty] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showPrediction, setShowPrediction] = useState(true);
  const [forecastDays, setForecastDays] = useState(30);

  const workingDaysPerMonth = 26;

  useEffect(() => {
    localStorage.setItem("nutrition-stock", JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem("stock-logs", JSON.stringify(logs));
  }, [logs]);

  // --- Attendance-based forecasting ---
  const attendanceStats = useMemo(() => {
    const history: AttendanceRecord[] = JSON.parse(localStorage.getItem("attendance-history") || "[]");
    if (history.length === 0) return null;

    // Only nutrition-related sessions
    const nutritionRecords = history.filter(
      (r) => r.session === "Nutrition Distribution" || r.session === "Teaching Session"
    );
    const allRecords = history;

    // Compute daily present counts
    const dailyCounts: Record<string, number[]> = {};
    allRecords.forEach((rec) => {
      const present = Object.values(rec.attendance).filter((v) => v === "present").length;
      if (!dailyCounts[rec.date]) dailyCounts[rec.date] = [];
      dailyCounts[rec.date].push(present);
    });

    const dailyMaxPresent = Object.entries(dailyCounts).map(([date, counts]) => ({
      date,
      count: Math.max(...counts),
    }));

    dailyMaxPresent.sort((a, b) => a.date.localeCompare(b.date));

    const totalDays = dailyMaxPresent.length;
    const totalPresent = dailyMaxPresent.reduce((s, d) => s + d.count, 0);
    const avgDaily = totalDays > 0 ? totalPresent / totalDays : 0;

    // Trend: compare last 7 days vs prior 7 days
    const recent7 = dailyMaxPresent.slice(-7);
    const prior7 = dailyMaxPresent.slice(-14, -7);
    const recentAvg = recent7.length > 0 ? recent7.reduce((s, d) => s + d.count, 0) / recent7.length : avgDaily;
    const priorAvg = prior7.length > 0 ? prior7.reduce((s, d) => s + d.count, 0) / prior7.length : avgDaily;
    const trendPct = priorAvg > 0 ? ((recentAvg - priorAvg) / priorAvg) * 100 : 0;

    // Day-of-week pattern
    const dayOfWeekCounts: Record<number, { total: number; days: number }> = {};
    dailyMaxPresent.forEach((d) => {
      const dow = new Date(d.date).getDay();
      if (!dayOfWeekCounts[dow]) dayOfWeekCounts[dow] = { total: 0, days: 0 };
      dayOfWeekCounts[dow].total += d.count;
      dayOfWeekCounts[dow].days += 1;
    });
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dowPattern = dayNames.map((name, i) => ({
      day: name,
      avg: dayOfWeekCounts[i] ? Math.round(dayOfWeekCounts[i].total / dayOfWeekCounts[i].days) : 0,
    }));

    // Peak and low days
    const peakDay = dowPattern.reduce((a, b) => (b.avg > a.avg ? b : a), dowPattern[0]);
    const lowDay = dowPattern.filter(d => d.avg > 0).reduce((a, b) => (b.avg < a.avg ? b : a), dowPattern.find(d => d.avg > 0) || dowPattern[0]);

    return {
      totalDays,
      avgDaily: Math.round(avgDaily * 10) / 10,
      recentAvg: Math.round(recentAvg * 10) / 10,
      trendPct: Math.round(trendPct),
      dowPattern,
      peakDay,
      lowDay,
      history: dailyMaxPresent.slice(-14),
    };
  }, []);

  const forecastAvg = attendanceStats?.recentAvg || 10; // fallback
  const fallbackAvg = 10;
  const hasAttendanceData = !!attendanceStats && attendanceStats.totalDays > 0;

  const alerts = stock.filter((s) => s.current <= s.minimum);

  const handleAddStock = () => {
    if (!selectedItem || !addQty || Number(addQty) <= 0) {
      toast.error(t("selectItem"));
      return;
    }
    setStock((prev) =>
      prev.map((s) =>
        s.id === selectedItem ? { ...s, current: s.current + Number(addQty) } : s
      )
    );
    setLogs((prev) => [
      { date: new Date().toISOString(), item: selectedItem, qty: Number(addQty), type: "added" },
      ...prev,
    ]);
    toast.success(t("stockUpdated"));
    setShowAddModal(false);
    setSelectedItem("");
    setAddQty("");
  };

  const predictions = stock.map((s) => {
    const avgChildren = hasAttendanceData ? forecastAvg : fallbackAvg;
    const dailyConsumption = s.perChildPerDay * avgChildren;
    const forecastConsumption = Math.ceil(dailyConsumption * forecastDays);
    const daysUntilEmpty = dailyConsumption > 0 ? Math.floor(s.current / dailyConsumption) : 999;
    const shortage = Math.max(0, forecastConsumption - s.current);
    const reorderDate = daysUntilEmpty < 999
      ? new Date(Date.now() + daysUntilEmpty * 86400000).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
      : "—";

    return { ...s, forecastConsumption, shortage, daysUntilEmpty, reorderDate, dailyConsumption: Math.round(dailyConsumption * 100) / 100 };
  });

  const urgentItems = predictions.filter((p) => p.daysUntilEmpty <= 7);
  const warningItems = predictions.filter((p) => p.daysUntilEmpty > 7 && p.daysUntilEmpty <= 14);

  const exportStockPDF = () => {
    const stockRows = stock.map((item) => {
      const { status, labelKey } = getStockStatus(item.current, item.minimum, item.maximum);
      const badgeClass = status === "severe" ? "badge-red" : status === "risk" ? "badge-yellow" : "badge-green";
      return `<tr><td>${t(item.nameKey as any)}</td><td>${item.current} ${item.unit}</td><td>${item.minimum} ${item.unit}</td><td><span class="badge ${badgeClass}">${t(labelKey)}</span></td></tr>`;
    }).join("");

    const predRows = predictions.map((p) => {
      return `<tr><td>${t(p.nameKey as any)}</td><td>${p.forecastConsumption} ${p.unit}</td><td>${p.current} ${p.unit}</td><td>${p.daysUntilEmpty}d</td><td style="color:${p.shortage > 0 ? '#dc2626' : '#16a34a'};font-weight:600">${p.shortage > 0 ? `-${p.shortage} ${p.unit}` : "✓ OK"}</td></tr>`;
    }).join("");

    const alertsHtml = alerts.map((a) => `<div class="alert">⚠ ${t("lowStock")}: ${t(a.nameKey as any)} < ${a.minimum} ${a.unit}</div>`).join("");

    exportToPDF(t("nutritionStock"), `
      <div class="header">
        <h1>📦 ${t("nutritionStock")}</h1>
        <p>${t("rationManagement")} · ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        <p>Forecast based on avg. ${forecastAvg} children/day${hasAttendanceData ? " (from attendance data)" : ""}</p>
      </div>
      ${alertsHtml}
      <p class="section-title">${t("currentStock")}</p>
      <table>
        <thead><tr><th>Item</th><th>${t("available")}</th><th>Min</th><th>Status</th></tr></thead>
        <tbody>${stockRows}</tbody>
      </table>
      <p class="section-title">Forecast (${forecastDays} days, ${forecastAvg} avg. children)</p>
      <table>
        <thead><tr><th>Item</th><th>${t("required")}</th><th>${t("available")}</th><th>Days Left</th><th>${t("shortage")}</th></tr></thead>
        <tbody>${predRows}</tbody>
      </table>
    `);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold">{t("nutritionStock")}</h2>
          <p className="text-xs text-muted-foreground">{t("rationManagement")}</p>
        </div>
      </div>

      {/* Urgent Forecast Alerts */}
      {urgentItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 space-y-2">
          {urgentItems.map((item) => (
            <div key={item.id} className="health-badge-severe p-3 rounded-xl border border-health-severe/20 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-health-severe/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-health-severe" />
              </div>
              <div>
                <p className="text-xs font-bold text-health-severe-foreground">
                  {t(item.nameKey as any)} runs out in {item.daysUntilEmpty} days
                </p>
                <p className="text-[10px] text-health-severe-foreground/70">
                  Order {item.shortage} {item.unit} by {item.reorderDate}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      )}
      {warningItems.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-4 space-y-2">
          {warningItems.map((item) => (
            <div key={item.id} className="health-badge-risk p-3 rounded-xl border border-health-risk/20 flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-health-risk flex-shrink-0" />
              <p className="text-xs font-semibold text-health-risk-foreground">
                {t(item.nameKey as any)}: ~{item.daysUntilEmpty} days left — reorder by {item.reorderDate}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Attendance-Based Intelligence */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="stat-card mb-4 border border-health-ai/20"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-health-ai-bg flex items-center justify-center">
            <Brain className="w-4 h-4 text-health-ai" />
          </div>
          <div>
            <p className="text-sm font-bold">AI Forecast Engine</p>
            <p className="text-[10px] text-muted-foreground">
              {hasAttendanceData
                ? `Based on ${attendanceStats!.totalDays} days of attendance data`
                : "Using default estimates — take attendance to improve accuracy"}
            </p>
          </div>
        </div>

        {hasAttendanceData && (
          <>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-secondary rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-foreground">{attendanceStats!.avgDaily}</p>
                <p className="text-[10px] text-muted-foreground">Avg/day</p>
              </div>
              <div className="bg-secondary rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-foreground">{attendanceStats!.recentAvg}</p>
                <p className="text-[10px] text-muted-foreground">Recent avg</p>
              </div>
              <div className="bg-secondary rounded-lg p-2 text-center">
                <p className={`text-lg font-bold ${attendanceStats!.trendPct > 0 ? "text-health-normal" : attendanceStats!.trendPct < 0 ? "text-health-severe" : "text-muted-foreground"}`}>
                  {attendanceStats!.trendPct > 0 ? "+" : ""}{attendanceStats!.trendPct}%
                </p>
                <p className="text-[10px] text-muted-foreground">Trend</p>
              </div>
            </div>

            {/* Day-of-week mini chart */}
            <div className="mb-2">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">WEEKLY PATTERN</p>
              <div className="flex items-end gap-1 h-12">
                {attendanceStats!.dowPattern.map((d) => {
                  const maxAvg = Math.max(...attendanceStats!.dowPattern.map(x => x.avg), 1);
                  const height = d.avg > 0 ? Math.max((d.avg / maxAvg) * 100, 8) : 4;
                  return (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className={`w-full rounded-t transition-all ${d.avg > 0 ? "bg-health-ai" : "bg-secondary"}`}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[8px] text-muted-foreground">{d.day}</span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-muted-foreground mt-1">
                Peak: {attendanceStats!.peakDay.day} ({attendanceStats!.peakDay.avg}) · Low: {attendanceStats!.lowDay.day} ({attendanceStats!.lowDay.avg})
              </p>
            </div>

            {/* Mini attendance sparkline */}
            {attendanceStats!.history.length > 1 && (
              <div className="mt-2">
                <p className="text-[10px] font-semibold text-muted-foreground mb-1.5">LAST 14 DAYS</p>
                <div className="flex items-end gap-0.5 h-8">
                  {attendanceStats!.history.map((d, i) => {
                    const max = Math.max(...attendanceStats!.history.map(x => x.count), 1);
                    const h = Math.max((d.count / max) * 100, 6);
                    return (
                      <div key={i} className="flex-1 bg-primary/60 rounded-t" style={{ height: `${h}%` }} title={`${d.date}: ${d.count}`} />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {!hasAttendanceData && (
          <div className="bg-secondary/70 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">📊 Take attendance regularly to unlock smart forecasting with trends and patterns</p>
          </div>
        )}
      </motion.div>

      {/* Forecast Period Selector */}
      <div className="flex gap-1.5 mb-4">
        {[7, 14, 30, 60].map((days) => (
          <button
            key={days}
            onClick={() => setForecastDays(days)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
              forecastDays === days
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {days}d
          </button>
        ))}
      </div>

      {/* Low Stock Alerts */}
      {alerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 space-y-2">
          {alerts.map((a) => (
            <div key={a.id} className="health-badge-severe p-3 rounded-xl border border-health-severe/20 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-health-severe flex-shrink-0" />
              <p className="text-xs font-semibold text-health-severe-foreground">
                ⚠ {t("lowStock")}: {t(a.nameKey as any)} &lt; {a.minimum} {a.unit}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Stock Dashboard */}
      <div className="mb-5 space-y-3">
        <h3 className="section-title flex items-center gap-2">
          <Package className="w-3.5 h-3.5" /> {t("currentStock")}
        </h3>
        {stock.map((item, i) => {
          const { status, labelKey, pct } = getStockStatus(item.current, item.minimum, item.maximum);
          const pred = predictions.find((p) => p.id === item.id)!;
          return (
            <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">{t(item.nameKey as any)}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{item.current} {item.unit}</span>
                  <StatusBadge status={status}>{t(labelKey)}</StatusBadge>
                </div>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${stockBarColor(status)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(pct, 100)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <p className="text-[10px] text-muted-foreground">Min: {item.minimum} · Max: {item.maximum} {item.unit}</p>
                <p className={`text-[10px] font-semibold ${pred.daysUntilEmpty <= 7 ? "text-health-severe" : pred.daysUntilEmpty <= 14 ? "text-health-risk" : "text-health-normal"}`}>
                  {pred.daysUntilEmpty < 999 ? `~${pred.daysUntilEmpty}d left` : "✓ Long supply"}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Forecast */}
      <div className="mb-5">
        <button
          onClick={() => setShowPrediction(!showPrediction)}
          className="w-full stat-card flex items-center justify-between active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-health-ai-bg flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-health-ai" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">{forecastDays}-Day Forecast</p>
              <p className="text-[10px] text-muted-foreground">
                {forecastAvg} avg. children · {hasAttendanceData ? "attendance-based" : "estimated"}
              </p>
            </div>
          </div>
          {showPrediction ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {showPrediction && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-2 space-y-2">
                {predictions.map((p) => (
                  <div key={p.id} className="stat-card">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold">{t(p.nameKey as any)}</p>
                      {p.daysUntilEmpty <= 7 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-health-severe-bg text-health-severe-foreground">
                          URGENT
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">{t("required")}</p>
                        <p className="text-sm font-bold text-health-ai">{p.forecastConsumption} {p.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("available")}</p>
                        <p className="text-sm font-bold">{p.current} {p.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Days Left</p>
                        <p className={`text-sm font-bold ${p.daysUntilEmpty <= 7 ? "text-health-severe" : p.daysUntilEmpty <= 14 ? "text-health-risk" : "text-health-normal"}`}>
                          {p.daysUntilEmpty < 999 ? p.daysUntilEmpty : "99+"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t("shortage")}</p>
                        <p className={`text-sm font-bold ${p.shortage > 0 ? "text-health-severe" : "text-health-normal"}`}>
                          {p.shortage > 0 ? `-${p.shortage}` : "✓"} {p.shortage > 0 ? p.unit : ""}
                        </p>
                      </div>
                    </div>
                    {/* Consumption bar */}
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-0.5">
                        <span>{p.dailyConsumption} {p.unit}/day</span>
                        <span>Reorder by: {p.reorderDate}</span>
                      </div>
                      <Progress
                        value={Math.min((p.current / Math.max(p.forecastConsumption, 1)) * 100, 100)}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowAddModal(true)}
          className="py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> {t("addStock")}
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowHistory(!showHistory)}
          className="py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2">
          <History className="w-4 h-4" /> {t("history")}
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} onClick={exportStockPDF}
          className="py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> {t("pdf")}
        </motion.button>
      </div>

      {/* Stock History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
            <h3 className="section-title">{t("stockHistory")}</h3>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">{t("noStockHistory")}</p>
            ) : (
              <div className="space-y-2">
                {logs.slice(0, 20).map((log, i) => (
                  <div key={i} className="stat-card flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold capitalize">{log.item}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(log.date).toLocaleDateString()}</p>
                    </div>
                    <StatusBadge status={log.type === "added" ? "normal" : "risk"}>
                      {log.type === "added" ? "+" : "-"}{log.qty}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Stock Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center p-4"
            onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-background rounded-2xl p-5 pb-8 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold">{t("addStock")}</h3>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("selectItem")}</label>
                  <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">{t("choose")}</option>
                    {stock.map((s) => (
                      <option key={s.id} value={s.id}>{t(s.nameKey as any)} ({s.unit})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">{t("quantity")}</label>
                  <input type="number" value={addQty} onChange={(e) => setAddQty(e.target.value)} placeholder={t("enterQuantity")}
                    className="w-full h-10 px-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddStock}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
                  {t("addStock")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NutritionStock;
