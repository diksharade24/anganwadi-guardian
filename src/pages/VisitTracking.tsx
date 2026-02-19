import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Play,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  User,
  Calendar,
} from "lucide-react";
import { StatusBadge } from "@/components/HealthWidgets";
import { useLanguage } from "@/contexts/LanguageContext";

// ─── Types ───────────────────────────────────────────────────
interface Household {
  id: string;
  name: string;
  village: string;
  childName: string;
  childId: string;
  isHighRisk: boolean;
  lat: number;
  lng: number;
}

interface Visit {
  id: string;
  householdId: string;
  date: string;
  time: string;
  lat: number | null;
  lng: number | null;
  workerName: string;
}

// ─── Mock households ─────────────────────────────────────────
const households: Household[] = [
  { id: "h1", name: "Kumari Family", village: "Rampur", childName: "Priya Kumari", childId: "1", isHighRisk: true, lat: 26.84, lng: 80.91 },
  { id: "h2", name: "Singh Family", village: "Sundarpur", childName: "Arjun Singh", childId: "2", isHighRisk: false, lat: 26.82, lng: 80.93 },
  { id: "h3", name: "Devi Family", village: "Rampur", childName: "Meera Devi", childId: "3", isHighRisk: false, lat: 26.845, lng: 80.915 },
  { id: "h4", name: "Kumar Family", village: "Keshavpur", childName: "Rahul Kumar", childId: "4", isHighRisk: true, lat: 26.86, lng: 80.89 },
  { id: "h5", name: "Sharma Family", village: "Rampur", childName: "Anita Sharma", childId: "5", isHighRisk: false, lat: 26.835, lng: 80.905 },
  { id: "h6", name: "Yadav Family", village: "Sundarpur", childName: "Vikram Yadav", childId: "6", isHighRisk: false, lat: 26.825, lng: 80.935 },
  { id: "h7", name: "Kumari-K Family", village: "Keshavpur", childName: "Sita Kumari", childId: "7", isHighRisk: true, lat: 26.855, lng: 80.895 },
  { id: "h8", name: "Prasad Family", village: "Rampur", childName: "Ravi Prasad", childId: "8", isHighRisk: false, lat: 26.842, lng: 80.912 },
];

const STORAGE_KEY = "gps-visits";

