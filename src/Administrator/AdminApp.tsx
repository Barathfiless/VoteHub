import { Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuth } from "./services/adminAuth";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import CreateElection from "./pages/CreateElection";
import AdminAnalytics from "./pages/AdminAnalytics";
import PostResults from "./pages/PostResults";
import ManageElections from "./pages/ManageElections";

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return isAdmin ? <>{children}</> : <Navigate to="/admin/auth" replace />;
};

const AdminApp = () => (
  <Routes>
    <Route path="auth" element={<AdminAuth />} />
    <Route
      path=""
      element={
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="dashboard"
      element={
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="create-election"
      element={
        <ProtectedAdminRoute>
          <CreateElection />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="analytics"
      element={
        <ProtectedAdminRoute>
          <AdminAnalytics />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="post-results"
      element={
        <ProtectedAdminRoute>
          <PostResults />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="manage"
      element={
        <ProtectedAdminRoute>
          <ManageElections />
        </ProtectedAdminRoute>
      }
    />
  </Routes>
);

export default AdminApp;
