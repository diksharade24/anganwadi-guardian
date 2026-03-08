import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { RoleProvider } from "@/contexts/RoleContext";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import ChildrenList from "./pages/ChildrenList";
import ChildProfile from "./pages/ChildProfile";
import AIScan from "./pages/AIScan";
import GeoMap from "./pages/GeoMap";
import VoiceAssistant from "./pages/VoiceAssistant";
import MicroLearning from "./pages/MicroLearning";
import Attendance from "./pages/Attendance";
import AttendanceHistory from "./pages/AttendanceHistory";
import NutritionStock from "./pages/NutritionStock";
import AddChild from "./pages/AddChild";
import VaccineTracker from "./pages/VaccineTracker";
import SupervisorDashboard from "./pages/SupervisorDashboard";
import CenterComparison from "./pages/CenterComparison";
import VisitTracking from "./pages/VisitTracking";
import SupplyRequests from "./pages/SupplyRequests";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <RoleProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout><></></Layout>}>
            </Route>
            <Route path="/" element={<Layout><Index /></Layout>} />
            <Route path="/children" element={<Layout><ChildrenList /></Layout>} />
            <Route path="/children/add" element={<Layout><AddChild /></Layout>} />
            <Route path="/child/:id" element={<Layout><ChildProfile /></Layout>} />
            <Route path="/scan" element={<Layout><AIScan /></Layout>} />
            <Route path="/map" element={<Layout><GeoMap /></Layout>} />
            <Route path="/voice" element={<Layout><VoiceAssistant /></Layout>} />
            <Route path="/learn" element={<Layout><MicroLearning /></Layout>} />
            <Route path="/attendance" element={<Layout><Attendance /></Layout>} />
            <Route path="/attendance/history" element={<Layout><AttendanceHistory /></Layout>} />
            <Route path="/nutrition" element={<Layout><NutritionStock /></Layout>} />
            <Route path="/vaccines" element={<Layout><VaccineTracker /></Layout>} />
            <Route path="/supervisor" element={<Layout><SupervisorDashboard /></Layout>} />
            <Route path="/compare" element={<Layout><CenterComparison /></Layout>} />
            <Route path="/visits" element={<Layout><VisitTracking /></Layout>} />
            <Route path="/supplies" element={<Layout><SupplyRequests /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </RoleProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
