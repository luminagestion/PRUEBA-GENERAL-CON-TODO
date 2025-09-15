import { useState, useEffect } from 'react'
import { getSession } from '../lib/session.js'

function readJSON(key, fallback){
  try{
    const raw = localStorage.getItem(key);
    if(raw) return JSON.parse(raw);
  }catch{}
  return fallback;
}
function writeJSON(key, value){
  try{
    localStorage.setItem(key, JSON.stringify(value));
  }catch{}
}

function EditArtistDialog({artist, onCancel, onSave}){
  const [form, setForm] = useState(()=> ({
    name: artist?.name || '',
    genres: Array.isArray(artist?.genres) ? artist.genres.join(', ') : (artist?.genres || ''),
    city: artist?.city || '',
    country: artist?.country || '',
    members: String(artist?.members ?? ''),
    contact: artist?.contact || '',
    links: Array.isArray(artist?.links) ? artist.links.join(', ') : (artist?.links || ''),
    bio: artist?.bio || ''
  }));

  function update(field, value){
    setForm(prev => ({...prev, [field]: value}));
  }

  function handleSubmit(e){
    e.preventDefault();
    const normalized = {
      ...artist,
      name: form.name.trim(),
      genres: form.genres.split(',').map(s=>s.trim()).filter(Boolean),
      city: form.city.trim(),
      country: form.country.trim(),
      members: Number.isNaN(Number(form.members)) ? artist.members : Number(form.members),
      contact: form.contact.trim(),
      links: form.links.split(',').map(s=>s.trim()).filter(Boolean),
      bio: form.bio
    };
    onSave(normalized);
  }

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', display:'grid', placeItems:'center', zIndex:50, padding:16}}>
      <form onSubmit={handleSubmit} style={{background:'#221e25', color:'white', width:'min(720px, 95vw)', borderRadius:16, padding:20, boxShadow:'0 10px 40px rgba(0,0,0,0.5)'}}>
        <h3 style={{marginTop:0, marginBottom:12}}>Editar artista</h3>
        <div style={{display:'grid', gap:10}}>
          <label style={{display:'grid', gap:6}}>
            <span>Nombre *</span>
            <input required value={form.name} onChange={e=>update('name', e.target.value)} style={inputStyle}/>
          </label>
          <label style={{display:'grid', gap:6}}>
            <span>Géneros (separados por coma)</span>
            <input value={form.genres} onChange={e=>update('genres', e.target.value)} style={inputStyle}/>
          </label>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
            <label style={{display:'grid', gap:6}}>
              <span>Ciudad</span>
              <input value={form.city} onChange={e=>update('city', e.target.value)} style={inputStyle}/>
            </label>
            <label style={{display:'grid', gap:6}}>
              <span>País</span>
              <input value={form.country} onChange={e=>update('country', e.target.value)} style={inputStyle}/>
            </label>
          </div>
          <label style={{display:'grid', gap:6}}>
            <span>Integrantes (número)</span>
            <input value={form.members} onChange={e=>update('members', e.target.value)} style={inputStyle}/>
          </label>
          <label style={{display:'grid', gap:6}}>
            <span>Contacto</span>
            <input value={form.contact} onChange={e=>update('contact', e.target.value)} style={inputStyle}/>
          </label>
          <label style={{display:'grid', gap:6}}>
            <span>Links (separados por coma)</span>
            <input value={form.links} onChange={e=>update('links', e.target.value)} style={inputStyle}/>
          </label>
          <label style={{display:'grid', gap:6}}>
            <span>Bio</span>
            <textarea rows={4} value={form.bio} onChange={e=>update('bio', e.target.value)} style={textareaStyle}/>
          </label>
        </div>

        <div style={{display:'flex', gap:8, marginTop:16, justifyContent:'flex-end'}}>
          <button type="button" onClick={onCancel} style={btnSecondary}>Cancelar</button>
          <button type="submit" style={btnPrimary}>Guardar cambios</button>
        </div>
      </form>
    </div>
  );
}

const inputStyle = {background:'#2c2730', color:'white', border:'1px solid #3a3340', padding:'10px 12px', borderRadius:10};
const textareaStyle = { ...inputStyle, resize:'vertical' };
const btnPrimary = { background:'#e52687', color:'white', border:'none', padding:'10px 14px', borderRadius:12, cursor:'pointer' };
const btnSecondary = { background:'transparent', color:'white', border:'1px solid #6a5f72', padding:'10px 14px', borderRadius:12, cursor:'pointer' };

