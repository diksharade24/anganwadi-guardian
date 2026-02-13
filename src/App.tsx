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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
