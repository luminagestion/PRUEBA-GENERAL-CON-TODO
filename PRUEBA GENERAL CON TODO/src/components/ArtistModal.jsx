
export default function ArtistModal({artist, onClose, onGoToVenues}){
  if(!artist) return null;
  const showWhatsapp = !(artist.contact?.hideWhatsapp)
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h2 style={{margin:0}}>{artist.name}</h2>
          <button className="btn ghost" onClick={onClose}>Cerrar</button>
        </div>

        <div style={{display:'grid', gap:8, marginTop:14}}>
          <div style={{display:'flex', gap:14, alignItems:'center'}}>
            {artist.photo && <img src={artist.photo} alt="" style={{width:90,height:90,objectFit:'cover', borderRadius:12}}/>}
            <div>
              <div><span className="badge">Géneros</span> {(artist.genres||[]).join(', ')||'—'}</div>
              <div><span className="badge">Ciudad</span> {artist.city || '—'}</div>
            </div>
          </div>
          {artist.bio && <p style={{color:'var(--muted)'}}>{artist.bio}</p>}
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            {artist.links?.website && <a className="btn ghost" href={artist.links.website} target="_blank" rel="noreferrer">Website</a>}
            {artist.links?.instagram && <a className="btn ghost" href={artist.links.instagram} target="_blank" rel="noreferrer">Instagram</a>}
            {artist.links?.spotify && <a className="btn ghost" href={artist.links.spotify} target="_blank" rel="noreferrer">Spotify</a>}
            {artist.links?.youtube && <a className="btn ghost" href={artist.links.youtube} target="_blank" rel="noreferrer">YouTube</a>}
            {artist.links?.tiktok && <a className="btn ghost" href={artist.links.tiktok} target="_blank" rel="noreferrer">TikTok</a>}
            {artist.contact?.email && <a className="btn ghost" href={`mailto:${artist.contact.email}`}>Email</a>}
            {showWhatsapp && artist.contact?.whatsapp && <a className="btn" href={`https://wa.me/${artist.contact.whatsapp}`} target="_blank" rel="noreferrer">WhatsApp</a>}
          </div>
        </div>

        <div style={{display:'flex', gap:10, marginTop:16}}>
          <button className="btn" onClick={onGoToVenues}>Venues donde se presentó</button>
        </div>
      </div>
    </div>
  )
}
