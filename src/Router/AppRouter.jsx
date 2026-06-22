import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../Components/layout/MainLayout";

// Lazy-loaded page components
const LoginPage = lazy(() => import("../Pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("../Pages/Auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../Pages/Auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("../Pages/Auth/ResetPasswordPage"));
const DashboardPage = lazy(() => import("../Pages/Dashboard/DashboardPage"));
const WarehousePage = lazy(() => import("../Pages/Warehouse/WarehousePage"));
const StockLevelsPage = lazy(() => import("../Pages/Stock-Levels/StockLevelsPage"));
const StockMovementsPage = lazy(() => import("../Pages/Stock-Movement/StockMovementsPage"));
const TransferStockPage = lazy(() => import("../Pages/TransferStock/TransferStockPage"));
const PurchaseOrdersPage = lazy(() => import("../Pages/Purchase-Orders/PurchaseOrdersPage"));
const ReorderDashboardPage = lazy(() => import("../Pages/ReOrder-Engine/ReOrderDashboardPage"));
const UserManagementPage = lazy(() => import("../Pages/Admin/UserManagementPage"));
const ProductsPage = lazy(() => import("../Pages/Products/ProductsPage"));
const SuppliersPage = lazy(() => import("../Pages/Suppliers/SuppliersPage"));
const ReportsPage = lazy(() => import("../Pages/Reports/ReportsPage"));

// Glassmorphic loader for lazy loading transitions
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh] w-full">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading Node...</p>
    </div>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Dashboard shell — Sidebar lives here */}
          <Route path="/dashboard" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="stock-levels" element={<StockLevelsPage />} />
            <Route path="stock-movement" element={<StockMovementsPage />} />
            <Route path="stock-movement/transfer" element={<TransferStockPage />} />
            <Route path="warehouses" element={<WarehousePage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="reorder-suggestions" element={<ReorderDashboardPage />} />
            <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="user-approvals" element={<UserManagementPage />} />
            <Route path="user-management" element={<UserManagementPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;