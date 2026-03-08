import { useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { Ruler, Weight } from "lucide-react";

// WHO Weight-for-Age z-score reference data (boys, 0-60 months, simplified)
const whoWeightForAge = [
  { month: 0, neg3: 2.1, neg2: 2.5, neg1: 2.9, median: 3.3, pos1: 3.9, pos2: 4.4, pos3: 5.0 },
  { month: 3, neg3: 4.4, neg2: 5.0, neg1: 5.7, median: 6.4, pos1: 7.2, pos2: 8.0, pos3: 9.0 },
  { month: 6, neg3: 5.9, neg2: 6.4, neg1: 7.1, median: 7.9, pos1: 8.8, pos2: 9.8, pos3: 10.9 },
  { month: 9, neg3: 6.9, neg2: 7.5, neg1: 8.2, median: 9.0, pos1: 9.9, pos2: 10.9, pos3: 12.0 },
  { month: 12, neg3: 7.5, neg2: 8.1, neg1: 8.9, median: 9.6, pos1: 10.5, pos2: 11.5, pos3: 12.7 },
  { month: 15, neg3: 7.9, neg2: 8.6, neg1: 9.4, median: 10.2, pos1: 11.1, pos2: 12.1, pos3: 13.3 },
  { month: 18, neg3: 8.3, neg2: 9.0, neg1: 9.8, median: 10.7, pos1: 11.7, pos2: 12.7, pos3: 13.9 },
  { month: 21, neg3: 8.6, neg2: 9.4, neg1: 10.2, median: 11.2, pos1: 12.2, pos2: 13.3, pos3: 14.5 },
  { month: 24, neg3: 9.0, neg2: 9.7, neg1: 10.6, median: 11.5, pos1: 12.6, pos2: 13.7, pos3: 15.0 },
  { month: 27, neg3: 9.3, neg2: 10.1, neg1: 11.0, median: 12.0, pos1: 13.1, pos2: 14.2, pos3: 15.5 },
  { month: 30, neg3: 9.6, neg2: 10.4, neg1: 11.4, median: 12.4, pos1: 13.5, pos2: 14.7, pos3: 16.1 },
  { month: 33, neg3: 9.9, neg2: 10.7, neg1: 11.7, median: 12.7, pos1: 13.9, pos2: 15.2, pos3: 16.6 },
  { month: 36, neg3: 10.2, neg2: 11.0, neg1: 12.0, median: 13.1, pos1: 14.3, pos2: 15.6, pos3: 17.1 },
  { month: 42, neg3: 10.7, neg2: 11.6, neg1: 12.7, median: 13.8, pos1: 15.1, pos2: 16.5, pos3: 18.1 },
  { month: 48, neg3: 11.2, neg2: 12.2, neg1: 13.3, median: 14.5, pos1: 15.8, pos2: 17.3, pos3: 19.0 },
  { month: 54, neg3: 11.6, neg2: 12.7, neg1: 13.9, median: 15.2, pos1: 16.6, pos2: 18.2, pos3: 20.0 },
  { month: 60, neg3: 12.1, neg2: 13.2, neg1: 14.4, median: 15.9, pos1: 17.4, pos2: 19.1, pos3: 21.0 },
];

// WHO Height-for-Age z-score reference data (boys, 0-60 months, simplified)
const whoHeightForAge = [
  { month: 0, neg3: 44.2, neg2: 46.1, neg1: 48.0, median: 49.9, pos1: 51.8, pos2: 53.7, pos3: 55.6 },
  { month: 3, neg3: 55.3, neg2: 57.3, neg1: 59.4, median: 61.4, pos1: 63.5, pos2: 65.5, pos3: 67.6 },
  { month: 6, neg3: 61.2, neg2: 63.3, neg1: 65.5, median: 67.6, pos1: 69.8, pos2: 71.9, pos3: 74.0 },
  { month: 9, neg3: 65.2, neg2: 67.5, neg1: 69.7, median: 72.0, pos1: 74.2, pos2: 76.5, pos3: 78.7 },
  { month: 12, neg3: 68.6, neg2: 71.0, neg1: 73.4, median: 75.7, pos1: 78.1, pos2: 80.5, pos3: 82.9 },
  { month: 15, neg3: 71.6, neg2: 74.1, neg1: 76.6, median: 79.1, pos1: 81.7, pos2: 84.2, pos3: 86.7 },
  { month: 18, neg3: 74.1, neg2: 76.9, neg1: 79.6, median: 82.3, pos1: 85.0, pos2: 87.7, pos3: 90.4 },
  { month: 21, neg3: 76.5, neg2: 79.4, neg1: 82.3, median: 85.1, pos1: 88.0, pos2: 90.9, pos3: 93.8 },
  { month: 24, neg3: 78.7, neg2: 81.7, neg1: 84.8, median: 87.8, pos1: 90.9, pos2: 93.9, pos3: 97.0 },
  { month: 27, neg3: 79.9, neg2: 83.1, neg1: 86.4, median: 89.6, pos1: 92.9, pos2: 96.1, pos3: 99.3 },
  { month: 30, neg3: 81.7, neg2: 85.1, neg1: 88.5, median: 91.9, pos1: 95.3, pos2: 98.7, pos3: 102.1 },
  { month: 33, neg3: 83.4, neg2: 86.9, neg1: 90.5, median: 94.0, pos1: 97.5, pos2: 101.0, pos3: 104.5 },
  { month: 36, neg3: 85.0, neg2: 88.7, neg1: 92.4, median: 96.1, pos1: 99.8, pos2: 103.5, pos3: 107.2 },
  { month: 42, neg3: 87.8, neg2: 91.9, neg1: 96.0, median: 100.0, pos1: 104.1, pos2: 108.1, pos3: 112.2 },
  { month: 48, neg3: 90.7, neg2: 94.9, neg1: 99.1, median: 103.3, pos1: 107.5, pos2: 111.7, pos3: 115.9 },
  { month: 54, neg3: 93.4, neg2: 97.8, neg1: 102.1, median: 106.5, pos1: 110.8, pos2: 115.2, pos3: 119.5 },
  { month: 60, neg3: 96.1, neg2: 100.7, neg1: 105.3, median: 109.9, pos1: 114.5, pos2: 119.1, pos3: 123.7 },
];

// Mock child measurement data
const childWeightData = [
  { month: 0, value: 3.2 },
  { month: 3, value: 5.8 },
  { month: 6, value: 7.2 },
  { month: 9, value: 8.0 },
  { month: 12, value: 8.8 },
  { month: 15, value: 9.2 },
  { month: 18, value: 9.5 },
  { month: 21, value: 9.4 },
  { month: 24, value: 9.0 },
  { month: 27, value: 8.5 },
  { month: 28, value: 8.3 },
];

const childHeightData = [
  { month: 0, value: 49.0 },
  { month: 3, value: 59.5 },
  { month: 6, value: 65.0 },
  { month: 9, value: 70.0 },
  { month: 12, value: 73.5 },
  { month: 15, value: 76.8 },
  { month: 18, value: 79.5 },
  { month: 21, value: 82.0 },
  { month: 24, value: 83.5 },
  { month: 27, value: 84.8 },
  { month: 28, value: 85.2 },
];

interface WHOGrowthChartProps {
  childId: string;
  childAgeMonths: number;
}

type ChartType = "weight" | "height";

const chartLabels: Record<string, Record<ChartType, string>> = {
  en: { weight: "Weight-for-Age", height: "Height-for-Age" },
  hi: { weight: "आयु के अनुसार वजन", height: "आयु के अनुसार ऊंचाई" },
  mr: { weight: "वयानुसार वजन", height: "वयानुसार उंची" },
};

const zLabels: Record<string, Record<string, string>> = {
  en: { median: "Median", neg2: "Underweight (-2 SD)", neg3: "Severely Underweight (-3 SD)", pos2: "+2 SD", pos3: "+3 SD" },
  hi: { median: "मध्यमान", neg2: "कम वजन (-2 SD)", neg3: "अत्यंत कम वजन (-3 SD)", pos2: "+2 SD", pos3: "+3 SD" },
  mr: { median: "मध्यमान", neg2: "कमी वजन (-2 SD)", neg3: "अत्यंत कमी वजन (-3 SD)", pos2: "+2 SD", pos3: "+3 SD" },
};

const WHOGrowthChart = ({ childId, childAgeMonths }: WHOGrowthChartProps) => {
  const [chartType, setChartType] = useState<ChartType>("weight");
  const { lang } = useLanguage();

  const whoData = chartType === "weight" ? whoWeightForAge : whoHeightForAge;
  const childData = chartType === "weight" ? childWeightData : childHeightData;
  const labels = chartLabels[lang] || chartLabels.en;
  const zLabel = zLabels[lang] || zLabels.en;
  const unit = chartType === "weight" ? "kg" : "cm";

  // Merge WHO reference with child data
  const mergedData = whoData
    .filter((d) => d.month <= Math.max(childAgeMonths + 6, 36))
    .map((who) => {
      const measurement = childData.find((c) => c.month === who.month);
      return {
        ...who,
        child: measurement?.value ?? null,
      };
    });

  // Find current z-score approximation
  const latestMeasurement = childData[childData.length - 1];
  const closestWho = whoData.reduce((prev, curr) =>
    Math.abs(curr.month - latestMeasurement.month) < Math.abs(prev.month - latestMeasurement.month) ? curr : prev
  );
  
  let zScoreLabel = "";
  let zScoreColor = "text-health-normal";
  if (latestMeasurement.value < closestWho.neg3) {
    zScoreLabel = "< -3 SD";
    zScoreColor = "text-health-severe";
  } else if (latestMeasurement.value < closestWho.neg2) {
    zScoreLabel = "-3 to -2 SD";
    zScoreColor = "text-health-severe";
  } else if (latestMeasurement.value < closestWho.neg1) {
    zScoreLabel = "-2 to -1 SD";
    zScoreColor = "text-health-risk";
  } else if (latestMeasurement.value <= closestWho.pos1) {
    zScoreLabel = "Normal";
    zScoreColor = "text-health-normal";
  } else if (latestMeasurement.value <= closestWho.pos2) {
    zScoreLabel = "+1 to +2 SD";
    zScoreColor = "text-health-risk";
  } else {
    zScoreLabel = "> +2 SD";
    zScoreColor = "text-health-severe";
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-card border border-border rounded-xl p-3 shadow-lg text-xs space-y-1">
        <p className="font-semibold">{label} months</p>
        {payload.map((entry: any) => {
          const nameMap: Record<string, string> = {
            child: `Child (${unit})`,
            median: `Median`,
            neg2: "-2 SD",
            neg3: "-3 SD",
            pos2: "+2 SD",
            pos3: "+3 SD",
          };
          if (entry.value === null) return null;
          return (
            <p key={entry.dataKey} style={{ color: entry.color || entry.stroke }}>
              {nameMap[entry.dataKey] || entry.dataKey}: {entry.value} {unit}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Chart Type Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setChartType("weight")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            chartType === "weight"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          <Weight className="w-3.5 h-3.5" />
          {labels.weight}
        </button>
        <button
          onClick={() => setChartType("height")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
            chartType === "height"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          <Ruler className="w-3.5 h-3.5" />
          {labels.height}
        </button>
      </div>

      {/* Current Z-Score Status */}
      <div className="stat-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">
              {chartType === "weight" ? "Current Weight" : "Current Height"}
            </p>
            <p className="text-2xl font-bold">
              {latestMeasurement.value} <span className="text-sm font-normal text-muted-foreground">{unit}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Z-Score Band</p>
            <p className={`text-sm font-bold ${zScoreColor}`}>{zScoreLabel}</p>
          </div>
        </div>
      </div>

      {/* WHO Chart */}
      <div className="stat-card">
        <h4 className="text-xs font-semibold text-muted-foreground mb-3">
          WHO {labels[chartType]} Standards
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mergedData} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                label={{ value: "Age (months)", position: "insideBottom", offset: -2, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="hsl(var(--muted-foreground))"
                label={{ value: unit, angle: -90, position: "insideLeft", offset: 15, fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Z-score bands */}
              <Area type="monotone" dataKey="pos3" stroke="none" fill="hsl(var(--health-risk) / 0.08)" stackId="band" />
              <Area type="monotone" dataKey="pos2" stroke="hsl(var(--health-risk) / 0.3)" fill="hsl(var(--health-risk) / 0.06)" strokeWidth={1} strokeDasharray="4 4" />
              <Area type="monotone" dataKey="pos1" stroke="none" fill="hsl(var(--health-normal) / 0.06)" />
              <Area type="monotone" dataKey="median" stroke="hsl(var(--health-normal))" fill="none" strokeWidth={2} />
              <Area type="monotone" dataKey="neg1" stroke="none" fill="hsl(var(--health-normal) / 0.06)" />
              <Area type="monotone" dataKey="neg2" stroke="hsl(var(--health-risk) / 0.5)" fill="hsl(var(--health-risk) / 0.08)" strokeWidth={1} strokeDasharray="4 4" />
              <Area type="monotone" dataKey="neg3" stroke="hsl(var(--health-severe) / 0.5)" fill="hsl(var(--health-severe) / 0.08)" strokeWidth={1} strokeDasharray="4 4" />

              {/* Child's actual data */}
              <Line
                type="monotone"
                dataKey="child"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "hsl(var(--primary))", stroke: "hsl(var(--card))", strokeWidth: 2 }}
                connectNulls={false}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="w-4 h-0.5 bg-primary rounded" />
            <span className="text-muted-foreground">Child</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="w-4 h-0.5 bg-health-normal rounded" />
            <span className="text-muted-foreground">{zLabel.median}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="w-4 h-[3px] rounded bg-health-risk/50 border-dashed" />
            <span className="text-muted-foreground">-2 / +2 SD</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="w-4 h-[3px] rounded bg-health-severe/50 border-dashed" />
            <span className="text-muted-foreground">-3 / +3 SD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WHOGrowthChart;
