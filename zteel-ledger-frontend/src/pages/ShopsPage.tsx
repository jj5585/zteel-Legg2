import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/api"
import { logout, getUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, LogOut, Store, ArrowRight, LayoutGrid } from "lucide-react"

export default function ShopsPage() {
  const [shops, setShops] = useState<any[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const user = getUser()

  const fetchShops = async () => {
    try {
      const res = await api.get("/shops/")
      setShops(res.data)
    } catch (err) {
      console.error("Failed to fetch shops")
    }
  }

  useEffect(() => { fetchShops() }, [])

  const createShop = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      await api.post("/shops/", { name, description })
      setName(""); setDescription(""); setShowForm(false)
      fetchShops()
    } finally { setCreating(false) }
  }

  // Refined Role Colors for Dark Mode
  const roleStyles: any = {
    owner: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    partner: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    staff: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5] selection:bg-orange-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[30%] bg-orange-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-white font-black text-sm">Z</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-orange-500/80">Ledger Ecosystem</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white">My Shops</h1>
            <p className="text-[#6b6b6b] mt-2 font-medium">
              Welcome back, <span className="text-[#a3a3a3]">{user?.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white border-none h-11 px-6 rounded-xl font-bold shadow-lg shadow-orange-500/15 transition-all active:scale-95"
            >
              <Plus className="mr-2 h-5 w-5" /> New Shop
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => { logout(); navigate("/login") }}
              className="text-[#6b6b6b] hover:text-rose-400 hover:bg-rose-400/5 h-11 rounded-xl"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Create Form Overlay/Card */}
        {showForm && (
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <LayoutGrid className="text-orange-500 h-5 w-5" /> Initialize New Ledger
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#444] ml-1">Shop Name</label>
                  <Input 
                    placeholder="e.g. SRM Kattankulathur Canteen" 
                    className="bg-[#0a0a0a] border-white/5 h-12 rounded-xl focus:ring-orange-500/50"
                    value={name} onChange={e => setName(e.target.value)} 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#444] ml-1">Business Tagline</label>
                  <Input 
                    placeholder="Brief description" 
                    className="bg-[#0a0a0a] border-white/5 h-12 rounded-xl focus:ring-orange-500/50"
                    value={description} onChange={e => setDescription(e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setShowForm(false)} className="text-[#6b6b6b] font-bold">Cancel</Button>
                <Button 
                  onClick={createShop} 
                  disabled={creating}
                  className="bg-white text-black hover:bg-[#e5e5e5] font-bold rounded-xl px-8"
                >
                  {creating ? "Processing..." : "Deploy Ledger"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Shops Grid */}
        {shops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-white/5 rounded-3xl bg-[#121212]/30">
            <div className="w-20 h-20 rounded-3xl bg-[#121212] border border-white/5 flex items-center justify-center mb-6 shadow-inner">
              <Store className="text-[#333] h-10 w-10" />
            </div>
            <p className="text-white font-bold text-xl">No active ledgers found</p>
            <p className="text-[#6b6b6b] text-sm mt-2 max-w-[240px] text-center leading-relaxed">
              Every great venture starts with a single entry. Create your first shop to begin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {shops.map(shop => (
              <div
                key={shop.id}
                onClick={() => navigate(`/shop/${shop.id}`)}
                className="group relative bg-[#121212] border border-white/5 rounded-2xl p-6 cursor-pointer hover:border-orange-500/30 transition-all duration-300 shadow-lg hover:shadow-orange-500/5 overflow-hidden"
              >
                {/* Hover Accent */}
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="text-orange-500 h-5 w-5 translate-x--2 group-hover:translate-x-0 transition-transform" />
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-[#0a0a0a] border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <span className="text-orange-500 font-black text-xl">{shop.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-white group-hover:text-orange-100 transition-colors">{shop.name}</h2>
                    <Badge className={`mt-1 font-bold text-[10px] uppercase tracking-tighter rounded-md px-1.5 border ${roleStyles[shop.role] || ""}`}>
                      {shop.role}
                    </Badge>
                  </div>
                </div>

                <p className="text-[#6b6b6b] text-sm line-clamp-2 min-h-[40px] mb-4 leading-relaxed italic">
                  "{shop.description || "No description provided for this ledger."}"
                </p>

                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333]">Retail Unit ID: {shop.id.toString().slice(-4)}</span>
                  <div className="flex -space-x-2">
                    {[1, 2].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-[#121212] bg-[#222]" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}