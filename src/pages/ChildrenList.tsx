import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, Filter, ChevronRight } from "lucide-react";
import { useState } from "react";
import { StatusBadge, RiskGauge } from "@/components/HealthWidgets";

const allChildren = [
  { id: "1", name: "Priya Kumari", age: "2y 4m", score: 78, status: "severe" as const, village: "Rampur" },
  { id: "2", name: "Arjun Singh", age: "1y 8m", score: 65, status: "risk" as const, village: "Sundarpur" },
  { id: "3", name: "Meera Devi", age: "3y 1m", score: 72, status: "severe" as const, village: "Rampur" },
  { id: "4", name: "Rahul Kumar", age: "0y 11m", score: 58, status: "risk" as const, village: "Keshavpur" },
  { id: "5", name: "Anita Sharma", age: "4y 2m", score: 22, status: "normal" as const, village: "Rampur" },
  { id: "6", name: "Vikram Yadav", age: "2y 9m", score: 15, status: "normal" as const, village: "Sundarpur" },
  { id: "7", name: "Sita Kumari", age: "1y 3m", score: 45, status: "risk" as const, village: "Keshavpur" },
  { id: "8", name: "Ravi Prasad", age: "3y 7m", score: 10, status: "normal" as const, village: "Rampur" },
];

const ChildrenList = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<"all" | "normal" | "risk" | "severe">("all");
  const [search, setSearch] = useState("");

  const filtered = allChildren
    .filter((c) => filter === "all" || c.status === filter)
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      <h2 className="text-xl font-bold mb-4">Children Registry</h2>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {([
          { key: "all", label: "All (142)" },
          { key: "severe", label: "Severe (12)" },
          { key: "risk", label: "At Risk (32)" },
          { key: "normal", label: "Normal (98)" },
        ] as const).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filter === f.key
                ? f.key === "severe"
                  ? "bg-health-severe text-primary-foreground"
                  : f.key === "risk"
                  ? "bg-health-risk text-primary-foreground"
                  : f.key === "normal"
                  ? "bg-health-normal text-primary-foreground"
                  : "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((child, i) => (
          <motion.div
            key={child.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/child/${child.id}`)}
            className="stat-card flex items-center gap-3 cursor-pointer active:scale-[0.98] transition-transform"
          >
            <RiskGauge score={child.score} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{child.name}</p>
              <p className="text-xs text-muted-foreground">{child.age} · {child.village}</p>
            </div>
            <StatusBadge status={child.status}>
              {child.status === "severe" ? "Severe" : child.status === "risk" ? "At Risk" : "Normal"}
            </StatusBadge>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChildrenList;
