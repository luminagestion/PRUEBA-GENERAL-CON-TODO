
const KEY='LUMINA_SESSION'
export function getSession(){
  try{ const raw=localStorage.getItem(KEY); if(raw) return JSON.parse(raw) }catch{}
  return null
}
export function login({email, name}){
  const s={ id: crypto.randomUUID(), email, name }
  localStorage.setItem(KEY, JSON.stringify(s))
  return s
}
export function logout(){ localStorage.removeItem(KEY) }
