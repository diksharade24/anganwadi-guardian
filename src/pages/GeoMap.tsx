import { motion } from "framer-motion";
import { MapPin, Filter } from "lucide-react";
import { StatusBadge } from "@/components/HealthWidgets";

const clusters = [
  { village: "Rampur", children: 45, severe: 5, risk: 12, lat: "26.84", lng: "80.91" },
  { village: "Sundarpur", children: 38, severe: 3, risk: 8, lat: "26.82", lng: "80.93" },
  { village: "Keshavpur", children: 32, severe: 2, risk: 7, lat: "26.86", lng: "80.89" },
  { village: "Mohanpur", children: 27, severe: 2, risk: 5, lat: "26.85", lng: "80.95" },
];

const GeoMap = () => {
  return (
    <div className="page-container">
      <h2 className="text-xl font-bold mb-4">Risk Heatmap</h2>

      {/* Map Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card mb-6 overflow-hidden"
      >
        <div className="relative h-56 bg-gradient-to-br from-health-ai-bg to-health-normal-bg rounded-xl flex items-center justify-center">
          {/* Simulated map markers */}
          {clusters.map((c, i) => (
            <div
              key={c.village}
              className="absolute"
              style={{
                left: `${20 + i * 20}%`,
                top: `${25 + (i % 2) * 30}%`,
              }}
            >
              <div className={`relative w-10 h-10 rounded-full flex items-center justify-center ${
                c.severe >= 4 ? "bg-health-severe/20" : c.severe >= 2 ? "bg-health-risk/20" : "bg-health-normal/20"
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  c.severe >= 4 ? "bg-health-severe animate-pulse-health" : c.severe >= 2 ? "bg-health-risk" : "bg-health-normal"
                }`}>
                  <MapPin className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
              <p className="text-[9px] font-semibold text-center mt-0.5">{c.village}</p>
            </div>
          ))}
          <p className="text-xs text-muted-foreground absolute bottom-2 right-2">
            Connect Leaflet/Mapbox for live map
          </p>
        </div>
      </motion.div>

      {/* Village Clusters */}
      <h3 className="section-title">Village Risk Summary</h3>
      <div className="space-y-2">
        {clusters.map((cluster, i) => (
          <motion.div
            key={cluster.village}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <p className="text-sm font-semibold">{cluster.village}</p>
              </div>
              <p className="text-xs text-muted-foreground">{cluster.children} children</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge status="severe">{cluster.severe} Severe</StatusBadge>
              <StatusBadge status="risk">{cluster.risk} At Risk</StatusBadge>
              <StatusBadge status="normal">{cluster.children - cluster.severe - cluster.risk} Normal</StatusBadge>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GeoMap;
