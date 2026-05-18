import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../Pages/Auth/LoginPage";
import RegisterPage from "../Pages/Auth/RegisterPage";
import DashboardPage from "../Pages/Dashboard/DashboardPage";
import WarehousePage from "../Pages/Warehouse/WarehousePage";
import StockLevelsPage from "../Pages/Stock-Levels/StockLevelsPage";
import StockMovementsPage from "../Pages/Stock-Movement/StockMovementsPage";
import MainLayout from "../Components/layout/MainLayout";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Dashboard shell — Sidebar lives here */}
        <Route path="/dashboard" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="stock-levels" element={<StockLevelsPage />} />
          <Route path="stock-movement" element={<StockMovementsPage />} />
          <Route path="warehouses" element={<WarehousePage />} />
          <Route path="reorder-suggestions" element={<DashboardPage />} />
          <Route path="purchase-orders" element={<DashboardPage />} />
          <Route path="suppliers" element={<DashboardPage />} />
          <Route path="reports" element={<DashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;