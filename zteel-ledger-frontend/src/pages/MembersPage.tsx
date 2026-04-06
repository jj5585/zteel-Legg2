import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function MembersPage() {
  const { shopId } = useParams()
  const [members, setMembers] = useState<any[]>([])
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("staff")
  const [adding, setAdding] = useState(false)

  const fetchMembers = () => api.get(`/shops/${shopId}/members/`).then(r => setMembers(r.data))
  useEffect(() => { fetchMembers() }, [shopId])

  const invite = async () => {
    if (!email.trim()) return
    setAdding(true)
    try {
      await api.post(`/shops/${shopId}/members/`, { email, role })
      setEmail(""); fetchMembers()
    } catch (e: any) {
      alert(e.response?.data?.detail || "Error adding member")
    } finally { setAdding(false) }
  }

  const remove = async (userId: string) => {
    if (!confirm("Remove this member?")) return
    await api.delete(`/shops/${shopId}/members/${userId}`)
    fetchMembers()
  }

  const roleColor: any = { owner: "default", partner: "warning", staff: "success" }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Members</h2>
      <Card>
        <CardHeader><CardTitle>Invite Member</CardTitle></CardHeader>
        <CardContent className="flex gap-3">
          <Input placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
          <Select value={role} onChange={e => setRole(e.target.value)} className="w-36">
            <option value="staff">Staff</option>
            <option value="partner">Partner</option>
            <option value="owner">Owner</option>
          </Select>
          <Button onClick={invite} disabled={adding}>{adding ? "Adding..." : "Invite"}</Button>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {members.map(m => (
              <div key={m.user_id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-sm">
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={roleColor[m.role]}>{m.role}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => remove(m.user_id)} className="text-red-500 hover:text-red-700">Remove</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
