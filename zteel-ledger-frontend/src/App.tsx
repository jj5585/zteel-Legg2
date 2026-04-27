import { Routes, Route, Navigate } from "react-router-dom"
import { getToken } from "@/lib/auth"

import LoginPage from "@/pages/LoginPage"
import ShopsPage from "@/pages/ShopsPage"
import ShopLayout from "@/pages/ShopLayout"
import DashboardPage from "@/pages/DashboardPage"
import TransactionsPage from "@/pages/TransactionsPage"
import MembersPage from "@/pages/MembersPage"
import CategoriesPage from "@/pages/CategoriesPage"
import PnLPage from "@/pages/PnLPage"

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return getToken() ? <>{children}</> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      {/* ✅ ROOT = LOGIN */}
      <Route path="/" element={<LoginPage />} />

      {/* Optional: keep /login working */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path="/shops"
        element={
          <PrivateRoute>
            <ShopsPage />
          </PrivateRoute>
        }
      />

      <Route
        path="/shop/:shopId"
        element={
          <PrivateRoute>
            <ShopLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionsPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="pnl" element={<PnLPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}