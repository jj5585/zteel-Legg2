import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "@/lib/api"
import { logout, getUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function ShopsPage() {
  const [shops, setShops] = useState<any[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const navigate = useNavigate()
  const user = getUser()

  const fetchShops = async () => {
    const res = await api.get("/shops/")
    setShops(res.data)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Shops</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowForm(!showForm)}>+ New Shop</Button>
            <Button variant="outline" onClick={() => { logout(); navigate("/login") }}>Logout</Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>Create a New Shop</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Shop name" value={name} onChange={e => setName(e.target.value)} />
              <Input placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
              <div className="flex gap-2">
                <Button onClick={createShop} disabled={creating}>{creating ? "Creating..." : "Create Shop"}</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {shops.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No shops yet</p>
            <p className="text-sm mt-1">Create your first shop to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shops.map(shop => (
              <Card key={shop.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/shop/${shop.id}`)}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{shop.name}</CardTitle>
                    <Badge>{shop.role}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-sm">{shop.description || "No description"}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
