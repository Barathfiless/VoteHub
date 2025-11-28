import { useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import StudentDashboard from "./pages/StudentDashboard";
import VoteElections from "./pages/VoteElections";
import UpcomingElections from "./pages/UpcomingElections";
import ElectionResults from "./pages/ElectionResults";

const StudentApp = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <header className="w-full border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sticky top-0 z-50 shadow-md">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900 dark:text-white">Student Dashboard</div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1">
        {location.pathname === '/dashboard' && <StudentDashboard />}
        {location.pathname.includes('/vote-elections') && <VoteElections />}
        {location.pathname.includes('/upcoming-elections') && <UpcomingElections />}
        {location.pathname.includes('/election-results') && <ElectionResults />}
      </main>
    </div>
  );
};

export default StudentApp;
