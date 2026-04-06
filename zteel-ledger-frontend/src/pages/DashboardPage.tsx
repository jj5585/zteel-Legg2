import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function DashboardPage() {
  const { shopId } = useParams()
  const [data, setData] = useState<any>(null)
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])

  useEffect(() => {
    api.get(`/shops/${shopId}/dashboard/`, { params: { date_filter: date } })
      .then(r => setData(r.data))
  }, [shopId, date])

  if (!data) return <div className="text-center py-20 text-gray-400">Loading...</div>

  const summaryCards = [
    { label: "Total Income", value: `Rs.${data.total_income.toFixed(2)}`, color: "text-green-600" },
    { label: "Total Expense", value: `Rs.${data.total_expense.toFixed(2)}`, color: "text-red-600" },
    { label: "Net P&L", value: `Rs.${data.net.toFixed(2)}`, color: data.net >= 0 ? "text-green-600" : "text-red-600" },
    { label: "Transactions", value: data.transaction_count, color: "text-violet-600" },
  ]

  const chartData = Object.entries(data.by_payment_method).map(([k, v]: any) => ({
    name: k.toUpperCase(), income: v.income || 0, expense: v.expense || 0
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Daily Summary</h2>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-44" />
      </div>

      <div className={`rounded-xl p-4 text-center font-semibold text-lg ${data.status === "profit" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
        {data.status === "profit" ? "Profit Day" : "Loss Day"} — {date}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map(c => (
          <Card key={c.label}>
            <CardContent className="pt-6">
              <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
              <div className="text-gray-500 text-sm mt-1">{c.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader><CardTitle>By Payment Method</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#16a34a" radius={[4,4,0,0]} />
                <Bar dataKey="expense" fill="#dc2626" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {Object.keys(data.by_category).length > 0 && (
        <Card>
          <CardHeader><CardTitle>By Category</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(data.by_category).map(([cat, vals]: any) => (
                <div key={cat} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700 capitalize">{cat}</span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-green-600">+Rs.{vals.income?.toFixed(2) || "0.00"}</span>
                    <span className="text-red-600">-Rs.{vals.expense?.toFixed(2) || "0.00"}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
