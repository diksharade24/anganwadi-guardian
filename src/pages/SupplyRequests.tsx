import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, Plus, Clock, CheckCircle2, XCircle, ChevronRight,
  Send, AlertTriangle, Truck, Building2, ArrowLeft, Filter,
} from "lucide-react";
import { useRole, UserRole, roleLabels } from "@/contexts/RoleContext";
import { useLanguage } from "@/contexts/LanguageContext";

type RequestStatus = "pending" | "supervisor_approved" | "district_approved" | "rejected";
type Priority = "normal" | "urgent" | "critical";

interface SupplyItem {
  name: string;
  quantity: number;
  unit: string;
}

interface SupplyRequest {
  id: string;
  centerName: string;
  workerName: string;
  items: SupplyItem[];
  priority: Priority;
  status: RequestStatus;
  reason: string;
  createdAt: string;
  supervisorNote?: string;
  districtNote?: string;
}

const statusConfig: Record<RequestStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending Review", color: "bg-health-risk-bg text-health-risk-foreground", icon: <Clock className="w-3.5 h-3.5" /> },
  supervisor_approved: { label: "Supervisor Approved", color: "bg-health-ai-bg text-health-ai-foreground", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  district_approved: { label: "District Approved", color: "bg-health-normal-bg text-health-normal-foreground", icon: <Truck className="w-3.5 h-3.5" /> },
  rejected: { label: "Rejected", color: "bg-health-severe-bg text-health-severe-foreground", icon: <XCircle className="w-3.5 h-3.5" /> },
};

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  normal: { label: "Normal", color: "bg-secondary text-muted-foreground" },
  urgent: { label: "Urgent", color: "bg-health-risk-bg text-health-risk-foreground" },
  critical: { label: "Critical", color: "bg-health-severe-bg text-health-severe-foreground" },
};

const availableItems = [
  { name: "Rice (चावल)", unit: "kg" },
  { name: "Dal (दाल)", unit: "kg" },
  { name: "Oil (तेल)", unit: "liters" },
  { name: "Salt (नमक)", unit: "kg" },
  { name: "Sugar (चीनी)", unit: "kg" },
  { name: "Milk Powder (दूध पाउडर)", unit: "kg" },
  { name: "Eggs (अंडे)", unit: "dozen" },
  { name: "Vegetables (सब्जियां)", unit: "kg" },
  { name: "Take-Home Ration (THR)", unit: "packets" },
  { name: "Iron Tablets", unit: "strips" },
  { name: "ORS Packets", unit: "packets" },
  { name: "Weighing Scale", unit: "pcs" },
  { name: "MUAC Tape", unit: "pcs" },
  { name: "Growth Chart Booklet", unit: "pcs" },
];

const initialRequests: SupplyRequest[] = [
  {
    id: "sr1", centerName: "AWC #47, Rampur", workerName: "Sunita Devi",
    items: [{ name: "Rice (चावल)", quantity: 50, unit: "kg" }, { name: "Dal (दाल)", quantity: 20, unit: "kg" }, { name: "Take-Home Ration (THR)", quantity: 100, unit: "packets" }],
    priority: "urgent", status: "pending", reason: "Monthly stock depleted, 32 children depend on daily meals.",
    createdAt: "2026-03-06",
  },
  {
    id: "sr2", centerName: "AWC #23, Sultanpur", workerName: "Meera Singh",
    items: [{ name: "ORS Packets", quantity: 50, unit: "packets" }, { name: "Iron Tablets", quantity: 30, unit: "strips" }],
    priority: "critical", status: "supervisor_approved", reason: "Diarrhea outbreak in ward — urgent medical supply needed.",
    createdAt: "2026-03-05", supervisorNote: "Verified. 8 children affected. Escalating immediately.",
  },
  {
    id: "sr3", centerName: "AWC #12, Govindpur", workerName: "Kavita Yadav",
    items: [{ name: "Weighing Scale", quantity: 1, unit: "pcs" }, { name: "MUAC Tape", quantity: 5, unit: "pcs" }],
    priority: "normal", status: "district_approved", reason: "Equipment damaged during monsoon season.",
    createdAt: "2026-03-02", supervisorNote: "Confirmed damage. Recommend replacement.", districtNote: "Approved. Dispatch scheduled for March 10.",
  },
];

