import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TransactionsPage() {
  const { shopId } = useParams()
  const [transactions, setTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ type: "expense", amount: "", payment_method: "cash", category_id: "", note: "" })
  const [saving, setSaving] = useState(false)
  const [dateFilter, setDateFilter] = useState("")

  const fetchAll = async () => {
    const params: any = {}
    if (dateFilter) params.date_filter = dateFilter
    const [t, c] = await Promise.all([
      api.get(`/shops/${shopId}/transactions/`, { params }),
      api.get(`/shops/${shopId}/categories/`)
    ])
    setTransactions(t.data)
    setCategories(c.data)
  }

  useEffect(() => { fetchAll() }, [shopId, dateFilter])

  const submit = async () => {
    if (!form.amount) return
    setSaving(true)
    try {
      await api.post(`/shops/${shopId}/transactions/`, {
        ...form,
        amount: parseFloat(form.amount),
        category_id: form.category_id || null
      })
      setForm({ type: "expense", amount: "", payment_method: "cash", category_id: "", note: "" })
      setShowForm(false)
      fetchAll()
    } finally { setSaving(false) }
  }

  const deleteT = async (id: string) => {
    if (!confirm("Delete this transaction?")) return
    await api.delete(`/shops/${shopId}/transactions/${id}`)
    fetchAll()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
        <div className="flex gap-2">
          <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-44" />
          <Button onClick={() => setShowForm(!showForm)}>+ Add</Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>New Transaction</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </Select>
            <Input type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
            <Select value={form.payment_method} onChange={e => setForm({...form, payment_method: e.target.value})}>
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </Select>
            <Select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}>
              <option value="">No Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input className="col-span-2" placeholder="Note (optional)" value={form.note} onChange={e => setForm({...form, note: e.target.value})} />
            <div className="col-span-2 flex gap-2">
              <Button onClick={submit} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No transactions found</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {transactions.map(t => (
                <div key={t.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${t.type === "income" ? "text-green-600" : "text-red-600"}`}>
                      {t.type === "income" ? "+" : "-"}Rs.{t.amount.toFixed(2)}
                    </span>
                    <div>
                      <p className="text-sm text-gray-700">{t.note || "—"}</p>
                      <p className="text-xs text-gray-400">{new Date(t.transaction_date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{t.payment_method.toUpperCase()}</Badge>
                    <button onClick={() => deleteT(t.id)} className="text-gray-300 hover:text-red-500 text-sm">x</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
