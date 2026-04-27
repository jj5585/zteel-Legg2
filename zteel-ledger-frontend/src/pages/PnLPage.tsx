import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell
} from "recharts"
import api from "@/lib/api"

type Mode = "daily" | "weekly" | "monthly"

interface Period {
  label: string
  income: number
  expense: number
  net: number
  transaction_count: number
}

interface RangeData {
  mode: Mode
  periods: Period[]
  totals: {
    income: number
    expense: number
    net: number
    status: "profit" | "loss"
  }
}

const TABS: { label: string; value: Mode }[] = [
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
]

const fmt = (n: number) =>
  `₹${Math.abs(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const { income, expense, net } = payload[0]?.payload || {}
  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-3 shadow-2xl text-xs min-w-[140px]">
      <p className="font-semibold text-[#a3a3a3] mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-[#6b6b6b]">Income</span>
          <span className="text-green-400 font-medium">{fmt(income)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-[#6b6b6b]">Expense</span>
          <span className="text-red-400 font-medium">{fmt(expense)}</span>
        </div>
        <div className="flex justify-between gap-4 border-t border-[#2a2a2a] pt-1 mt-1">
          <span className="text-[#6b6b6b]">Net</span>
          <span className={`font-bold ${net >= 0 ? "text-green-400" : "text-red-400"}`}>
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
  const [data, setData] = useState<RangeData | null>(null)
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<"bar" | "net">("bar")

  useEffect(() => {
    setLoading(true)
    setData(null)
    api
      .get(`/shops/${shopId}/dashboard/range`, { params: { mode } })
      .then((r) => setData(r.data))
      .finally(() => setLoading(false))
  }, [shopId, mode])

  const totals = data?.totals
  const periods = data?.periods ?? []

  const chartData = periods.map((p, i) => ({
    ...p,
    displayLabel:
      mode === "daily" && periods.length > 15 && i % 5 !== 0 ? "" : p.label,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#f5f5f5] tracking-tight">Profit & Loss</h2>
          <p className="text-sm text-[#6b6b6b] mt-0.5">
            {mode === "daily" ? "Last 30 days" : mode === "weekly" ? "Last 12 weeks" : "Last 12 months"}
          </p>
        </div>
        {/* Mode tabs */}
        <div className="flex items-center gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setMode(t.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                mode === t.value
                  ? "bg-orange-500 text-white shadow-[0_0_12px_rgba(249,115,22,0.3)]"
                  : "text-[#6b6b6b] hover:text-[#a3a3a3]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary strip */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 bg-[#1a1a1a] rounded-xl animate-pulse border border-[#2a2a2a]" />
          ))}
        </div>
      ) : totals ? (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <p className="text-xs text-[#6b6b6b] mb-1 font-medium">Total Income</p>
            <p className="text-xl font-bold text-green-400 tracking-tight">{fmt(totals.income)}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <p className="text-xs text-[#6b6b6b] mb-1 font-medium">Total Expense</p>
            <p className="text-xl font-bold text-red-400 tracking-tight">{fmt(totals.expense)}</p>
          </div>
          <div className={`rounded-xl p-4 border ${
            totals.net >= 0
              ? "bg-orange-500/10 border-orange-500/20"
              : "bg-red-500/10 border-red-500/20"
          }`}>
            <p className="text-xs text-[#6b6b6b] mb-1 font-medium">Net P&L</p>
            <p className={`text-xl font-bold tracking-tight ${totals.net >= 0 ? "text-orange-400" : "text-red-400"}`}>
              {totals.net >= 0 ? "+" : "–"}{fmt(Math.abs(totals.net))}
            </p>
            <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
              totals.status === "profit"
                ? "bg-orange-500/20 text-orange-400"
                : "bg-red-500/20 text-red-400"
            }`}>
              {totals.status === "profit" ? "Profit" : "Loss"}
            </span>
          </div>
        </div>
      ) : null}

      {/* Chart view toggle */}
      <div className="flex items-center gap-2">
        {["bar", "net"].map((v) => (
          <button
            key={v}
            onClick={() => setView(v as "bar" | "net")}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 ${
              view === v
                ? "border-orange-500/50 bg-orange-500/15 text-orange-400"
                : "border-[#2a2a2a] text-[#6b6b6b] hover:border-[#333] hover:text-[#a3a3a3]"
            }`}
          >
            {v === "bar" ? "Income vs Expense" : "Net P&L"}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
        {loading ? (
          <div className="h-64 bg-[#111] rounded-xl animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            {view === "bar" ? (
              <BarChart data={chartData} barGap={2} barCategoryGap="30%">
                <XAxis dataKey="displayLabel" tick={{ fontSize: 11, fill: "#6b6b6b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b6b6b" }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff05" }} />
                <Bar dataKey="income" fill="#22c55e" radius={[4,4,0,0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            ) : (
              <BarChart data={chartData} barCategoryGap="35%">
                <XAxis dataKey="displayLabel" tick={{ fontSize: 11, fill: "#6b6b6b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#6b6b6b" }} axisLine={false} tickLine={false}
                  tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff05" }} />
                <ReferenceLine y={0} stroke="#2a2a2a" strokeWidth={1.5} />
                <Bar dataKey="net" radius={[4,4,0,0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.net >= 0 ? "#f97316" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Breakdown table */}
      {!loading && periods.length > 0 && (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-[0_2px_20px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-4 px-5 py-3 border-b border-[#222] text-xs font-semibold text-[#6b6b6b]">
            <span>Period</span>
            <span>Income</span>
            <span>Expense</span>
            <span className="text-right">Net</span>
          </div>
          <div className="divide-y divide-[#1a1a1a] max-h-72 overflow-y-auto">
            {[...periods].reverse().map((p) => (
              <div key={p.label} className="grid grid-cols-4 px-5 py-3 text-xs hover:bg-[#1e1e1e] transition-colors">
                <span className="text-[#6b6b6b] font-medium">{p.label}</span>
                <span className="text-green-400">{p.income > 0 ? `+${fmt(p.income)}` : "—"}</span>
                <span className="text-red-400">{p.expense > 0 ? `–${fmt(p.expense)}` : "—"}</span>
                <span className={`font-semibold text-right ${p.net > 0 ? "text-orange-400" : p.net < 0 ? "text-red-400" : "text-[#333]"}`}>
                  {p.net === 0 ? "—" : `${p.net > 0 ? "+" : "–"}${fmt(p.net)}`}
                </span>
              </div>
            ))}
          </div>
          {totals && (
            <div className="grid grid-cols-4 px-5 py-3 bg-[#111] border-t border-[#2a2a2a] text-xs font-semibold">
              <span className="text-[#a3a3a3]">Total</span>
              <span className="text-green-400">{fmt(totals.income)}</span>
              <span className="text-red-400">{fmt(totals.expense)}</span>
              <span className={`text-right ${totals.net >= 0 ? "text-orange-400" : "text-red-400"}`}>
                {totals.net >= 0 ? "+" : "–"}{fmt(Math.abs(totals.net))}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading && periods.every((p) => p.transaction_count === 0) && (
        <div className="text-center py-16 text-[#333]">
          <div className="text-4xl mb-3 font-thin text-[#2a2a2a]">₹0</div>
          <p className="text-sm text-[#6b6b6b]">No transactions found for this period</p>
        </div>
      )}
    </div>
  )
}