
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'

const empty = {
  id:null, ownerId:null,
  name:'',
  address:{ country:'', province:'', city:'' },
  lat:-34.6037, lng:-58.3816,
  capacity:'',
  genres:[],
  links:{ instagram:'', facebook:'', website:'' },
  contact:{ email:'', whatsapp:'', hideWhatsapp:false }
}

function ClickPicker({onPick}){
  useMapEvents({ click(e){ onPick?.(e.latlng) } })
  return null
}

export default function VenueForm({initial, onSubmit, onCancel}){
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

  function handleSubmit(e){
    e.preventDefault()
    if(!form.name) return alert('El nombre de la venue es obligatorio')
    if(!form.capacity) return alert('El aforo es obligatorio')
    if(!form.links.instagram) return alert('El Instagram es obligatorio')
    if(!form.contact.email) return alert('El email de contacto es obligatorio')
    if(!form.contact.whatsapp) return alert('El WhatsApp es obligatorio')
    onSubmit?.(form)
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{display:'grid', gap:10}}>
      <div className="label">Nombre de la venue</div>
      <input className="input" value={form.name} onChange={e=>set('name', e.target.value)} required />

      <div className="row">
        <div style={{flex:1}}>
          <div className="label">País</div>
          <input className="input" value={form.address.country} onChange={e=>set('address.country', e.target.value)} />
        </div>
        <div style={{flex:1}}>
          <div className="label">Provincia</div>
          <input className="input" value={form.address.province} onChange={e=>set('address.province', e.target.value)} />
        </div>
        <div style={{flex:1}}>
          <div className="label">Localidad</div>
          <input className="input" value={form.address.city} onChange={e=>set('address.city', e.target.value)} />
        </div>
      </div>

      <div className="label">Fijar en el mapa (clic para seleccionar ubicación)</div>
      <div style={{height:300}} className="card">
        <MapContainer center={[form.lat, form.lng]} zoom={12} scrollWheelZoom style={{height:'100%'}}>
          <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={[form.lat, form.lng]} />
          <ClickPicker onPick={({lat,lng})=>{ set('lat', lat); set('lng', lng) }} />
        </MapContainer>
      </div>
      <div className="row">
        <div style={{flex:1}}>
          <div className="label">Lat</div>
          <input className="input" value={form.lat} onChange={e=>set('lat', Number(e.target.value||0))} />
        </div>
        <div style={{flex:1}}>
          <div className="label">Lng</div>
          <input className="input" value={form.lng} onChange={e=>set('lng', Number(e.target.value||0))} />
        </div>
        <div style={{flex:1}}>
          <div className="label">Aforo (obligatorio)</div>
          <input className="input" type="number" min="1" value={form.capacity} onChange={e=>set('capacity', Number(e.target.value||0))} required />
        </div>
      </div>

      <div className="row">
        <div style={{flex:1}}>
          <div className="label">Instagram (obligatorio)</div>
          <input className="input" value={form.links.instagram} onChange={e=>set('links.instagram', e.target.value)} required />
        </div>
        <div style={{flex:1}}>
          <div className="label">Facebook</div>
          <input className="input" value={form.links.facebook} onChange={e=>set('links.facebook', e.target.value)} />
        </div>
        <div style={{flex:1}}>
          <div className="label">Website</div>
          <input className="input" value={form.links.website} onChange={e=>set('links.website', e.target.value)} />
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

      <div className="row" style={{justifyContent:'end'}}>
        <button type="button" className="btn ghost small" onClick={onCancel}>Cancelar</button>
        <button className="btn small">Guardar</button>
      </div>
    </form>
  )
}
