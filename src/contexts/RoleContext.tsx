import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type UserRole = "worker" | "supervisor" | "district_officer";

export const roleLabels: Record<string, Record<UserRole, string>> = {
  en: { worker: "Worker", supervisor: "Supervisor", district_officer: "District Officer" },
  hi: { worker: "कार्यकर्ता", supervisor: "पर्यवेक्षक", district_officer: "जिला अधिकारी" },
  mr: { worker: "कर्मचारी", supervisor: "पर्यवेक्षक", district_officer: "जिल्हा अधिकारी" },
};

export const roleIcons: Record<UserRole, string> = {
  worker: "👩‍⚕️",
  supervisor: "👨‍💼",
  district_officer: "🏛️",
};

export const roleColors: Record<UserRole, string> = {
  worker: "bg-primary/10 text-primary",
  supervisor: "bg-accent/10 text-accent",
  district_officer: "bg-health-ai-bg text-health-ai",
};

// Define which routes each role can access
export const rolePermissions: Record<UserRole, string[]> = {
  worker: ["/", "/children", "/children/add", "/child", "/scan", "/map", "/voice", "/learn", "/attendance", "/attendance/history", "/nutrition", "/vaccines", "/visits", "/supplies", "/profile"],
  supervisor: ["/", "/children", "/children/add", "/child", "/scan", "/map", "/voice", "/learn", "/attendance", "/attendance/history", "/nutrition", "/vaccines", "/visits", "/supervisor", "/compare", "/supplies", "/profile"],
  district_officer: ["/", "/children", "/child", "/map", "/attendance/history", "/nutrition", "/vaccines", "/supervisor", "/compare", "/supplies", "/profile"],
};

// Define which nav items each role sees
export const roleNavItems: Record<UserRole, string[]> = {
  worker: ["/", "/children", "/scan", "/supplies", "/visits", "/voice"],
  supervisor: ["/", "/children", "/scan", "/supplies", "/visits", "/voice"],
  district_officer: ["/", "/children", "/map", "/supplies", "/supervisor"],
};

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  canAccess: (path: string) => boolean;
  canSeeNav: (path: string) => boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem("userRole");
    return (saved as UserRole) || "worker";
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("userRole", newRole);
  };

  const canAccess = (path: string) => {
    const basePath = path.split("/").slice(0, 2).join("/") || "/";
    return rolePermissions[role].some((p) => basePath.startsWith(p) || p.startsWith(basePath));
  };

  const canSeeNav = (path: string) => {
    return roleNavItems[role].includes(path);
  };

  return (
    <RoleContext.Provider value={{ role, setRole, canAccess, canSeeNav }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within a RoleProvider");
  return context;
};
