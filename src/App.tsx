import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import ChildrenList from "./pages/ChildrenList";
import ChildProfile from "./pages/ChildProfile";
import AIScan from "./pages/AIScan";
import GeoMap from "./pages/GeoMap";
import VoiceAssistant from "./pages/VoiceAssistant";
import MicroLearning from "./pages/MicroLearning";
import Attendance from "./pages/Attendance";
import NutritionStock from "./pages/NutritionStock";
import VaccineTracker from "./pages/VaccineTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/children" element={<ChildrenList />} />
            <Route path="/child/:id" element={<ChildProfile />} />
            <Route path="/scan" element={<AIScan />} />
            <Route path="/map" element={<GeoMap />} />
            <Route path="/voice" element={<VoiceAssistant />} />
            <Route path="/learn" element={<MicroLearning />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/nutrition" element={<NutritionStock />} />
            <Route path="/vaccines" element={<VaccineTracker />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
