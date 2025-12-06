import { useEffect, useState } from "react";
import { getSession } from "../lib/session.js";

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
    item.photoDataUrl ||
    null
  );
}

export default function MyContent() {
  const [session] = useState(getSession());
  const [artists, setArtists] = useState([]);
  const [venues, setVenues] = useState([]);

  // Carga inicial desde localStorage
  useEffect(() => {
    const artistsRaw = localStorage.getItem(ARTISTS_KEY);
    const venuesRaw = localStorage.getItem(VENUES_KEY);

    const loadedArtists = safeParse(artistsRaw);
    const loadedVenues = safeParse(venuesRaw);

    setArtists(uniqueById(loadedArtists));
    setVenues(uniqueById(loadedVenues));
  }, []);

  // Helpers para guardar cambios en localStorage
  function persistVenues(next) {
    localStorage.setItem(VENUES_KEY, JSON.stringify(next));
    setVenues(next);
  }

  function persistArtists(next) {
    localStorage.setItem(ARTISTS_KEY, JSON.stringify(next));
    setArtists(next);
  }

  // --- VENUES: borrar / editar ---------------------------------------------

  function handleDeleteVenue(index) {
    const venue = venues[index];
    if (!venue) return;

    if (!window.confirm(`¿Eliminar la venue "${venue.name || "sin nombre"}"?`)) {
      return;
    }

    const next = venues.filter((_, i) => i !== index);
    persistVenues(next);
  }

  function handleEditVenue(index) {
    // Por ahora solo redirige al formulario de agregar venue.
    // En una próxima iteración podemos pre-cargar el formulario.
    const venue = venues[index];
    console.log("Editar venue desde MyContent (pendiente flujo completo):", venue);
    window.location.href = "/add-venue";
  }

  // --- ARTISTAS: borrar / editar -------------------------------------------

  function handleDeleteArtist(index) {
    const artist = artists[index];
    if (!artist) return;

    if (!window.confirm(`¿Eliminar el artista "${artist.name || "sin nombre"}"?`)) {
      return;
    }

    const next = artists.filter((_, i) => i !== index);
    persistArtists(next);
  }

  function handleEditArtist(index) {
    // Igual que venues: de momento redirigimos al directorio / formulario.
    const artist = artists[index];
    console.log("Editar artista desde MyContent (pendiente flujo completo):", artist);
    window.location.href = "/add-artist";
  }

  // Si no hay sesión, mensaje básico
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

      {/* VENUES ------------------------------------------------------------- */}
      <section className="my-section">
        <h2>Mis venues</h2>
        {venues.length === 0 ? (
          <p>No tenés venues cargados todavía.</p>
        ) : (
          <ul className="my-grid">
            {venues.map((venue, index) => {
              const key =
                venue.id ||
                venue._id ||
                venue.slug ||
                (venue.name && venue.city && `${venue.name}|${venue.city}`) ||
                index;

              return (
                <li key={key} className="my-item-card">
                  <div className="my-item-info">
                    <h3>{venue.name || "Sin nombre"}</h3>
                    {venue.country && (
                      <p className="my-meta">País: {venue.country}</p>
                    )}
                    {venue.capacity && (
                      <p className="my-meta">Capacidad: {venue.capacity}</p>
                    )}
                    {venue.predominantGenre && (
                      <p className="my-meta">
                        Género predominante: {venue.predominantGenre}
                      </p>
                    )}
                  </div>

                  <div
                    className="my-item-actions"
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 8,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => handleEditVenue(index)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn ghost small"
                      onClick={() => handleDeleteVenue(index)}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* ARTISTAS ----------------------------------------------------------- */}
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
                  <div style={{ display: "flex", gap: 12 }}>
                    {img && (
                      <div className="my-item-thumb">
                        <img
                          src={img}
                          alt={artist.name || "Artista"}
                          style={{
                            width: 72,
                            height: 72,
                            objectFit: "cover",
                            borderRadius: 12,
                          }}
                        />
                      </div>
                    )}

                    <div className="my-item-info">
                      <h3>{artist.name || "Sin nombre"}</h3>
                      {Array.isArray(artist.genres) &&
                        artist.genres.length > 0 && (
                          <p className="my-meta">
                            Géneros: {artist.genres.join(", ")}
                          </p>
                        )}
                      {artist.city && (
                        <p className="my-meta">Ciudad: {artist.city}</p>
                      )}
                    </div>
                  </div>

                  <div
                    className="my-item-actions"
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 8,
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => handleEditArtist(index)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="btn ghost small"
                      onClick={() => handleDeleteArtist(index)}
                    >
                      Eliminar
                    </button>
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
