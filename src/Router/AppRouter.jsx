import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "../Pages/Auth/AuthPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;