import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import api from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Calendar, TrendingUp, TrendingDown, Activity, Layers, Wallet } from "lucide-react"

const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl p-4 shadow-2xl backdrop-blur-md">
      <p className="text-[10px] uppercase tracking-widest text-[#444] font-black mb-3">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex justify-between items-center gap-6 mb-1 last:mb-0">
          <span className="text-[11px] font-bold" style={{ color: p.fill }}>{p.name}</span>
          <span className="text-white font-black text-xs">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { shopId } = useParams()
  const [data, setData] = useState<any>(null)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    api.get(`/shops/${shopId}/dashboard/`, { params: { date_filter: date } })
      .then(r => setData(r.data))
  }, [shopId, date])

  if (!data) return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-10 w-48 bg-white/5 rounded-xl" />
        <div className="h-10 w-44 bg-white/5 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
      </div>
    </div>
  )

  const summaryCards = [
    { label: "Total Income", value: fmt(data.total_income), color: "text-emerald-400", icon: TrendingUp, glow: "shadow-emerald-500/10" },
    { label: "Total Expense", value: fmt(data.total_expense), color: "text-rose-400", icon: TrendingDown, glow: "shadow-rose-500/10" },
    { label: "Net P&L", value: fmt(data.net), color: data.net >= 0 ? "text-emerald-400" : "text-rose-400", icon: Activity, glow: data.net >= 0 ? "shadow-emerald-500/10" : "shadow-rose-500/10" },
    { label: "Entries", value: data.transaction_count, color: "text-orange-400", icon: Layers, glow: "shadow-orange-500/10" },
  ]

  const chartData = Object.entries(data.by_payment_method).map(([k, v]: any) => ({
    name: k.toUpperCase(), income: v.income || 0, expense: v.expense || 0
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Daily Snapshot</h2>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${data.status === 'profit' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#444]">
              {data.status === "profit" ? "Profitable Session" : "Loss Exposure Recorded"}
            </span>
          </div>
        </div>
        
        <div className="relative group">
          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444] group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            className="bg-[#121212] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-[#a3a3a3] outline-none focus:border-orange-500/50 transition-all w-full md:w-56"
          />
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryCards.map(c => (
          <div key={c.label} className={`relative overflow-hidden bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-2xl ${c.glow}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/5 rounded-lg">
                <c.icon size={18} className={c.color} />
              </div>
              <span className="text-[10px] font-black uppercase text-[#333] tracking-widest">{c.label.split(" ")[1] || "Stats"}</span>
            </div>
            <div className={`text-2xl font-black tracking-tighter ${c.color}`}>{c.value}</div>
            <div className="text-[11px] font-bold text-[#444] uppercase mt-1 tracking-wider">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Chart Section */}
        <div className="lg:col-span-2 bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <Wallet className="text-orange-500 w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-widest text-white/90">Revenue by Channel</h3>
          </div>
          
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: "#444", fontWeight: 900 }} 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: "#444", fontWeight: 900 }} 
                  axisLine={false} 
                  tickLine={false}
                  tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} name="Income" />
                <Bar dataKey="expense" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-xl overflow-hidden flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <Layers className="text-orange-500 w-5 h-5" />
            <h3 className="text-sm font-black uppercase tracking-widest text-white/90">Category Split</h3>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(data.by_category).length > 0 ? (
              Object.entries(data.by_category).map(([cat, vals]: any) => (
                <div key={cat} className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 p-4 rounded-2xl transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-[#a3a3a3] uppercase tracking-tighter">
                      {cat === "uncategorized" ? "Misc" : cat}
                    </span>
                    <div className="flex items-center gap-3">
                       <span className="text-[11px] font-black text-emerald-400">+{fmt(vals.income || 0)}</span>
                    </div>
                  </div>
                  {/* Visual progress bar for expense vs income ratio */}
                  <div className="w-full h-1 bg-[#0a0a0a] rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-emerald-500/50 transition-all duration-1000" 
                      style={{ width: `${(vals.income / (vals.income + vals.expense || 1)) * 100}%` }}
                    />
                    <div 
                      className="h-full bg-rose-500/50 transition-all duration-1000" 
                      style={{ width: `${(vals.expense / (vals.income + vals.expense || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
                <Layers size={40} />
                <span className="text-[10px] font-black mt-4 uppercase">No Category Data</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}