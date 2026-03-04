import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Baby, MapPin, Calendar, User, Phone, Weight, Ruler } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";

const villages = ["Rampur", "Sundarpur", "Keshavpur"];
const genders = ["male", "female", "other"] as const;

const childSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  motherName: z.string().trim().min(2, "Mother's name must be at least 2 characters").max(100),
  fatherName: z.string().trim().max(100).optional(),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(genders),
  village: z.string().min(1, "Village is required"),
  phone: z.string().regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  weight: z.string().refine((v) => !v || (parseFloat(v) > 0 && parseFloat(v) < 50), "Enter valid weight in kg"),
  height: z.string().refine((v) => !v || (parseFloat(v) > 0 && parseFloat(v) < 200), "Enter valid height in cm"),
});

type ChildForm = z.infer<typeof childSchema>;

const fieldClass =
  "w-full text-sm rounded-xl border border-border bg-background px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";

const AddChild = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState<ChildForm>({
    name: "",
    motherName: "",
    fatherName: "",
    dob: "",
    gender: "female",
    village: "",
    phone: "",
    weight: "",
    height: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ChildForm, string>>>({});

  const set = (key: keyof ChildForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = () => {
    const result = childSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof ChildForm;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Save to localStorage
    const children = JSON.parse(localStorage.getItem("registered-children") || "[]");
    const newChild = {
      id: `custom-${Date.now()}`,
      ...result.data,
      registeredAt: new Date().toISOString(),
    };
    children.push(newChild);
    localStorage.setItem("registered-children", JSON.stringify(children));

    toast.success(t("childRegistered"), {
      description: result.data.name,
    });
    navigate("/children");
  };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="text-lg font-bold">{t("registerChild")}</h2>
          <p className="text-xs text-muted-foreground">{t("fillChildDetails")}</p>
        </div>
      </motion.div>

      {/* Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center mb-5"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Baby className="w-8 h-8 text-primary" />
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-4"
      >
        {/* Child Name */}
        <Field label={t("childName")} icon={<User className="w-3.5 h-3.5" />} error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder={t("enterChildName")}
            className={fieldClass}
            maxLength={100}
          />
        </Field>

        {/* Mother Name */}
        <Field label={t("motherName")} icon={<User className="w-3.5 h-3.5" />} error={errors.motherName}>
          <input
            type="text"
            value={form.motherName}
            onChange={(e) => set("motherName", e.target.value)}
            placeholder={t("enterMotherName")}
            className={fieldClass}
            maxLength={100}
          />
        </Field>

        {/* Father Name (optional) */}
        <Field label={`${t("fatherName")} (${t("optional")})`} icon={<User className="w-3.5 h-3.5" />} error={errors.fatherName}>
          <input
            type="text"
            value={form.fatherName}
            onChange={(e) => set("fatherName", e.target.value)}
            placeholder={t("enterFatherName")}
            className={fieldClass}
            maxLength={100}
          />
        </Field>

        {/* DOB & Gender row */}
        <div className="grid grid-cols-2 gap-3">
          <Field label={t("dateOfBirth")} icon={<Calendar className="w-3.5 h-3.5" />} error={errors.dob}>
            <input
              type="date"
              value={form.dob}
              onChange={(e) => set("dob", e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className={fieldClass}
            />
          </Field>
          <Field label={t("gender")} icon={<User className="w-3.5 h-3.5" />} error={errors.gender}>
            <select
              value={form.gender}
              onChange={(e) => set("gender", e.target.value)}
              className={fieldClass}
            >
              <option value="female">{t("female")}</option>
              <option value="male">{t("male")}</option>
              <option value="other">{t("other")}</option>
            </select>
          </Field>
        </div>

        {/* Village */}
        <Field label={t("village")} icon={<MapPin className="w-3.5 h-3.5" />} error={errors.village}>
          <select
            value={form.village}
            onChange={(e) => set("village", e.target.value)}
            className={fieldClass}
          >
            <option value="">{t("selectVillage")}</option>
            {villages.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </Field>

        {/* Phone */}
        <Field label={t("phoneNumber")} icon={<Phone className="w-3.5 h-3.5" />} error={errors.phone}>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="9876543210"
            className={fieldClass}
            maxLength={10}
          />
        </Field>

        {/* Weight & Height */}
        <div className="grid grid-cols-2 gap-3">
          <Field label={`${t("weight")} (kg)`} icon={<Weight className="w-3.5 h-3.5" />} error={errors.weight}>
            <input
              type="number"
              step="0.1"
              value={form.weight}
              onChange={(e) => set("weight", e.target.value)}
              placeholder="8.5"
              className={fieldClass}
            />
          </Field>
          <Field label={`${t("height")} (cm)`} icon={<Ruler className="w-3.5 h-3.5" />} error={errors.height}>
            <input
              type="number"
              step="0.1"
              value={form.height}
              onChange={(e) => set("height", e.target.value)}
              placeholder="72"
              className={fieldClass}
            />
          </Field>
        </div>
      </motion.div>

      {/* Submit */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleSubmit}
        className="w-full mt-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
      >
        <UserPlus className="w-4 h-4" /> {t("registerChild")}
      </motion.button>
    </div>
  );
};

const Field = ({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) => (
  <div>
    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1">
      {icon} {label}
    </label>
    {children}
    {error && <p className="text-[10px] text-destructive mt-1 font-medium">{error}</p>}
  </div>
);

export default AddChild;
