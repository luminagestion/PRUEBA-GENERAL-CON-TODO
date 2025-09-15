import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSession, login as sessionLogin } from '../lib/session.js'

export default function Login(){
  const nav = useNavigate();
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e){
    e.preventDefault();
    setError(null);
    setLoading(true);
    try{
      if(!email || !password){
        throw new Error('Completá email y contraseña')
      }
      // Intentar login con la librería si existe
      if(typeof sessionLogin === 'function'){
        const ok = await sessionLogin(email, password);
        if(!ok) throw new Error('Credenciales inválidas')
      } else {
        // Fallback: crear sesión simple en localStorage
        const session = { email };
        localStorage.setItem('session', JSON.stringify(session));
      }
      nav('/');
    }catch(err){
      setError(err.message || 'No se pudo iniciar sesión');
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="page login" style={{maxWidth:420, margin:'40px auto'}}>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit} className="card" style={{display:'grid', gap:12, padding:16}}>
        <label style={{display:'grid', gap:6}}>
          <span>Email</span>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@mail.com" required />
        </label>
        <label style={{display:'grid', gap:6}}>
          <span>Contraseña</span>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
        </label>
        {error && <div className="alert error">{error}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}
