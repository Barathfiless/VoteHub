import { Routes, Route, Navigate } from "react-router-dom";
import { useAdminAuth } from "./services/adminAuth";
import AdminAuth from "./pages/AdminAuth";
import AdminDashboard from "./pages/AdminDashboard";
import CreateElection from "./pages/CreateElection";
import AdminAnalytics from "./pages/AdminAnalytics";
import PostResults from "./pages/PostResults";
import ManageElections from "./pages/ManageElections";
import StudentManagement from "./pages/StudentManagement";
import DepartmentManagement from "./pages/DepartmentManagement";
import AdminLayout from "./components/AdminLayout";

const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, loading } = useAdminAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return isAdmin ? <AdminLayout>{children}</AdminLayout> : <Navigate to="/admin/auth" replace />;
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
      path="edit-election/:id"
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
    <Route
      path="students"
      element={
        <ProtectedAdminRoute>
          <StudentManagement />
        </ProtectedAdminRoute>
      }
    />
    <Route
      path="departments"
      element={
        <ProtectedAdminRoute>
          <DepartmentManagement />
        </ProtectedAdminRoute>
      }
    />
  </Routes>
);

export default AdminApp;
