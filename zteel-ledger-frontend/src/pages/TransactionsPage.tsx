import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, Calendar, Trash2, ArrowUpRight, ArrowDownLeft, 
  Wallet, Search, Filter, X, CreditCard, SmartphoneNfc 
} from "lucide-react"

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
    try {
      const [t, c] = await Promise.all([
        api.get(`/shops/${shopId}/transactions/`, { params }),
        api.get(`/shops/${shopId}/categories/`)
      ])
      setTransactions(t.data)
      setCategories(c.data)
    } catch (err) {
      console.error("Ledger sync failed")
    }
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
    if (!confirm("Are you sure you want to void this transaction?")) return
    await api.delete(`/shops/${shopId}/transactions/${id}`)
    fetchAll()
  }

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Transaction Ledger</h2>
          <p className="text-[#6b6b6b] text-sm font-medium mt-1 uppercase tracking-wider">Syncing with real-time sales</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444] group-focus-within:text-orange-500 transition-colors" />
            <input 
              type="date" 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)} 
              className="bg-[#121212] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#a3a3a3] outline-none focus:border-orange-500/50 transition-all w-48"
            />
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-orange-500/10"
          >
            <Plus className="w-5 h-5 mr-1" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Transaction Entry Form */}
      {showForm && (
        <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 mb-6 text-orange-500 font-bold text-sm uppercase tracking-widest">
            <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
            Initialize New Entry
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#444] uppercase ml-1">Type</label>
              <select 
                value={form.type} 
                onChange={e => setForm({...form, type: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl h-11 px-3 text-sm focus:border-orange-500/50 outline-none transition-all appearance-none text-[#a3a3a3]"
              >
                <option value="income">Income (+)</option>
                <option value="expense">Expense (-)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#444] uppercase ml-1">Amount (INR)</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={form.amount} 
                onChange={e => setForm({...form, amount: e.target.value})}
                className="bg-[#0a0a0a] border-white/5 h-11 rounded-xl text-lg font-bold focus:ring-orange-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#444] uppercase ml-1">Method</label>
              <select 
                value={form.payment_method} 
                onChange={e => setForm({...form, payment_method: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl h-11 px-3 text-sm focus:border-orange-500/50 outline-none appearance-none text-[#a3a3a3]"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI / GPay</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#444] uppercase ml-1">Category</label>
              <select 
                value={form.category_id} 
                onChange={e => setForm({...form, category_id: e.target.value})}
                className="w-full bg-[#0a0a0a] border border-white/5 rounded-xl h-11 px-3 text-sm focus:border-orange-500/50 outline-none appearance-none text-[#a3a3a3]"
              >
                <option value="">Uncategorized</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] font-black text-[#444] uppercase ml-1">Notes</label>
              <Input 
                placeholder="What was this for?" 
                value={form.note} 
                onChange={e => setForm({...form, note: e.target.value})} 
                className="bg-[#0a0a0a] border-white/5 h-11 rounded-xl"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button 
                onClick={submit} 
                disabled={saving}
                className="flex-1 bg-white text-black hover:bg-[#e5e5e5] h-11 font-black rounded-xl"
              >
                {saving ? "..." : "Commit"}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowForm(false)} 
                className="h-11 px-4 text-[#6b6b6b] hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4">
              <Search className="text-[#333] w-8 h-8" />
            </div>
            <p className="text-white font-bold text-lg">Empty Ledger</p>
            <p className="text-[#6b6b6b] text-sm mt-1 max-w-[200px]">No activity recorded for the selected period.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {transactions.map(t => (
              <div key={t.id} className="group flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-all">
                <div className="flex items-center gap-5">
                  {/* Icon Indicator */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105 duration-300 ${
                    t.type === "income" 
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                    : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                  }`}>
                    {t.type === "income" ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownLeft className="w-6 h-6" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-black tracking-tight ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                        {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                      </span>
                      <Badge className="bg-white/5 text-[#6b6b6b] border-none text-[10px] px-1.5 py-0 rounded font-bold uppercase">
                        {t.payment_method}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-[#6b6b6b] mt-1">
                      <span className="text-[#a3a3a3] italic">{t.note || "No memo"}</span> 
                      <span className="mx-2 opacity-30">|</span>
                      {new Date(t.transaction_date).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                      <span className="mx-2 opacity-30">·</span>
                      {new Date(t.transaction_date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black text-[#444] uppercase tracking-widest">Category</span>
                    <span className="text-xs font-bold text-[#a3a3a3]">
                      {categories.find(c => c.id === t.category_id)?.name || "General"}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteT(t.id)}
                    className="w-10 h-10 flex items-center justify-center rounded-xl bg-transparent hover:bg-rose-500/10 text-[#2a2a2a] hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}