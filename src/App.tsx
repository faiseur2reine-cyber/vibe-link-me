import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import "@/i18n";

// Lazy load all pages — splits the 1.7MB bundle
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/DashboardNew"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const SetUsername = lazy(() => import("./pages/SetUsername"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const SafePage = lazy(() => import("./pages/SafePage"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Legal = lazy(() => import("./pages/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard/*" element={<Dashboard />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/set-username" element={<SetUsername />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/safe/:username" element={<SafePage />} />
                <Route path="/:username" element={<PublicProfile />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
