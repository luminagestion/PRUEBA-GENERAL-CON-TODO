
import { NavLink, useNavigate } from 'react-router-dom'
import { getSession } from '../lib/session.js'

export default function Home(){
  const session = getSession()
  const nav = useNavigate()
  function goProtected(path){
    if(!getSession()) return nav('/login?redirect='+encodeURIComponent(path))
    nav(path)
  }
  return (
    <main className="container">
      <section className="card" style={{padding:'28px'}}>
        <h1 style={{marginTop:0, fontSize:36}}>Lumina - Mapa & Directorio</h1>
        <p style={{fontSize:18, lineHeight:1.5, color:'var(--muted)'}}>
          Una herramienta simple y completa. Donde podras encontrar salas y artistas, asi como sumar tu proyecto o espacio a nuestro catálogo para que todxs te encuentren!
        </p>
        <div style={{display:'flex', gap:12, marginTop:16, flexWrap:'wrap'}}>
          <NavLink to="/venues" className="btn">Explorar Mapa de Venues</NavLink>
          <NavLink to="/artists" className="btn ghost">Ir al Directorio de Artistas</NavLink>
          <button className="btn ghost" onClick={()=>goProtected('/add-artist')}>Agregar proyecto</button>
          <button className="btn ghost" onClick={()=>goProtected('/add-venue')}>Agregar venue</button>
        </div>
        {!session && <p className="notice" style={{marginTop:10}}>Para cargar o editar proyectos y venues debés iniciar sesión.</p>}
      </section>
    </main>
  )
}
