import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, Calendar, Trash2, ArrowUpRight, ArrowDownLeft, 
  Search, X, Tag as TagIcon, Sparkles
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
    if (!confirm("Void this transaction?")) return
    await api.delete(`/shops/${shopId}/transactions/${id}`)
    fetchAll()
  }

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`

  // Helper to handle preset clicks
  const applyPreset = (cat: any) => {
    setForm({ 
      ...form, 
      category_id: cat.id, 
      note: cat.name 
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col gap-4 px-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Ledger</h2>
          <p className="text-[#444] text-[10px] font-black uppercase tracking-[0.2em] mt-1">Terminal Active</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:flex-none">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#444]" />
            <input 
              type="date" 
              value={dateFilter} 
              onChange={e => setDateFilter(e.target.value)} 
              className="bg-[#121212] border border-white/5 rounded-xl pl-9 pr-3 py-2.5 text-xs text-[#a3a3a3] outline-none w-full md:w-44"
            />
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-black h-11 px-6 rounded-xl shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </div>
      </div>

      {/* Mobile-Friendly Action Sheet Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0a0a0a] border-t border-white/10 w-full max-w-xl rounded-t-[2.5rem] md:rounded-3xl p-8 shadow-2xl animate-in slide-in-from-bottom-full md:slide-in-from-top-4">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <Sparkles className="text-orange-500 w-4 h-4" />
                <h3 className="text-white font-black text-xs uppercase tracking-[0.2em]">Quick Entry</h3>
              </div>
              <button onClick={() => setShowForm(false)} className="bg-white/5 p-2 rounded-full text-[#444] hover:text-white"><X size={20}/></button>
            </div>

            <div className="space-y-6">
              {/* Type & Amount Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#333] uppercase ml-1">Flow</label>
                  <select 
                    value={form.type} 
                    onChange={e => setForm({...form, type: e.target.value})}
                    className="w-full bg-[#121212] border border-white/5 rounded-xl h-14 px-4 text-sm font-bold text-white outline-none focus:border-orange-500/50 appearance-none"
                  >
                    <option value="income">Income (+)</option>
                    <option value="expense">Expense (-)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#333] uppercase ml-1">Amount</label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={form.amount} 
                    onChange={e => setForm({...form, amount: e.target.value})}
                    className="bg-[#121212] border-white/5 h-14 rounded-xl text-xl font-black text-orange-500 focus:ring-orange-500/50"
                  />
                </div>
              </div>

              {/* Preset Tags (Replaces manual memo for speed) */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-[#333] uppercase ml-1">Quick Presets</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => applyPreset(cat)}
                      className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all border ${
                        form.category_id === cat.id 
                        ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20 scale-95" 
                        : "bg-[#121212] border-white/5 text-[#6b6b6b] active:bg-white/5"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                  {categories.length === 0 && <p className="text-[10px] italic text-[#333]">No tags created yet...</p>}
                </div>
              </div>

              {/* Advanced Fields (Note & Payment) */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-[#333] uppercase ml-1">Custom Note</label>
                  <Input 
                    placeholder="Memo..." 
                    value={form.note} 
                    onChange={e => setForm({...form, note: e.target.value})} 
                    className="bg-[#121212] border-white/5 h-12 rounded-xl text-sm"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                   <label className="text-[10px] font-black text-[#333] uppercase ml-1">Method</label>
                   <div className="flex gap-2">
                      {["cash", "upi", "card"].map(m => (
                        <button
                          key={m}
                          onClick={() => setForm({...form, payment_method: m})}
                          className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                            form.payment_method === m 
                            ? "bg-white text-black border-white" 
                            : "bg-[#121212] border-white/5 text-[#444]"
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                   </div>
                </div>
              </div>

              <Button 
                onClick={submit} 
                disabled={saving}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-16 font-black rounded-2xl text-lg shadow-xl shadow-orange-500/10 active:scale-[0.98] transition-transform"
              >
                {saving ? "Deploying..." : "Commit Transaction"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="space-y-3 px-2">
        {transactions.map(t => (
          <div 
            key={t.id} 
            className="group bg-[#121212] border border-white/5 rounded-2xl p-4 md:px-6 md:py-5 flex items-center justify-between transition-all active:bg-[#1a1a1a]"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                t.type === "income" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
              }`}>
                {t.type === "income" ? <ArrowUpRight size={22} /> : <ArrowDownLeft size={22} />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-black tracking-tight ${t.type === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                    {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                  </span>
                  <span className="text-[9px] font-black text-[#333] uppercase bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                    {t.payment_method}
                  </span>
                </div>
                <p className="text-[11px] font-bold text-[#6b6b6b] mt-0.5">
                  {t.note || "General Transaction"} • {new Date(t.transaction_date).toLocaleTimeString("en-IN", { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>

            <button
              onClick={() => deleteT(t.id)}
              className="w-10 h-10 flex items-center justify-center rounded-xl text-[#2a2a2a] hover:text-rose-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        {transactions.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-center opacity-20">
            <TagIcon size={48} className="mb-4" />
            <p className="text-xs font-black uppercase tracking-[0.3em]">No Records Found</p>
          </div>
        )}
      </div>
    </div>
  )
}