import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { UserPlus, UserMinus, ShieldCheck, Users, Mail, ShieldAlert, MoreHorizontal } from "lucide-react"

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
      console.error(e.response?.data?.detail || "Error adding member")
    } finally { setAdding(false) }
  }

  const remove = async (userId: string) => {
    if (!confirm("Are you sure you want to revoke this user's access?")) return
    await api.delete(`/shops/${shopId}/members/${userId}`)
    fetchMembers()
  }

  const roleStyles: any = {
    owner: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    partner: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    staff: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Team Management</h2>
          <p className="text-[#6b6b6b] text-sm font-medium mt-1 uppercase tracking-widest">Manage access and permissions</p>
        </div>
        <div className="flex -space-x-3">
          {members.slice(0, 5).map((m) => (
            <div key={m.user_id} className="w-10 h-10 rounded-full border-2 border-[#0a0a0a] bg-[#121212] flex items-center justify-center text-[10px] font-black text-orange-500 uppercase">
              {m.name?.charAt(0)}
            </div>
          ))}
          {members.length > 5 && (
            <div className="w-10 h-10 rounded-full border-2 border-[#0a0a0a] bg-[#1a1a1a] flex items-center justify-center text-[10px] font-bold text-[#444]">
              +{members.length - 5}
            </div>
          )}
        </div>
      </div>

      {/* Invite Interface */}
      <div className="bg-[#121212] border border-white/5 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-2 mb-6 text-orange-500 font-bold text-sm uppercase tracking-widest">
           <UserPlus className="w-4 h-4" />
           Send Access Invitation
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444] group-focus-within:text-orange-500 transition-colors" />
            <Input 
              placeholder="team.member@example.com" 
              className="bg-[#0a0a0a] border-white/5 h-12 pl-11 rounded-xl focus:ring-orange-500/50"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div className="relative">
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)}
              className="w-full md:w-36 bg-[#0a0a0a] border border-white/5 rounded-xl h-12 px-4 text-sm font-bold text-[#a3a3a3] outline-none focus:border-orange-500/50 appearance-none transition-all cursor-pointer"
            >
              <option value="staff">Staff</option>
              <option value="partner">Partner</option>
              <option value="owner">Owner</option>
            </select>
          </div>
          <Button 
            onClick={invite} 
            disabled={adding}
            className="bg-white text-black hover:bg-[#e5e5e5] h-12 px-8 font-black rounded-xl transition-all active:scale-95"
          >
            {adding ? "Deploying..." : "Invite"}
          </Button>
        </div>
      </div>

      {/* Member Directory */}
      <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
        <div className="divide-y divide-white/5">
          {members.map(m => (
            <div key={m.user_id} className="group flex items-center justify-between px-6 py-5 hover:bg-white/[0.01] transition-all">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/5 flex items-center justify-center text-white font-black text-lg group-hover:scale-105 transition-transform duration-500">
                    {m.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[#121212] rounded-full shadow-sm" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white group-hover:text-orange-100 transition-colors">{m.name}</h4>
                  <p className="text-xs font-medium text-[#444] mt-0.5">{m.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <Badge className={`font-bold text-[10px] uppercase tracking-tighter rounded-md px-2 py-0.5 border ${roleStyles[m.role]}`}>
                  {m.role}
                </Badge>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => remove(m.user_id)} 
                    className="w-9 h-9 rounded-xl text-[#333] hover:text-rose-500 hover:bg-rose-500/5"
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Legend */}
      <div className="flex items-center justify-center gap-8 py-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] font-black text-[#333] uppercase tracking-[0.2em]">
          <ShieldCheck className="w-3 h-3" /> Full Control
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-[#333] uppercase tracking-[0.2em]">
          <Users className="w-3 h-3" /> Shared Revenue
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-[#333] uppercase tracking-[0.2em]">
          <ShieldAlert className="w-3 h-3" /> Entry Only
        </div>
      </div>
    </div>
  )
}