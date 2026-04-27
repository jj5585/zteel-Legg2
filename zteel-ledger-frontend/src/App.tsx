import { Routes, Route, Navigate } from "react-router-dom"
import { getToken } from "@/lib/auth"

import LoginPage from "@/pages/LoginPage"
import ShopsPage from "@/pages/ShopsPage"
import ShopLayout from "@/pages/ShopLayout"
import DashboardPage from "@/pages/DashboardPage"
import TransactionsPage from "@/pages/TransactionsPage"
import MembersPage from "@/pages/MembersPage"
import CategoriesPage from "@/pages/CategoriesPage"
import PnLPage from "@/pages/PnLPage"   // ✅ added

function PrivateRoute({ children }: { children: React.ReactNode }) {
  return getToken() ? <>{children}</> : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
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

        {/* ✅ NEW P&L ROUTE */}
        <Route path="pnl" element={<PnLPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}