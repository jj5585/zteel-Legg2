import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CategoriesPage() {
  const { shopId } = useParams()
  const [categories, setCategories] = useState<any[]>([])
  const [name, setName] = useState("")
  const [adding, setAdding] = useState(false)

  const fetchCats = () => api.get(`/shops/${shopId}/categories/`).then(r => setCategories(r.data))
  useEffect(() => { fetchCats() }, [shopId])

  const add = async () => {
    if (!name.trim()) return
    setAdding(true)
    try {
      await api.post(`/shops/${shopId}/categories/`, { name })
      setName(""); fetchCats()
    } finally { setAdding(false) }
  }

  const remove = async (id: string) => {
    if (!confirm("Delete this category?")) return
    await api.delete(`/shops/${shopId}/categories/${id}`)
    fetchCats()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#f5f5f5] tracking-tight">Categories</h2>
      <Card>
        <CardHeader><CardTitle>Add Category</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Input
            placeholder="e.g. Fruits, Salary, Gas..."
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()}
          />
          <Button onClick={add} disabled={adding}>{adding ? "Adding..." : "Add"}</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="text-center py-16 text-[#6b6b6b] text-sm">No categories yet</div>
          ) : (
            <div className="divide-y divide-[#1f1f1f]">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#1e1e1e] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-orange-500/60" />
                    <span className="text-sm font-medium text-[#f5f5f5]">{c.name}</span>
                  </div>
                  <button
                    onClick={() => remove(c.id)}
                    className="text-[#333] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}