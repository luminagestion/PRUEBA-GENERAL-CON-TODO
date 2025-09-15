
import { useEffect, useState } from 'react'
import GenreMultiSelect from './GenreMultiSelect.jsx'
import { resizeImageToDataURL } from './ImageResizer.js'

const empty = {
  id:null, ownerId:null,
  name:'', members:1, genres:[], photo:'',
  links:{ instagram:'', spotify:'', youtube:'', tiktok:'', website:'' },
  contact:{ email:'', whatsapp:'', hideWhatsapp:false },
  city:'', bio:'', venuesPlayed:[]
}

export default function ArtistForm({initial, onSubmit, onCancel}){
  const [form, setForm] = useState(initial || empty)

  useEffect(()=>{ setForm(initial || empty) },[initial])

  function set(path, value){
    setForm(prev=>{
      const next = structuredClone(prev)
      const seg = path.split('.')
      let ref = next
      while(seg.length>1){ ref = ref[seg.shift()] }
      ref[seg[0]] = value
      return next
    })
  }

  async function handlePhoto(e){
    const file = e.target.files?.[0]
    if(!file) return
    const dataUrl = await resizeImageToDataURL(file, 1500)
    set('photo', dataUrl)
  }

  function handleSubmit(e){
    e.preventDefault()
    if(!form.links.instagram) return alert('El link de Instagram es obligatorio')
    if(!form.links.spotify) return alert('El link de Spotify es obligatorio')
    if(!form.contact.email) return alert('El email de contacto es obligatorio')
    if(!form.contact.whatsapp) return alert('El WhatsApp de contacto es obligatorio')
    onSubmit?.(form)
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{display:'grid', gap:10}}>
      <div className="label">Nombre del proyecto</div>
      <input className="input" value={form.name} onChange={e=>set('name', e.target.value)} required />

      <div className="row">
        <div style={{width:160}}>
          <div className="label">Cantidad de integrantes</div>
          <input className="input" type="number" min="1" value={form.members} onChange={e=>set('members', Number(e.target.value||1))} />
        </div>
        <div style={{flex:1}}>
          <div className="label">Ciudad</div>
          <input className="input" value={form.city} onChange={e=>set('city', e.target.value)} />
        </div>
      </div>

      <div className="label">Géneros (múltiple)</div>
      <GenreMultiSelect value={form.genres} onChange={arr=>set('genres', arr)} />

      <div className="row">
        <div style={{flex:1}}>
          <div className="label">Foto (se redimensiona a máx. 1500px)</div>
          <input className="input" type="file" accept="image/*" onChange={handlePhoto} />
        </div>
        {form.photo && <img src={form.photo} alt="" style={{width:120, height:120, borderRadius:12, objectFit:'cover', border:'1px solid rgba(255,255,255,.08)'}}/>}
      </div>

      <div className="row">
        <div style={{flex:1}}>
          <div className="label">Instagram (obligatorio)</div>
          <input className="input" value={form.links.instagram} onChange={e=>set('links.instagram', e.target.value)} required />
        </div>
        <div style={{flex:1}}>
          <div className="label">Spotify (obligatorio)</div>
          <input className="input" value={form.links.spotify} onChange={e=>set('links.spotify', e.target.value)} required />
        </div>
      </div>

      <div className="row">
        <div style={{flex:1}}>
          <div className="label">YouTube</div>
          <input className="input" value={form.links.youtube} onChange={e=>set('links.youtube', e.target.value)} />
        </div>
        <div style={{flex:1}}>
          <div className="label">TikTok</div>
          <input className="input" value={form.links.tiktok} onChange={e=>set('links.tiktok', e.target.value)} />
        </div>
      </div>

      <div className="row">
        <div style={{flex:1}}>
          <div className="label">Email de contacto (obligatorio)</div>
          <input className="input" value={form.contact.email} onChange={e=>set('contact.email', e.target.value)} required />
        </div>
        <div style={{flex:1}}>
          <div className="label">WhatsApp (obligatorio)</div>
          <input className="input" value={form.contact.whatsapp} onChange={e=>set('contact.whatsapp', e.target.value)} required />
          <label className="notice" style={{display:'block', marginTop:6}}>
            <input type="checkbox" checked={form.contact.hideWhatsapp} onChange={e=>set('contact.hideWhatsapp', e.target.checked)} style={{marginRight:8}}/>
            No mostrar el número de WhatsApp al público
          </label>
        </div>
      </div>

      <div>
        <div className="label">Website</div>
        <input className="input" value={form.links.website} onChange={e=>set('links.website', e.target.value)} />
      </div>

      <div className="row" style={{justifyContent:'end'}}>
        <button type="button" className="btn ghost small" onClick={onCancel}>Cancelar</button>
        <button className="btn small">Guardar</button>
      </div>
    </form>
  )
}
