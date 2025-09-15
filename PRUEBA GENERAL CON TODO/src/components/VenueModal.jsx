
export default function VenueModal({venue, onClose, onGoToArtists}){
  if(!venue) return null;
  const showWhatsapp = !(venue.contact?.hideWhatsapp)
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h2 style={{margin:0}}>{venue.name}</h2>
          <button className="btn ghost" onClick={onClose}>Cerrar</button>
        </div>
        <div style={{display:'grid', gap:8, marginTop:14}}>
          <div><span className="badge">Ubicación</span> {venue.address?.city||'—'}, {venue.address?.province||'—'}, {venue.address?.country||'—'}</div>
          <div><span className="badge">Aforo</span> {venue.capacity||'—'}</div>
          {venue.genres?.length>0 && <div><span className="badge">Géneros habituales</span> {venue.genres.join(', ')}</div>}
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {venue.links?.instagram && <a className="btn ghost" href={venue.links.instagram} target="_blank" rel="noreferrer">Instagram</a>}
            {venue.links?.facebook && <a className="btn ghost" href={venue.links.facebook} target="_blank" rel="noreferrer">Facebook</a>}
            {venue.links?.website && <a className="btn ghost" href={venue.links.website} target="_blank" rel="noreferrer">Website</a>}
            {venue.contact?.email && <a className="btn ghost" href={`mailto:${venue.contact.email}`}>Email</a>}
            {showWhatsapp && venue.contact?.whatsapp && <a className="btn" href={`https://wa.me/${venue.contact.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>}
          </div>
        </div>

        <div style={{display:'flex', gap:10, marginTop:16}}>
          <button className="btn" onClick={onGoToArtists}>Artistas que tocaron aquí</button>
        </div>
      </div>
    </div>
  )
}