const SupplyRequests = () => {
  const { role } = useRole();
  const { lang } = useLanguage();
  const [requests, setRequests] = useState<SupplyRequest[]>(() => {
    const saved = localStorage.getItem("supplyRequests");
    return saved ? JSON.parse(saved) : initialRequests;
  });
  const [showForm, setShowForm] = useState(false);
  const [activeRequest, setActiveRequest] = useState<SupplyRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | RequestStatus>("all");
  const [reviewNote, setReviewNote] = useState("");

  // New request form state
  const [newItems, setNewItems] = useState<SupplyItem[]>([{ name: availableItems[0].name, quantity: 10, unit: availableItems[0].unit }]);
  const [newPriority, setNewPriority] = useState<Priority>("normal");
  const [newReason, setNewReason] = useState("");

  useEffect(() => {
    localStorage.setItem("supplyRequests", JSON.stringify(requests));
  }, [requests]);

  const filteredRequests = requests.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (role === "worker") return r.workerName === "Sunita Devi";
    return true;
  });

  const pendingCount = requests.filter((r) => {
    if (role === "supervisor") return r.status === "pending";
    if (role === "district_officer") return r.status === "supervisor_approved";
    return r.status === "pending" && r.workerName === "Sunita Devi";
  }).length;

  const addItem = () => {
    setNewItems([...newItems, { name: availableItems[0].name, quantity: 10, unit: availableItems[0].unit }]);
  };

  const removeItem = (idx: number) => {
    setNewItems(newItems.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof SupplyItem, value: string | number) => {
    setNewItems(newItems.map((item, i) => {
      if (i !== idx) return item;
      if (field === "name") {
        const found = availableItems.find((a) => a.name === value);
        return { ...item, name: value as string, unit: found?.unit || item.unit };
      }
      return { ...item, [field]: value };
    }));
  };

  const submitRequest = () => {
    if (!newReason.trim() || newItems.length === 0) return;
    const req: SupplyRequest = {
      id: `sr${Date.now()}`,
      centerName: "AWC #47, Rampur",
      workerName: "Sunita Devi",
      items: newItems,
      priority: newPriority,
      status: "pending",
      reason: newReason.trim(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setRequests([req, ...requests]);
    setShowForm(false);
    setNewItems([{ name: availableItems[0].name, quantity: 10, unit: availableItems[0].unit }]);
    setNewPriority("normal");
    setNewReason("");
  };

  const approveRequest = (req: SupplyRequest) => {
    setRequests(requests.map((r) => {
      if (r.id !== req.id) return r;
      if (role === "supervisor") return { ...r, status: "supervisor_approved" as RequestStatus, supervisorNote: reviewNote || "Approved by supervisor." };
      if (role === "district_officer") return { ...r, status: "district_approved" as RequestStatus, districtNote: reviewNote || "Approved. Dispatch scheduled." };
      return r;
    }));
    setActiveRequest(null);
    setReviewNote("");
  };

  const rejectRequest = (req: SupplyRequest) => {
    setRequests(requests.map((r) => {
      if (r.id !== req.id) return r;
      const note = reviewNote || "Request rejected.";
      if (role === "supervisor") return { ...r, status: "rejected" as RequestStatus, supervisorNote: note };
      return { ...r, status: "rejected" as RequestStatus, districtNote: note };
    }));
    setActiveRequest(null);
    setReviewNote("");
  };

  const canReview = (req: SupplyRequest) => {
    if (role === "supervisor" && req.status === "pending") return true;
    if (role === "district_officer" && req.status === "supervisor_approved") return true;
    return false;
  };

  // Detail view
  if (activeRequest) {
    const req = activeRequest;
    const sc = statusConfig[req.status];
    const pc = priorityConfig[req.priority];
    const showReview = canReview(req);

    return (
      <div className="page-container">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button onClick={() => { setActiveRequest(null); setReviewNote(""); }} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="stat-card mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold">{req.centerName}</h3>
              <span className={`text-[11px] font-medium px-2 py-1 rounded-full flex items-center gap-1 ${sc.color}`}>
                {sc.icon} {sc.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">By {req.workerName} • {req.createdAt}</p>
            <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-full mt-2 ${pc.color}`}>
              {pc.label} Priority
            </span>
          </div>

          {/* Items */}
          <div className="stat-card mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">REQUESTED ITEMS</p>
            <div className="space-y-2">
              {req.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">{item.quantity} {item.unit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div className="stat-card mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-1">REASON</p>
            <p className="text-sm">{req.reason}</p>
          </div>

          {/* Workflow trail */}
          <div className="stat-card mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3">APPROVAL TRAIL</p>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Send className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Request Created</p>
                  <p className="text-[11px] text-muted-foreground">{req.workerName} • {req.createdAt}</p>
                </div>
              </div>
              {req.supervisorNote && (
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${req.status === "rejected" && !req.districtNote ? "bg-health-severe-bg" : "bg-health-ai-bg"}`}>
                    {req.status === "rejected" && !req.districtNote ? <XCircle className="w-4 h-4 text-health-severe" /> : <CheckCircle2 className="w-4 h-4 text-health-ai" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Supervisor {req.status === "rejected" && !req.districtNote ? "Rejected" : "Approved"}</p>
                    <p className="text-[11px] text-muted-foreground">{req.supervisorNote}</p>
                  </div>
                </div>
              )}
              {req.districtNote && (
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${req.status === "rejected" ? "bg-health-severe-bg" : "bg-health-normal-bg"}`}>
                    {req.status === "rejected" ? <XCircle className="w-4 h-4 text-health-severe" /> : <Truck className="w-4 h-4 text-health-normal" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">District {req.status === "rejected" ? "Rejected" : "Approved & Dispatched"}</p>
                    <p className="text-[11px] text-muted-foreground">{req.districtNote}</p>
                  </div>
                </div>
              )}
              {req.status === "pending" && (
                <div className="flex gap-3 opacity-40">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Awaiting Supervisor Review</p>
                  </div>
                </div>
              )}
              {req.status === "supervisor_approved" && (
                <div className="flex gap-3 opacity-40">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Awaiting District Approval</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Review actions */}
          {showReview && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stat-card border-2 border-primary/20">
              <p className="text-xs font-semibold text-muted-foreground mb-2">YOUR REVIEW</p>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Add a note (optional)..."
                className="w-full text-sm p-3 rounded-lg bg-secondary border-none resize-none h-20 focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3"
              />
              <div className="flex gap-3">
                <button onClick={() => rejectRequest(req)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-health-severe-bg text-health-severe-foreground">
                  Reject
                </button>
                <button onClick={() => approveRequest(req)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground">
                  Approve →
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // New request form
  if (showForm) {
    return (
      <div className="page-container">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button onClick={() => setShowForm(false)} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-lg font-bold mb-4">New Supply Request</h2>

          {/* Items */}
          <div className="stat-card mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-3">ITEMS NEEDED</p>
            <div className="space-y-3">
              {newItems.map((item, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1">
                    <select
                      value={item.name}
                      onChange={(e) => updateItem(i, "name", e.target.value)}
                      className="w-full text-sm p-2.5 rounded-lg bg-secondary border-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {availableItems.map((ai) => (
                        <option key={ai.name} value={ai.name}>{ai.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                      className="w-full text-sm p-2.5 rounded-lg bg-secondary border-none focus:outline-none focus:ring-2 focus:ring-primary/30 text-center"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground pb-2.5 w-12">{item.unit}</span>
                  {newItems.length > 1 && (
                    <button onClick={() => removeItem(i)} className="pb-2.5 text-health-severe">
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addItem} className="mt-3 text-xs font-medium text-primary flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          {/* Priority */}
          <div className="stat-card mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">PRIORITY</p>
            <div className="flex gap-2">
              {(["normal", "urgent", "critical"] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setNewPriority(p)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all border-2 ${
                    newPriority === p ? "border-primary " + priorityConfig[p].color : "border-transparent bg-secondary text-muted-foreground"
                  }`}
                >
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div className="stat-card mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">REASON</p>
            <textarea
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              placeholder="Why are these supplies needed?..."
              className="w-full text-sm p-3 rounded-lg bg-secondary border-none resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <button
            onClick={submitRequest}
            disabled={!newReason.trim() || newItems.length === 0}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-primary text-primary-foreground disabled:opacity-40 transition-all flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Submit Request
          </button>
        </motion.div>
      </div>
    );
  }

  // List view
  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" /> Supply Requests
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {role === "worker" ? "Request supplies for your center" :
               role === "supervisor" ? "Review and forward requests" :
               "Approve supply dispatch"}
            </p>
          </div>
          {pendingCount > 0 && (
            <div className="w-8 h-8 rounded-full bg-health-risk flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">{pendingCount}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: "Pending", value: requests.filter((r) => r.status === "pending").length, color: "text-health-risk" },
          { label: "In Progress", value: requests.filter((r) => r.status === "supervisor_approved").length, color: "text-health-ai" },
          { label: "Fulfilled", value: requests.filter((r) => r.status === "district_approved").length, color: "text-health-normal" },
        ].map((s) => (
          <div key={s.label} className="stat-card text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* New request button (worker only) */}
      {role === "worker" && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setShowForm(true)}
          className="w-full stat-card border-2 border-dashed border-primary/30 mb-4 flex items-center justify-center gap-2 py-4 text-primary font-semibold text-sm active:scale-[0.98] transition-transform"
        >
          <Plus className="w-5 h-5" /> Create Supply Request
        </motion.button>
      )}

      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-3 scrollbar-hide">
        {(["all", "pending", "supervisor_approved", "district_approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-all ${
              filterStatus === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {s === "all" ? "All" : statusConfig[s].label}
          </button>
        ))}
      </div>

      {/* Request list */}
      <AnimatePresence mode="wait">
        <motion.div key={filterStatus} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {filteredRequests.map((req, i) => {
            const sc = statusConfig[req.status];
            const pc = priorityConfig[req.priority];
            const needsAction = canReview(req);
            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <button
                  onClick={() => setActiveRequest(req)}
                  className={`w-full stat-card text-left active:scale-[0.98] transition-transform ${needsAction ? "border-2 border-health-risk/30" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      needsAction ? "bg-health-risk-bg" : req.status === "district_approved" ? "bg-health-normal-bg" : "bg-secondary"
                    }`}>
                      {needsAction ? <AlertTriangle className="w-5 h-5 text-health-risk" /> :
                       req.status === "district_approved" ? <Truck className="w-5 h-5 text-health-normal" /> :
                       <Package className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold truncate">{req.centerName}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 ${sc.color}`}>
                          {sc.icon} {sc.label.split(" ")[0]}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {req.items.length} item{req.items.length > 1 ? "s" : ""} • {req.workerName}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${pc.color}`}>{pc.label}</span>
                        <span className="text-[11px] text-muted-foreground">{req.createdAt}</span>
                        {needsAction && <span className="text-[10px] font-bold text-health-risk ml-auto">Action Required</span>}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </button>
              </motion.div>
            );
          })}
          {filteredRequests.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-sm">No requests found.</div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SupplyRequests;
