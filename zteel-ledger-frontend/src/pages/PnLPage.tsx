import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell, CartesianGrid
} from "recharts"
import api from "@/lib/api"
import { TrendingUp, TrendingDown, LayoutPanelLeft, LineChart, AlertCircle } from "lucide-react"

type Mode = "daily" | "weekly" | "monthly"

const TABS: { label: string; value: Mode }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
]

const fmt = (n: number) =>
  `₹${Math.abs(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const { income, expense, net } = payload[0]?.payload || { income: 0, expense: 0, net: 0 }
  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[180px]">
      <p className="text-[10px] font-black uppercase tracking-widest text-[#444] mb-3 border-b border-white/5 pb-2">{label}</p>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold text-[#6b6b6b]">Income</span>
          <span className="text-emerald-400 font-black text-sm">+{fmt(income)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-bold text-[#6b6b6b]">Expense</span>
          <span className="text-rose-400 font-black text-sm">-{fmt(expense)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <span className="text-[11px] font-black text-white uppercase tracking-tighter">Net</span>
          <span className={`font-black text-sm ${net >= 0 ? "text-orange-500" : "text-rose-500"}`}>
            {net >= 0 ? "+" : "–"}{fmt(net)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function PnLPage() {
  const { shopId } = useParams()
  const [mode, setMode] = useState<Mode>("daily")
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<"bar" | "net">("bar")

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError(null)

    api.get(`/shops/${shopId}/dashboard/range`, { params: { mode } })
      .then((r) => {
        if (isMounted) {
          console.log("PnL Data Received:", r.data)
          setData(r.data)
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("PnL API Error:", err)
          setError(err.response?.data?.detail || "Could not load P&L data")
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => { isMounted = false }
  }, [shopId, mode])

  // Defensive data mapping
  const totals = data?.totals || { income: 0, expense: 0, net: 0, status: 'loss' }
  const periods = data?.periods || []

  const chartData = periods.map((p: any, i: number) => ({
    ...p,
    displayLabel: mode === "daily" && periods.length > 15 && i % 5 !== 0 ? "" : p.label,
  }))

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#444]">Syncing Ledger Data</p>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <AlertCircle className="text-rose-500 mb-4" size={48} />
      <h3 className="text-white font-bold text-lg">Endpoint Error</h3>
      <p className="text-[#6b6b6b] text-sm mt-1 max-w-xs">{error}</p>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Performance Ledger</h2>
          <div className="flex items-center gap-2 mt-2">
             <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
             <p className="text-[10px] font-black text-[#444] uppercase tracking-[0.2em]">
                {mode} Overview
             </p>
          </div>
        </div>

        <div className="flex bg-[#121212] border border-white/5 p-1 rounded-2xl">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setMode(t.value)}
              className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                mode === t.value ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-[#444] hover:text-[#a3a3a3]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-xl">
           <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-[#333] uppercase tracking-widest">
              <TrendingUp size={14} className="text-emerald-500" /> Revenue
           </div>
           <p className="text-2xl font-black text-emerald-400">{fmt(totals.income)}</p>
        </div>
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-xl">
           <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-[#333] uppercase tracking-widest">
              <TrendingDown size={14} className="text-rose-500" /> Expense
           </div>
           <p className="text-2xl font-black text-rose-400">{fmt(totals.expense)}</p>
        </div>
        <div className={`bg-[#121212] border rounded-2xl p-6 shadow-xl ${totals.net >= 0 ? "border-orange-500/20" : "border-rose-500/20"}`}>
           <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-[#333] uppercase tracking-widest">
              <LayoutPanelLeft size={14} className={totals.net >= 0 ? "text-orange-500" : "text-rose-500"} /> Net P&L
           </div>
           <p className={`text-2xl font-black ${totals.net >= 0 ? "text-orange-500" : "text-rose-500"}`}>
             {totals.net >= 0 ? "+" : "–"}{fmt(Math.abs(totals.net))}
           </p>
        </div>
      </div>

      {/* Chart Control */}
      <div className="flex justify-end gap-2">
        {["bar", "net"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v as any)}
            className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border transition-all ${
              view === v ? "border-orange-500/50 bg-orange-500/10 text-orange-500" : "border-white/5 text-[#444]"
            }`}
          >
            {v === "bar" ? "Income/Expense" : "Net Flow"}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="bg-[#121212] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden min-h-[360px]">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-orange-500/[0.02] to-transparent pointer-events-none" />
        
        <ResponsiveContainer width="100%" height={280}>
          {view === "bar" ? (
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
              <XAxis dataKey="displayLabel" tick={{fontSize: 9, fill: "#444", fontWeight: 900}} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{fontSize: 9, fill: "#444", fontWeight: 900}} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: "rgba(255,255,255,0.03)"}} />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
              <XAxis dataKey="displayLabel" tick={{fontSize: 9, fill: "#444", fontWeight: 900}} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{fontSize: 9, fill: "#444", fontWeight: 900}} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: "rgba(255,255,255,0.03)"}} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
              <Bar dataKey="net" radius={[4, 4, 4, 4]}>
                {chartData.map((e: any, i: number) => (
                  <Cell key={i} fill={e.net >= 0 ? "#f97316" : "#f43f5e"} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

    </div>
  )
}