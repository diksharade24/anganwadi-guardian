import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  AlertTriangle,
  TrendingUp,
  Plus,
  History,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { StatusBadge } from "@/components/HealthWidgets";
import { toast } from "@/components/ui/sonner";
import { exportToPDF } from "@/lib/pdfExport";
import { Download } from "lucide-react";

interface StockItem {
  id: string;
  name: string;
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

const defaultStock: StockItem[] = [
  { id: "rice", name: "Rice", unit: "kg", current: 45, minimum: 10, maximum: 100, perChildPerDay: 0.15 },
  { id: "dal", name: "Dal", unit: "kg", current: 8, minimum: 5, maximum: 50, perChildPerDay: 0.05 },
  { id: "oil", name: "Oil", unit: "liters", current: 3, minimum: 2, maximum: 20, perChildPerDay: 0.01 },
  { id: "eggs", name: "Eggs", unit: "count", current: 120, minimum: 50, maximum: 500, perChildPerDay: 0.5 },
  { id: "supplement", name: "Supplement Packets", unit: "packets", current: 15, minimum: 20, maximum: 200, perChildPerDay: 0.1 },
];

const getStockStatus = (current: number, minimum: number, maximum: number) => {
  const pct = (current / maximum) * 100;
  if (current <= minimum) return { status: "severe" as const, label: "Critical", pct };
  if (current <= minimum * 2) return { status: "risk" as const, label: "Low", pct };
  return { status: "normal" as const, label: "Sufficient", pct };
};

const stockBarColor = (status: "normal" | "risk" | "severe") => {
  if (status === "severe") return "bg-health-severe";
  if (status === "risk") return "bg-health-risk";
  return "bg-health-normal";
};

const NutritionStock = () => {
  const navigate = useNavigate();
  const [stock, setStock] = useState<StockItem[]>(() => {
    const saved = localStorage.getItem("nutrition-stock");
    return saved ? JSON.parse(saved) : defaultStock;
  });
  const [logs, setLogs] = useState<StockLog[]>(() => {
    const saved = localStorage.getItem("stock-logs");
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState("");
  const [addQty, setAddQty] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);

  const avgChildrenPresent = 120; // from attendance data mock
  const workingDaysPerMonth = 26;

  useEffect(() => {
    localStorage.setItem("nutrition-stock", JSON.stringify(stock));
  }, [stock]);

  useEffect(() => {
    localStorage.setItem("stock-logs", JSON.stringify(logs));
  }, [logs]);

  const alerts = stock.filter((s) => s.current <= s.minimum);

  const handleAddStock = () => {
    if (!selectedItem || !addQty || Number(addQty) <= 0) {
      toast.error("Please select item and enter valid quantity");
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
    toast.success("Stock updated successfully!");
    setShowAddModal(false);
    setSelectedItem("");
    setAddQty("");
  };

  const predictions = stock.map((s) => {
    const monthlyReq = Math.ceil(s.perChildPerDay * avgChildrenPresent * workingDaysPerMonth);
    const shortage = Math.max(0, monthlyReq - s.current);
    return { ...s, monthlyReq, shortage };
  });

  const exportStockPDF = () => {
    const stockRows = stock.map((item) => {
      const { status, label } = getStockStatus(item.current, item.minimum, item.maximum);
      const badgeClass = status === "severe" ? "badge-red" : status === "risk" ? "badge-yellow" : "badge-green";
      return `<tr><td>${item.name}</td><td>${item.current} ${item.unit}</td><td>${item.minimum} ${item.unit}</td><td><span class="badge ${badgeClass}">${label}</span></td></tr>`;
    }).join("");

    const predRows = predictions.map((p) => {
      return `<tr><td>${p.name}</td><td>${p.monthlyReq} ${p.unit}</td><td>${p.current} ${p.unit}</td><td style="color:${p.shortage > 0 ? '#dc2626' : '#16a34a'};font-weight:600">${p.shortage > 0 ? `-${p.shortage} ${p.unit}` : "✓ OK"}</td></tr>`;
    }).join("");

    const alertsHtml = alerts.map((a) => `<div class="alert">⚠ Low Stock: ${a.name} below ${a.minimum} ${a.unit}</div>`).join("");

    exportToPDF("Nutrition Stock Report", `
      <div class="header">
        <h1>📦 Nutrition Stock Report</h1>
        <p>Anganwadi Ration & Inventory Status · ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
      </div>
      ${alertsHtml}
      <p class="section-title">Current Stock Levels</p>
      <table>
        <thead><tr><th>Item</th><th>Current Stock</th><th>Minimum Required</th><th>Status</th></tr></thead>
        <tbody>${stockRows}</tbody>
      </table>
      <p class="section-title">Monthly Requirement Prediction (${avgChildrenPresent} avg. children)</p>
      <table>
        <thead><tr><th>Item</th><th>Monthly Required</th><th>Available</th><th>Shortage</th></tr></thead>
        <tbody>${predRows}</tbody>
      </table>
    `);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold">Nutrition Stock</h2>
          <p className="text-xs text-muted-foreground">Ration & Inventory Management</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {alerts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 space-y-2">
          {alerts.map((a) => (
            <div key={a.id} className="health-badge-severe p-3 rounded-xl border border-health-severe/20 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-health-severe flex-shrink-0" />
              <p className="text-xs font-semibold text-health-severe-foreground">
                ⚠ Low Stock: {a.name} below {a.minimum}{a.unit}
              </p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Stock Dashboard */}
      <div className="mb-6 space-y-3">
        <h3 className="section-title flex items-center gap-2">
          <Package className="w-3.5 h-3.5" /> Current Stock
        </h3>
        {stock.map((item, i) => {
          const { status, label, pct } = getStockStatus(item.current, item.minimum, item.maximum);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold">{item.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{item.current} {item.unit}</span>
                  <StatusBadge status={status}>{label}</StatusBadge>
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
              <p className="text-[10px] text-muted-foreground mt-1">Min: {item.minimum} {item.unit} · Max: {item.maximum} {item.unit}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Monthly Prediction */}
      <div className="mb-6">
        <button
          onClick={() => setShowPrediction(!showPrediction)}
          className="w-full stat-card flex items-center justify-between active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-health-ai-bg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-health-ai" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">Monthly Requirement Prediction</p>
              <p className="text-[10px] text-muted-foreground">Based on {avgChildrenPresent} avg. children</p>
            </div>
          </div>
          {showPrediction ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </button>
        <AnimatePresence>
          {showPrediction && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 space-y-2">
                {predictions.map((p) => (
                  <div key={p.id} className="stat-card">
                    <p className="text-sm font-semibold mb-2">{p.name}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Required</p>
                        <p className="text-sm font-bold text-health-ai">{p.monthlyReq} {p.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Available</p>
                        <p className="text-sm font-bold">{p.current} {p.unit}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Shortage</p>
                        <p className={`text-sm font-bold ${p.shortage > 0 ? "text-health-severe" : "text-health-normal"}`}>
                          {p.shortage > 0 ? `-${p.shortage}` : "✓"} {p.shortage > 0 ? p.unit : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddModal(true)}
          className="py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Add
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowHistory(!showHistory)}
          className="py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2"
        >
          <History className="w-4 h-4" /> History
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={exportStockPDF}
          className="py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" /> PDF
        </motion.button>
      </div>

      {/* Stock History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <h3 className="section-title">Stock History</h3>
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No stock history yet</p>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center p-4"
            onClick={() => setShowAddModal(false)}
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
                <h3 className="text-base font-bold">Add Stock</h3>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Select Item</label>
                  <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Choose...</option>
                    {stock.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Quantity</label>
                  <input
                    type="number"
                    value={addQty}
                    onChange={(e) => setAddQty(e.target.value)}
                    placeholder="Enter quantity"
                    className="w-full h-10 px-3 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddStock}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
                >
                  Add Stock
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
