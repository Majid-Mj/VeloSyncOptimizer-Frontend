import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "../Pages/Auth/AuthPage";
import DashboardPage from "../Pages/Dashboard/DashboardPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;