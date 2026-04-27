import { Outlet, useNavigate, useParams, NavLink } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "@/lib/api"
import { logout } from "@/lib/auth"
import { ChevronLeft, LogOut, LayoutDashboard, Receipt, PieChart, Users, Settings2, Hash } from "lucide-react"

export default function ShopLayout() {
  const { shopId } = useParams()
  const navigate = useNavigate()
  const [shop, setShop] = useState<any>(null)

  useEffect(() => {
    api.get(`/shops/${shopId}`)
      .then(r => setShop(r.data))
      .catch(() => navigate("/"))
  }, [shopId, navigate])

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 group ${
      isActive
        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
        : "text-[#6b6b6b] hover:bg-white/5 hover:text-[#f5f5f5]"
    }`

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      {/* Topbar / Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            
            {/* Left: Brand & Breadcrumbs */}
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate("/")}
                className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/5 hover:border-orange-500/50 transition-all"
                title="Back to all shops"
              >
                <ChevronLeft className="w-5 h-5 text-[#6b6b6b] group-hover:text-orange-500 transition-colors" />
              </button>
              
              <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/10">
                  <span className="text-white font-black text-lg">{shop?.name?.charAt(0).toUpperCase()}</span>
                </div>
                <div className="hidden lg:block">
                  <h2 className="text-sm font-black tracking-tight leading-none uppercase text-white/90">{shop?.name}</h2>
                  <p className="text-[10px] font-bold text-orange-500/70 tracking-widest mt-1 uppercase">Active Ledger</p>
                </div>
              </div>
            </div>

            {/* Center: Main Navigation Tabs */}
            <nav className="hidden md:flex items-center bg-[#121212] p-1.5 rounded-2xl border border-white/5 shadow-inner">
              <NavLink to={`/shop/${shopId}`} end className={navClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Overview</span>
              </NavLink>
              <NavLink to={`/shop/${shopId}/transactions`} className={navClass}>
                <Receipt className="w-4 h-4" />
                <span>Ledger</span>
              </NavLink>
              <NavLink to={`/shop/${shopId}/pnl`} className={navClass}>
                <PieChart className="w-4 h-4" />
                <span>P&L</span>
              </NavLink>
              
              {(shop?.role === "owner" || shop?.role === "partner") && (
                <>
                  <div className="w-[1px] h-4 bg-white/10 mx-2" />
                  <NavLink to={`/shop/${shopId}/members`} className={navClass}>
                    <Users className="w-4 h-4" />
                    <span>Team</span>
                  </NavLink>
                  <NavLink to={`/shop/${shopId}/categories`} className={navClass}>
                    <Hash className="w-4 h-4" />
                    <span>Tags</span>
                  </NavLink>
                </>
              )}
            </nav>

            {/* Right: User Actions */}
            <div className="flex items-center gap-4">
               <button
                onClick={() => { logout(); navigate("/login") }}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-[#444] hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="max-w-7xl mx-auto px-6 py-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="relative">
          {/* Subtle glow effect behind content */}
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-600/5 rounded-full blur-[100px] pointer-events-none" />
          
          <Outlet context={{ shop }} />
        </div>
      </main>
      
      {/* Mobile Bottom Nav (Visible only on small screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f0f]/90 backdrop-blur-lg border-t border-white/5 flex items-center justify-around py-4 px-2 z-50">
          <NavLink to={`/shop/${shopId}`} end className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? "text-orange-500" : "text-[#444]"}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">Home</span>
          </NavLink>
          <NavLink to={`/shop/${shopId}/transactions`} className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? "text-orange-500" : "text-[#444]"}`}>
            <Receipt className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">Sales</span>
          </NavLink>
          <NavLink to={`/shop/${shopId}/pnl`} className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? "text-orange-500" : "text-[#444]"}`}>
            <PieChart className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">Profit</span>
          </NavLink>
      </nav>
    </div>
  )
}