const loadVisits = (): Visit[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

const saveVisits = (visits: Visit[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
};

// ─── Component ───────────────────────────────────────────────
const VisitTracking = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [visits, setVisits] = useState<Visit[]>(loadVisits);
  const [activeTab, setActiveTab] = useState<"map" | "start" | "history">("map");
  const [gpsLoading, setGpsLoading] = useState<string | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string>("all");

  const tl = useCallback(
    (key: string) => {
      const labels: Record<string, Record<string, string>> = {
        visitTracking: { en: "Visit Tracking", hi: "विजिट ट्रैकिंग", mr: "भेट ट्रॅकिंग" },
        gpsHomeVisits: { en: "GPS-Based Home Visits", hi: "GPS आधारित गृह भेट", mr: "GPS आधारित गृह भेट" },
        mapView: { en: "Map", hi: "नक्शा", mr: "नकाशा" },
        startVisit: { en: "Start Visit", hi: "विजिट शुरू", mr: "भेट सुरू" },
        visitHistory: { en: "History", hi: "इतिहास", mr: "इतिहास" },
        visited: { en: "Visited", hi: "भेट दी", mr: "भेट दिली" },
        notVisited: { en: "Not Visited", hi: "भेट नहीं", mr: "भेट नाही" },
        highRisk: { en: "High Risk", hi: "उच्च जोखिम", mr: "उच्च धोका" },
        needsFollowUp: { en: "⚠ Needs Follow-up", hi: "⚠ अनुसरण आवश्यक", mr: "⚠ अनुसरण आवश्यक" },
        capturingGPS: { en: "Capturing GPS...", hi: "GPS कैप्चर हो रहा है...", mr: "GPS कॅप्चर होत आहे..." },
        visitRecorded: { en: "Visit recorded!", hi: "विजिट रिकॉर्ड!", mr: "भेट नोंदवली!" },
        noVisitsYet: { en: "No visits recorded yet", hi: "अभी तक कोई विजिट नहीं", mr: "अद्याप भेट नोंदवली नाही" },
        allVillages: { en: "All Villages", hi: "सभी गांव", mr: "सर्व गावे" },
        missedVisits: { en: "missed visits", hi: "छूटी हुई विजिट", mr: "चुकलेल्या भेटी" },
        gpsError: { en: "GPS unavailable, visit recorded without location", hi: "GPS अनुपलब्ध, स्थान के बिना विजिट रिकॉर्ड", mr: "GPS अनुपलब्ध, स्थानाशिवाय भेट नोंद" },
        legend: { en: "Legend", hi: "संकेत", mr: "संकेत" },
      };
      return labels[key]?.[lang] || labels[key]?.en || key;
    },
    [lang]
  );

  const villages = ["all", ...Array.from(new Set(households.map((h) => h.village)))];

  const filteredHouseholds = useMemo(
    () => (selectedVillage === "all" ? households : households.filter((h) => h.village === selectedVillage)),
    [selectedVillage]
  );

  // Count visits per household (last 30 days)
  const visitCounts = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    const counts: Record<string, number> = {};
    households.forEach((h) => (counts[h.id] = 0));
    visits.forEach((v) => {
      if (new Date(v.date).getTime() >= thirtyDaysAgo) {
        counts[v.householdId] = (counts[v.householdId] || 0) + 1;
      }
    });
    return counts;
  }, [visits]);

  const getHouseholdStatus = (h: Household) => {
    const count = visitCounts[h.id] || 0;
    if (count === 0 && h.isHighRisk) return "severe";
    if (count === 0) return "risk";
    return "normal";
  };

  const needsFollowUp = (hId: string) => {
    // 2+ missed months → needs follow-up
    return (visitCounts[hId] || 0) === 0;
  };

  const handleStartVisit = (household: Household) => {
    setGpsLoading(household.id);
    const now = new Date();

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newVisit: Visit = {
            id: `v-${Date.now()}`,
            householdId: household.id,
            date: now.toISOString().split("T")[0],
            time: now.toLocaleTimeString(lang === "hi" ? "hi-IN" : lang === "mr" ? "mr-IN" : "en-IN", { hour: "2-digit", minute: "2-digit" }),
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            workerName: "Sunita",
          };
          const updated = [newVisit, ...visits];
          setVisits(updated);
          saveVisits(updated);
          setGpsLoading(null);
        },
        () => {
          // GPS failed, record without location
          const newVisit: Visit = {
            id: `v-${Date.now()}`,
            householdId: household.id,
            date: now.toISOString().split("T")[0],
            time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
            lat: null,
            lng: null,
            workerName: "Sunita",
          };
          const updated = [newVisit, ...visits];
          setVisits(updated);
          saveVisits(updated);
          setGpsLoading(null);
        },
        { timeout: 5000 }
      );
    } else {
      const newVisit: Visit = {
        id: `v-${Date.now()}`,
        householdId: household.id,
        date: now.toISOString().split("T")[0],
        time: now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        lat: null,
        lng: null,
        workerName: "Sunita",
      };
      const updated = [newVisit, ...visits];
      setVisits(updated);
      saveVisits(updated);
      setGpsLoading(null);
    }
  };

  const tabs = [
    { key: "map" as const, label: tl("mapView") },
    { key: "start" as const, label: tl("startVisit") },
    { key: "history" as const, label: tl("visitHistory") },
  ];

  const followUpCount = filteredHouseholds.filter((h) => needsFollowUp(h.id)).length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{tl("visitTracking")}</h2>
          <p className="text-xs text-muted-foreground">{tl("gpsHomeVisits")}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-primary">GPS</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Village Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {villages.map((v) => (
          <button
            key={v}
            onClick={() => setSelectedVillage(v)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-colors ${
              selectedVillage === v ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {v === "all" ? tl("allVillages") : v}
          </button>
        ))}
      </div>

      {/* ─── MAP VIEW ─────────────────────────────────────── */}
      {activeTab === "map" && (
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stat-card overflow-hidden">
            <div className="relative h-64 bg-gradient-to-br from-health-ai-bg to-health-normal-bg rounded-xl">
              {filteredHouseholds.map((h, i) => {
                const status = getHouseholdStatus(h);
                const xPct = 10 + ((h.lng - 80.885) / 0.06) * 80;
                const yPct = 10 + ((26.865 - h.lat) / 0.05) * 80;
                return (
                  <div
                    key={h.id}
                    className="absolute cursor-pointer group"
                    style={{ left: `${Math.min(Math.max(xPct, 5), 90)}%`, top: `${Math.min(Math.max(yPct, 5), 90)}%` }}
                    onClick={() => navigate(`/child/${h.childId}`)}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center ${
                        status === "severe"
                          ? "bg-health-severe/20"
                          : status === "risk"
                          ? "bg-health-risk/20"
                          : "bg-health-normal/20"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          status === "severe"
                            ? "bg-health-severe animate-pulse"
                            : status === "risk"
                            ? "bg-health-risk"
                            : "bg-health-normal"
                        }`}
                      >
                        <MapPin className="w-2.5 h-2.5 text-primary-foreground" />
                      </div>
                      {h.isHighRisk && (
                        <span className="absolute -top-1 -right-1 text-[8px]">⚠️</span>
                      )}
                    </motion.div>
                    <p className="text-[8px] font-semibold text-center mt-0.5 opacity-70 group-hover:opacity-100">
                      {h.childName.split(" ")[0]}
                    </p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-health-normal" />
              <span className="text-[10px] text-muted-foreground">{tl("visited")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-health-risk" />
              <span className="text-[10px] text-muted-foreground">{tl("notVisited")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-health-severe animate-pulse" />
              <span className="text-[10px] text-muted-foreground">{tl("highRisk")}</span>
            </div>
          </div>

          {/* Unreachable / Follow-up needed */}
          {followUpCount > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <h3 className="section-title flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> {tl("needsFollowUp")}
              </h3>
              {filteredHouseholds
                .filter((h) => needsFollowUp(h.id))
                .map((h, i) => (
                  <motion.div
                    key={h.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="stat-card flex items-center gap-3"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      h.isHighRisk ? "bg-health-severe-bg" : "bg-health-risk-bg"
                    }`}>
                      <AlertTriangle className={`w-4 h-4 ${h.isHighRisk ? "text-health-severe" : "text-health-risk"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{h.name}</p>
                      <p className="text-[10px] text-muted-foreground">{h.village} · {h.childName}</p>
                    </div>
                    <StatusBadge status={h.isHighRisk ? "severe" : "risk"}>
                      0 {tl("missedVisits")}
                    </StatusBadge>
                  </motion.div>
                ))}
            </motion.div>
          )}
        </div>
      )}

      {/* ─── START VISIT ──────────────────────────────────── */}
      {activeTab === "start" && (
        <div className="space-y-2">
          {filteredHouseholds.map((h, i) => {
            const status = getHouseholdStatus(h);
            const isLoading = gpsLoading === h.id;
            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="stat-card"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    status === "severe" ? "bg-health-severe-bg" : status === "risk" ? "bg-health-risk-bg" : "bg-health-normal-bg"
                  }`}>
                    <User className={`w-5 h-5 ${
                      status === "severe" ? "text-health-severe" : status === "risk" ? "text-health-risk" : "text-health-normal"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{h.name}</p>
                    <p className="text-[10px] text-muted-foreground">{h.village} · {h.childName}</p>
                    {needsFollowUp(h.id) && (
                      <p className="text-[10px] font-semibold text-health-severe mt-0.5">{tl("needsFollowUp")}</p>
                    )}
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    disabled={isLoading}
                    onClick={() => handleStartVisit(h)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors ${
                      isLoading
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary text-primary-foreground shadow-primary/20"
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Navigation className="w-3 h-3 animate-spin" />
                        GPS...
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        {tl("startVisit")}
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ─── VISIT HISTORY ────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="space-y-2">
          {visits.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">{tl("noVisitsYet")}</div>
          ) : (
            visits.map((v, i) => {
              const hh = households.find((h) => h.id === v.householdId);
              if (!hh) return null;
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="stat-card flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-health-normal-bg flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-health-normal" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold">{hh.name}</p>
                    <p className="text-[10px] text-muted-foreground">{hh.village} · {hh.childName}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {v.date}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" /> {v.time}
                    </p>
                    {v.lat && (
                      <p className="text-[8px] text-primary flex items-center gap-0.5 justify-end">
                        <MapPin className="w-2.5 h-2.5" /> {v.lat.toFixed(2)}, {v.lng?.toFixed(2)}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default VisitTracking;
