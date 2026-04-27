import { Routes, Route, Navigate, useLocation } from "react-router-dom"
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
  const auth = getToken()
  // Use 'replace' to prevent the user from clicking "back" into a protected route after logout
  return auth ? <>{children}</> : <Navigate to="/login" replace />
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const auth = getToken()
  // If logged in, don't let them see the login page
  return auth ? <Navigate to="/shops" replace /> : <>{children}</>
}

export default function App() {
  const auth = getToken()

  return (
    <Routes>
      {/* Redirect root based on auth status. 
         This prevents the '/' path from being a "blank" state.
      */}
      <Route path="/" element={<Navigate to={auth ? "/shops" : "/login"} replace />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

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

      {/* Fallback Fix: 
         If a user hits a dead link, send them to the most logical place 
         based on whether they are logged in or not.
      */}
      <Route 
        path="*" 
        element={<Navigate to={auth ? "/shops" : "/login"} replace />} 
      />
    </Routes>
  )
}