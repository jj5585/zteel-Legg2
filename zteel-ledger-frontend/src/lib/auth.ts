export const getToken = () => localStorage.getItem("token")
export const setToken = (token: string) => localStorage.setItem("token", token)
export const removeToken = () => localStorage.removeItem("token")
export const getUser = () => {
  const u = localStorage.getItem("user")
  return u ? JSON.parse(u) : null
}
export const setUser = (user: object) => localStorage.setItem("user", JSON.stringify(user))
export const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}
