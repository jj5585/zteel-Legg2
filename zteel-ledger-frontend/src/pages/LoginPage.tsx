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
    } catch {
      // Replaced alert with a cleaner console log or you can add a toast notification here later
      console.error("Login failed")
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-[#0a0a0a] selection:bg-orange-500/30">
      {/* Dynamic Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-900/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-[380px] px-6">
        {/* Branding Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative w-16 h-16 bg-[#161616] border border-[#2a2a2a] rounded-2xl flex items-center justify-center shadow-2xl mb-6">
              <span className="text-orange-500 text-3xl font-black tracking-tighter">Z</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Zteeel <span className="text-orange-500">Ledger</span>
          </h1>
          <p className="text-[#888] text-[15px] mt-2 text-center">
            Streamlined shop management <br /> for modern vendors
          </p>
        </div>

        {/* Login Container */}
        <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="mb-8">
            <h2 className="text-white font-semibold text-lg text-center">Sign In</h2>
            <p className="text-[#666] text-sm text-center mt-1">Select your account to continue</p>
          </div>

          {/* Google Button - Custom Wrapper to ensure it stays centered and styled */}
          <div className="flex justify-center w-full transition-transform active:scale-[0.98]">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.log("Login failed")}
              theme="filled_black"
              size="large"
              shape="pill"
              width="310" 
            />
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[#444] text-[11px] text-center leading-relaxed px-4">
              By accessing Zteeel Ledger, you agree to our 
              <span className="text-orange-500/80 cursor-pointer hover:underline ml-1">Terms</span> & 
              <span className="text-orange-500/80 cursor-pointer hover:underline ml-1">Privacy</span>
            </p>
          </div>
        </div>

        {/* Subtle Footer */}
        <p className="text-[#333] text-[12px] text-center mt-10 font-medium">
          © 2026 Zteeel Hyperlocal Solutions
        </p>
      </div>
    </div>
  )
}