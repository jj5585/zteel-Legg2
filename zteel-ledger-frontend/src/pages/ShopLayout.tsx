import { Outlet, useNavigate, useParams, NavLink } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { logout } from "@/lib/auth"

export default function ShopLayout() {
  const { shopId } = useParams()
  const navigate = useNavigate()
  const [shop, setShop] = useState<any>(null)

  useEffect(() => {
    api.get(`/shops/${shopId}`).then(r => setShop(r.data)).catch(() => navigate("/"))
  }, [shopId])

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-violet-100 text-violet-700" : "text-gray-600 hover:bg-gray-100"}`

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate("/")} className="text-gray-400 hover:text-gray-600 text-sm">← Shops</button>
              <span className="font-semibold text-gray-900">{shop?.name}</span>
            </div>
            <nav className="flex gap-1">
              <NavLink to={`/shop/${shopId}`} end className={navClass}>Dashboard</NavLink>
              <NavLink to={`/shop/${shopId}/transactions`} className={navClass}>Transactions</NavLink>
              {(shop?.role === "owner" || shop?.role === "partner") && (
                <>
                  <NavLink to={`/shop/${shopId}/members`} className={navClass}>Members</NavLink>
                  <NavLink to={`/shop/${shopId}/categories`} className={navClass}>Categories</NavLink>
                </>
              )}
            </nav>
            <button onClick={() => { logout(); navigate("/login") }} className="text-sm text-gray-500 hover:text-gray-700">Logout</button>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  )
}
