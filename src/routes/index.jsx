import { BrowserRouter, Navigate, Outlet, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/api";
import LoginPage from "../pages/authentication/login";
import SignupPage from "../pages/authentication/signup";
import DashboardPage from "../pages/dashboard/dashboard";
import Sidebar from "../components/sidebar/sidebar";
import Topbar from "../components/topbar/topbar";
import AddDomain from "../pages/domain/addDomain";
import AddEmail from "../pages/email/addEmail";
import Billing from "../components/billing/billing";
import AdminLoginPage from "../pages/authentication/adminLogin";
import AdminDashboardPage from "../pages/dashboard/adminDashboard";
import NotFound from "../pages/not-found/notFound";

// ProtectedRoute component to check authentication
const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetchWithAuth(`${apiUrl}/api/status`);
        setIsAuthenticated(response.ok);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return 
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

// Routes Configuration
const AppRoutes = () => {
  const is_admin = localStorage.getItem("is_admin");
  return (
    <BrowserRouter>
      <Routes>
        /* Public routes */
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected routes */}
        <Route >
          <Route path="/" element={is_admin == true ? <AdminDashboardPage/> : <DashboardPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/topbar" element={<Topbar />} />
          <Route path="/add-domains" element={<AddDomain />} />
          <Route path="/add-emails" element={<AddEmail />} />
          <Route path="/billing" element={<Billing/>}/>
          <Route path="/admin-dashboard" element={<AdminDashboardPage/>}/>
        </Route>

        {/* Fallback route - redirects to login if not found */}
        <Route path="*" element={<NotFound/>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
