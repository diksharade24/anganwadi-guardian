import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatusBadgeProps {
  status: "normal" | "risk" | "severe" | "ai" | "advanced";
  children: React.ReactNode;
  className?: string;
}

export const StatusBadge = ({ status, children, className }: StatusBadgeProps) => {
  const badgeClass = {
    normal: "health-badge-normal",
    risk: "health-badge-risk",
    severe: "health-badge-severe",
    ai: "health-badge-ai",
    advanced: "health-badge-advanced",
  }[status];

  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold", badgeClass, className)}>
      {children}
    </span>
  );
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  color: "normal" | "risk" | "severe" | "ai" | "advanced";
  delay?: number;
}

export const StatCard = ({ icon: Icon, label, value, trend, color, delay = 0 }: StatCardProps) => {
  const colorMap = {
    normal: "bg-health-normal",
    risk: "bg-health-risk",
    severe: "bg-health-severe",
    ai: "bg-health-ai",
    advanced: "bg-health-advanced",
  };

  const iconBgMap = {
    normal: "bg-health-normal-bg",
    risk: "bg-health-risk-bg",
    severe: "bg-health-severe-bg",
    ai: "bg-health-ai-bg",
    advanced: "bg-health-advanced-bg",
  };

  const textMap = {
    normal: "text-health-normal",
    risk: "text-health-risk",
    severe: "text-health-severe",
    ai: "text-health-ai",
    advanced: "text-health-advanced",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.3 }}
      className="stat-card relative overflow-hidden"
    >
      <div className={cn("absolute top-0 left-0 w-1 h-full rounded-l-xl", colorMap[color])} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && <p className={cn("text-xs font-medium mt-1", textMap[color])}>{trend}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", iconBgMap[color])}>
          <Icon className={cn("w-5 h-5", textMap[color])} />
        </div>
      </div>
    </motion.div>
  );
};

interface RiskGaugeProps {
  score: number;
  size?: "sm" | "lg";
}

export const RiskGauge = ({ score, size = "sm" }: RiskGaugeProps) => {
  const getColor = (s: number) => {
    if (s <= 30) return "text-health-normal";
    if (s <= 60) return "text-health-risk";
    return "text-health-severe";
  };

  const getLabel = (s: number) => {
    if (s <= 30) return "Low Risk";
    if (s <= 60) return "Moderate";
    return "High Risk";
  };

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  const getStrokeColor = (s: number) => {
    if (s <= 30) return "hsl(142 70% 42%)";
    if (s <= 60) return "hsl(38 92% 50%)";
    return "hsl(0 84% 55%)";
  };

  const dim = size === "lg" ? "w-32 h-32" : "w-20 h-20";

  return (
    <div className={cn("relative flex items-center justify-center", dim)}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" stroke="hsl(220 14% 96%)" strokeWidth="8" fill="none" />
        <motion.circle
          cx="50" cy="50" r="40"
          stroke={getStrokeColor(score)}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("font-bold", getColor(score), size === "lg" ? "text-2xl" : "text-sm")}>{score}</span>
        {size === "lg" && (
          <span className={cn("text-[10px] font-medium", getColor(score))}>{getLabel(score)}</span>
        )}
      </div>
    </div>
  );
};
