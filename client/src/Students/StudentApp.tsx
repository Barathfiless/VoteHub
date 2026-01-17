import { useLocation } from "react-router-dom";
import StudentLayout from "./components/StudentLayout";
import StudentDashboard from "./pages/StudentDashboard";
import VoteElections from "./pages/VoteElections";
import UpcomingElections from "./pages/UpcomingElections";
import ElectionResults from "./pages/ElectionResults";

const StudentApp = () => {
  const location = useLocation();

  return (
    <StudentLayout>
      {location.pathname === '/dashboard' && <StudentDashboard />}
      {location.pathname.includes('/vote-elections') && <VoteElections />}
      {location.pathname.includes('/upcoming-elections') && <UpcomingElections />}
      {location.pathname.includes('/election-results') && <ElectionResults />}
    </StudentLayout>
  );
};

export default StudentApp;
