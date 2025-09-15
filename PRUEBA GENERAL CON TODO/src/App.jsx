import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import Home from './pages/Home.jsx'
import VenuesMap from './pages/VenuesMap.jsx'
import Artists from './pages/Artists.jsx'
import Login from './pages/Login.jsx'
import AddArtist from './pages/AddArtist.jsx'
import AddVenue from './pages/AddVenue.jsx'
import MyContent from './pages/MyContent.jsx'
import { getSession, logout } from './lib/session.js'
import { useEffect, useState } from 'react'

export default function App(){
  const nav = useNavigate();
  const [session, setSession] = useState(getSession())

  useEffect(()=>{
    const i = setInterval(()=>setSession(getSession()), 800)
    return ()=>clearInterval(i)
  },[])

  return (
    <div>
      <header className="header">
        <div className="header-inner">
          <div 
            style={{display:'flex', alignItems:'center', gap:8, cursor:'pointer'}} 
            onClick={()=>nav('/')}
          >
            <div style={{width:30, height:30, borderRadius:8, background:'var(--primary)'}}/>
            <strong>Lumina · Mapa & Directorio</strong>
          </div>
          <nav className="nav">
            {session && (
              <>
                <NavLink to="/my" className="btn ghost">Mis venues y artistas</NavLink>
                <NavLink to="/add-artist" className="btn ghost">Agregar proyecto</NavLink>
                <NavLink to="/add-venue" className="btn ghost">Agregar venue</NavLink>
              </>
            )}
            {session ? (
              <button className="btn ghost" onClick={()=>{ logout(); nav('/'); }}>
                Salir ({session.email})
              </button>
            ) : (
              <NavLink to="/login" className="btn">Iniciar sesión</NavLink>
            )}
          </nav>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/venues" element={<VenuesMap/>} />
        <Route path="/artists" element={<Artists/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/add-artist" element={<AddArtist/>} />
        <Route path="/add-venue" element={<AddVenue/>} />
        <Route path="/my" element={<MyContent/>} />
      </Routes>

      <footer className="footer">
        created by <strong>LUMINA · Gestión Creativa</strong>
      </footer>
    </div>
  )
}
