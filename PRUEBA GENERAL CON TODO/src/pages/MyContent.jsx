import { useEffect, useState } from "react";
import { getSession } from "../lib/session.js";

// Claves donde vamos a leer lo que guardaste en localStorage.
// Si en tu proyecto se llaman distinto, podés cambiar estos nombres.
const ARTISTS_KEY = "artists";
const VENUES_KEY = "venues";

function safeParse(json) {
  try {
    const data = JSON.parse(json);
    if (Array.isArray(data)) return data;
    return [];
  } catch {
    return [];
  }
}

// Saca duplicados usando un "id lógico"
function uniqueById(items) {
  const map = new Map();

  for (const item of items || []) {
    const id =
      item.id ||
      item._id ||
      item.slug ||
      (item.name && item.city && `${item.name}|${item.city}`) ||
      (item.name && item.address && `${item.name}|${item.address}`) ||
      JSON.stringify(item);

    if (!map.has(id)) {
      map.set(id, item);
    }
  }

  return Array.from(map.values());
}

// Intenta encontrar alguna propiedad de imagen razonable
function getImage(item) {
  return (
    item.imageUrl ||
    item.image ||
    item.photoUrl ||
    item.photo ||
    item.thumbnail ||
    item.avatar ||
    item.logo ||
    null
  );
}

export default function MyContent() {
  const [session] = useState(getSession());
  const [artists, setArtists] = useState([]);
  const [venues, setVenues] = useState([]);

  useEffect(() => {
    // Leemos desde localStorage
    const artistsRaw = localStorage.getItem(ARTISTS_KEY);
    const venuesRaw = localStorage.getItem(VENUES_KEY);

    const loadedArtists = safeParse(artistsRaw);
    const loadedVenues = safeParse(venuesRaw);

    // 💥 Acá limpiamos duplicados
    setArtists(uniqueById(loadedArtists));
    setVenues(uniqueById(loadedVenues));
  }, []);

  if (!session) {
    return (
      <div className="page my-content-page">
        <h1>Mis venues y artistas</h1>
        <p>Tenés que iniciar sesión para ver tu contenido.</p>
      </div>
    );
  }

  return (
    <div className="page my-content-page">
      <h1>Mis venues y artistas</h1>

      {/* VENUES */}
      <section className="my-section">
        <h2>Mis venues</h2>
        {venues.length === 0 ? (
          <p>No tenés venues cargados todavía.</p>
        ) : (
          <ul className="my-grid">
            {venues.map((venue, index) => {
              const img = getImage(venue);
              const key =
                venue.id ||
                venue._id ||
                venue.slug ||
                (venue.name && venue.city && `${venue.name}|${venue.city}`) ||
                index;

              return (
                <li key={key} className="my-item-card">
                  {img && (
                    <div className="my-item-thumb">
                      <img src={img} alt={venue.name || "Venue"} />
                    </div>
                  )}

                  <div className="my-item-info">
                    <h3>{venue.name || "Sin nombre"}</h3>
                    {venue.city && (
                      <p className="my-meta">Ciudad: {venue.city}</p>
                    )}
                    {venue.capacity && (
                      <p className="my-meta">Capacidad: {venue.capacity}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ARTISTAS */}
      <section className="my-section">
        <h2>Mis artistas</h2>
        {artists.length === 0 ? (
          <p>No tenés artistas cargados todavía.</p>
        ) : (
          <ul className="my-grid">
            {artists.map((artist, index) => {
              const img = getImage(artist);
              const key =
                artist.id ||
                artist._id ||
                artist.slug ||
                (artist.name &&
                  artist.city &&
                  `${artist.name}|${artist.city}`) ||
                index;

              return (
                <li key={key} className="my-item-card">
                  {img && (
                    <div className="my-item-thumb">
                      <img src={img} alt={artist.name || "Artista"} />
                    </div>
                  )}

                  <div className="my-item-info">
                    <h3>{artist.name || "Sin nombre"}</h3>
                    {artist.genre && (
                      <p className="my-meta">Género: {artist.genre}</p>
                    )}
                    {artist.city && (
                      <p className="my-meta">Ciudad: {artist.city}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