export default function MyContent(){
  const session = getSession();
  const [artists, setArtists] = useState([]);
  const [venues, setVenues] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(()=>{
    const allArtists = readJSON('artists', []);
    const allVenues = readJSON('venues', []);
    const ownerId = session?.user?.id || session?.user?.email || session?.userId || null;
    const filterByOwner = (list) => {
      if(!ownerId) return list;
      return list.filter(x => (x.ownerId || x.userId || x.userEmail || x.ownerEmail) ?
        (x.ownerId === ownerId || x.userId === ownerId || x.userEmail === ownerId || x.ownerEmail === ownerId) : true);
    };
    setArtists(filterByOwner(Array.isArray(allArtists) ? allArtists : []));
    setVenues(filterByOwner(Array.isArray(allVenues) ? allVenues : []));
  }, [session?.user?.id, session?.user?.email]);

  function persistArtists(next){
    setArtists(next);
    const all = readJSON('artists', []);
    const ids = new Set(next.map(a=>a.id));
    const ownerId = session?.user?.id || session?.user?.email || session?.userId || null;
    const merged = [
      ...all.filter(x => !ids.has(x.id) && ((x.ownerId||x.userId||x.userEmail||x.ownerEmail) !== ownerId)),
      ...next.map(a => ({...a, ownerId: a.ownerId || ownerId}))
    ];
    writeJSON('artists', merged);
  }
  function onEdit(artist){ setEditing(artist); }
  function onDelete(artist){
    if(!window.confirm(`¿Eliminar "${artist.name}"? Esta acción no se puede deshacer.`)) return;
    persistArtists(artists.filter(a => a.id !== artist.id));
  }
  function onSaveEdited(updated){
    const idx = artists.findIndex(a => a.id === updated.id);
    if(idx === -1){ setEditing(null); return; }
    const next = artists.slice(); next[idx] = {...artists[idx], ...updated};
    persistArtists(next); setEditing(null);
  }

  return (
    <div style={{display:'flex', justifyContent:'center', width:'100%'}}>
      <div className="content" style={{display:'grid', gap:16, width:'min(860px, calc(100% - 4cm))', margin:'24px 0', boxSizing:'border-box'}}>
        <header style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <h2>Mis venues y artistas</h2>
        </header>

        <section className="card" style={{padding:16}}>
          <h3>Artistas</h3>
          {artists.length===0 ? <div className="muted">No tenés artistas guardados aún.</div> :
            <ul style={{display:'grid', gap:12}}>
              {artists.map(a => (
                <li key={a.id} style={{display:'grid', gap:6, padding:12, border:'1px solid #3a3340', borderRadius:12}}>
                  <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, flexWrap:'wrap'}}>
                    <div>
                      <strong style={{fontSize:16}}>{a.name}</strong>
                      <div style={{fontSize:13, opacity:0.85}}>{(a.genres||[]).join(', ')}</div>
                    </div>
                    <div style={{display:'flex', gap:8}}>
                      <button onClick={()=>onEdit(a)} style={btnSecondary}>Editar</button>
                      <button onClick={()=>onDelete(a)} style={btnPrimary}>Eliminar</button>
                    </div>
                  </div>
                  <div style={{fontSize:13, opacity:0.8}}>
                    {(a.city||'')}{a.city && (a.country ? ', ' : '')}{a.country||''}
                    {Number.isFinite(Number(a.members)) ? ` · ${a.members} integrantes` : ''}
                  </div>
                  {a.bio ? <p style={{margin:0, opacity:0.9}}>{a.bio}</p> : null}
                  {(a.links && a.links.length>0) ? (
                    <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                      {a.links.map((url, i)=>(
                        <a key={i} href={/^https?:/i.test(url)? url : `https://${url}`} target="_blank" rel="noreferrer" style={{fontSize:12, opacity:0.9}}>
                          {url}
                        </a>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          }
        </section>

        <section className="card" style={{padding:16}}>
          <h3>Venues</h3>
          {venues.length===0 ? <div className="muted">No tenés venues guardados aún.</div> :
            <ul style={{display:'grid', gap:8}}>
              {venues.map(v => (
                <li key={v.id} style={{display:'grid', gap:4}}>
                  <strong>{v.name}</strong>
                  <div style={{fontSize:13, opacity:0.8}}>
                    {v.country || ''} {Number.isFinite(Number(v.capacity)) ? `· Capacidad ${v.capacity}` : ''}
                  </div>
                </li>
              ))}
            </ul>
          }
        </section>

        {editing && (
          <EditArtistDialog artist={editing} onCancel={()=>setEditing(null)} onSave={onSaveEdited} />
        )}
      </div>
    </div>
  );
}
