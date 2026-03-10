import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, Building, Save, Camera, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRole, roleLabels, roleIcons, roleColors } from "@/contexts/RoleContext";

const translations: Record<string, Record<string, string>> = {
  en: {
    profile: "My Profile",
    personalInfo: "Personal Information",
    contactInfo: "Contact Information",
    workInfo: "Work Information",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    address: "Address",
    center: "Anganwadi Center",
    district: "District",
    block: "Block",
    role: "Role",
    employeeId: "Employee ID",
    save: "Save Changes",
    saved: "Profile Updated",
    savedDesc: "Your profile has been updated successfully.",
    changePhoto: "Change Photo",
  },
  hi: {
    profile: "मेरी प्रोफ़ाइल",
    personalInfo: "व्यक्तिगत जानकारी",
    contactInfo: "संपर्क जानकारी",
    workInfo: "कार्य जानकारी",
    fullName: "पूरा नाम",
    email: "ईमेल पता",
    phone: "फ़ोन नंबर",
    address: "पता",
    center: "आंगनवाड़ी केंद्र",
    district: "जिला",
    block: "ब्लॉक",
    role: "भूमिका",
    employeeId: "कर्मचारी आईडी",
    save: "बदलाव सहेजें",
    saved: "प्रोफ़ाइल अपडेट",
    savedDesc: "आपकी प्रोफ़ाइल सफलतापूर्वक अपडेट की गई।",
    changePhoto: "फ़ोटो बदलें",
  },
  mr: {
    profile: "माझी प्रोफाइल",
    personalInfo: "वैयक्तिक माहिती",
    contactInfo: "संपर्क माहिती",
    workInfo: "कामाची माहिती",
    fullName: "पूर्ण नाव",
    email: "ईमेल पत्ता",
    phone: "फोन नंबर",
    address: "पत्ता",
    center: "अंगणवाडी केंद्र",
    district: "जिल्हा",
    block: "ब्लॉक",
    role: "भूमिका",
    employeeId: "कर्मचारी आयडी",
    save: "बदल जतन करा",
    saved: "प्रोफाइल अपडेट",
    savedDesc: "तुमची प्रोफाइल यशस्वीरित्या अपडेट केली गेली.",
    changePhoto: "फोटो बदला",
  },
};

const roleDefaults = {
  worker: { center: "AWC-Rampur-01", district: "Varanasi", block: "Pindra", employeeId: "AWW-2024-1087" },
  supervisor: { center: "Cluster-Sundarpur", district: "Varanasi", block: "Pindra", employeeId: "SUP-2024-0342" },
  district_officer: { center: "District Office", district: "Varanasi", block: "All Blocks", employeeId: "DPO-2024-0018" },
};

const Profile = () => {
  const { lang } = useLanguage();
  const { role } = useRole();
  const { toast } = useToast();
  const t = translations[lang] || translations.en;
  const rl = roleLabels[lang] || roleLabels.en;
  const defaults = roleDefaults[role];

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    center: defaults.center,
    district: defaults.district,
    block: defaults.block,
  });

  useEffect(() => {
    const saved = localStorage.getItem("userProfile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed }));
      } catch {}
    } else {
      setForm((prev) => ({
        ...prev,
        name: localStorage.getItem("userName") || "",
        email: "",
        phone: "",
        address: "",
        center: defaults.center,
        district: defaults.district,
        block: defaults.block,
      }));
    }
  }, [role]);

  const handleSave = () => {
    localStorage.setItem("userProfile", JSON.stringify(form));
    localStorage.setItem("userName", form.name);
    toast({ title: t.saved, description: t.savedDesc });
  };

  const update = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const initials = form.name
    ? form.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-24 space-y-5">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-foreground">{t.profile}</h1>
      </motion.div>

      {/* Avatar & Role Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-primary via-accent to-health-normal" />
          <CardContent className="pt-6 pb-5 flex flex-col items-center gap-3">
            <div className="relative">
              <Avatar className="w-20 h-20 border-4 border-card shadow-lg">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-105 transition-transform">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{form.name || "—"}</p>
              <div className={`inline-flex items-center gap-1.5 mt-1 text-xs font-semibold px-3 py-1 rounded-full ${roleColors[role]}`}>
                <span>{roleIcons[role]}</span>
                <span>{rl[role]}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Shield className="w-3 h-3" />
              {defaults.employeeId}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Personal Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              {t.personalInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t.fullName}</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} className="rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t.email}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={form.email} onChange={(e) => update("email", e.target.value)} className="pl-10 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t.phone}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="pl-10 rounded-xl" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t.address}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={form.address} onChange={(e) => update("address", e.target.value)} className="pl-10 rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Work Info */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building className="w-4 h-4 text-accent" />
              {t.workInfo}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t.role}</Label>
              <Input value={rl[role]} disabled className="rounded-xl bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t.employeeId}</Label>
              <Input value={defaults.employeeId} disabled className="rounded-xl bg-muted" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t.center}</Label>
              <Input value={form.center} onChange={(e) => update("center", e.target.value)} className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t.district}</Label>
                <Input value={form.district} onChange={(e) => update("district", e.target.value)} className="rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">{t.block}</Label>
                <Input value={form.block} onChange={(e) => update("block", e.target.value)} className="rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Button onClick={handleSave} className="w-full gap-2 rounded-xl h-11 font-semibold shadow-md">
          <Save className="w-4 h-4" />
          {t.save}
        </Button>
      </motion.div>
    </div>
  );
};

export default Profile;
