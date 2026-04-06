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
      <h2 className="text-xl font-bold text-gray-900">Categories</h2>
      <Card>
        <CardHeader><CardTitle>Add Category</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Input placeholder="e.g. Fruits, Salary, Gas..." value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && add()} />
          <Button onClick={add} disabled={adding}>{adding ? "Adding..." : "Add"}</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No categories yet</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between px-6 py-4">
                  <span className="text-sm font-medium text-gray-800">{c.name}</span>
                  <button onClick={() => remove(c.id)} className="text-gray-300 hover:text-red-500 text-sm">x</button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
