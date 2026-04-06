import { GoogleLogin } from "@react-oauth/google"
import { useNavigate } from "react-router-dom"
import api from "@/lib/api"
import { setToken, setUser } from "@/lib/auth"

export default function LoginPage() {
  const navigate = useNavigate()

  const handleSuccess = async (credentialResponse: any) => {
    try {
      const res = await api.post("/auth/google", { token: credentialResponse.credential })
      setToken(res.data.access_token)
      setUser(res.data.user)
      navigate("/")
    } catch (e) {
      alert("Login failed. Please try again.")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-100">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl font-bold">Z</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Zteel Ledger</h1>
        <p className="text-gray-500 mb-8">Track your shop income and expenses</p>
        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleSuccess} onError={() => alert("Login failed")} />
        </div>
      </div>
    </div>
  )
}
