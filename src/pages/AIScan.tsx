import { motion } from "framer-motion";
import { Camera, Upload, ShieldCheck, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/HealthWidgets";

const AIScan = () => {
  return (
    <div className="page-container">
      <h2 className="text-xl font-bold mb-4">AI Health Scan</h2>

      {/* Camera Upload */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="stat-card mb-6"
      >
        <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-health-advanced-bg flex items-center justify-center">
            <Camera className="w-8 h-8 text-health-advanced" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Scan Child for Assessment</p>
            <p className="text-xs text-muted-foreground mt-1">Take a photo or upload an image for AI analysis</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium">
              <Camera className="w-4 h-4" /> Take Photo
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium">
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>
        </div>
      </motion.div>

      {/* Sample Detection Result */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="stat-card mb-6"
      >
        <h3 className="section-title">Last Scan Result</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Malnutrition Detection</span>
            <StatusBadge status="risk">Moderate Risk</StatusBadge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Skin Condition</span>
            <StatusBadge status="normal">Normal</StatusBadge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Pallor (Anemia Indicator)</span>
            <StatusBadge status="severe">Detected</StatusBadge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Growth Assessment</span>
            <StatusBadge status="risk">Below Average</StatusBadge>
          </div>
        </div>
      </motion.div>

      {/* Consent Notice */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="health-badge-ai p-4 rounded-xl mb-6 border border-health-ai/20"
      >
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-health-ai flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-health-ai-foreground">Privacy & Consent</p>
            <p className="text-xs text-health-ai-foreground/80 mt-0.5">
              All photos are processed locally. Data is encrypted and shared only with authorized health workers. Parental consent is required before scanning.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AIScan;
