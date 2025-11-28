import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { AdminAuthProvider } from "./Administrator/services/adminAuth";
import { ElectionProvider } from "./context/ElectionContext";
import { ThemeProvider } from "./context/ThemeContext";
import AdminApp from "./Administrator/AdminApp";
import StudentApp from "./Students/StudentApp";
import VoteElection from "./Students/pages/VoteElection";
import ViewResults from "./Students/pages/ViewResults";
import Landing from "./Landing";
import Index from "./Index";
import Auth from "./Auth";
import NotFound from "./NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ElectionProvider>
            <AuthProvider>
              <AdminAuthProvider>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/vote/:id" element={<VoteElection />} />
                <Route path="/results/:id" element={<ViewResults />} />
                <Route path="/vote-elections/*" element={<StudentApp />} />
                <Route path="/upcoming-elections/*" element={<StudentApp />} />
                <Route path="/election-results/*" element={<StudentApp />} />
                <Route path="/admin/*" element={<AdminApp />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </AdminAuthProvider>
            </AuthProvider>
          </ElectionProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
