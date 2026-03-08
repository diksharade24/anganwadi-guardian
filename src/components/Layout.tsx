import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Camera,
  Map,
  Mic,
  BookOpen,
  Navigation,
  Wifi,
  WifiOff,
  Globe,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { useLanguage, languageLabels, Language } from "@/contexts/LanguageContext";
import { useRole, roleLabels, roleColors, roleIcons } from "@/contexts/RoleContext";

const navKeys = [
  { path: "/", icon: LayoutDashboard, key: "navHome" as const },
  { path: "/children", icon: Users, key: "navChildren" as const },
  { path: "/scan", icon: Camera, key: "navScan" as const },
  { path: "/map", icon: Map, key: "navMap" as const },
  { path: "/visits", icon: Navigation, key: "navVisits" as const },
  { path: "/voice", icon: Mic, key: "navVoice" as const },
  { path: "/supervisor", icon: ClipboardList, key: "navSupervisor" as const },
];

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnline = true;
  const { lang, setLang, t } = useLanguage();
  const { role, canSeeNav } = useRole();

  const visibleNav = navKeys.filter((item) => canSeeNav(item.path));

  return (
    <div className="min-h-screen bg-background">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">A</span>
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none">{t("appName")}</h1>
              <p className="text-[10px] text-muted-foreground">{t("appSubtitle")}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {/* Role Badge */}
            <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${roleColors[role]}`}>
              <span>{roleIcons[role]}</span>
              <span className="hidden sm:inline">{(roleLabels[lang] || roleLabels.en)[role]}</span>
            </div>
            {/* Language Toggle */}
            <div className="flex items-center bg-secondary rounded-lg p-0.5">
              {(Object.keys(languageLabels) as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-[10px] font-semibold px-1.5 py-1 rounded-md transition-all ${
                    lang === l
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {languageLabels[l]}
                </button>
              ))}
            </div>
            <div className={`flex items-center gap-1 text-[10px] px-1.5 py-1 rounded-full ${
              isOnline ? "health-badge-normal" : "health-badge-severe"
            }`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("userRole");
                navigate("/login");
              }}
              className="flex items-center gap-1 text-[10px] px-1.5 py-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            >
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border">
        <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
          {visibleNav.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </div>
                <span className="text-[10px] font-medium">{t(item.key)}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;
