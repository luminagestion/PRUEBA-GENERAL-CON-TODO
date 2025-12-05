import { useEffect, useState } from "react";
import { getSession } from "../lib/session.js";

// Claves base para localStorage
const ARTISTS_KEY_BASE = "artists";
const VENUES_KEY_BASE = "venues";

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

  // 🔑 Sufijo por usuario (id o email)
  const userKeySuffix =
    session?.user?.id || session?.user?.email || "anon";

  // Claves por usuario
  const ARTISTS_KEY = `${ARTISTS_KEY_BASE}_${userKeySuffix}`;
  const VENUES_KEY = `${VENUES_KEY_BASE}_${userKeySuffix}`;

  // Helpers para guardar siempre en localStorage
  const updateVenues = (updater) => {
    setVenues((prev) => {
      const next =
        typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem(VENUES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const updateArtists = (updater) => {
    setArtists((prev) => {
      const next =
        typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem(ARTISTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (!session) return;

    // Leemos desde localStorage PER USUARIO
    const artistsRaw = localStorage.getItem(ARTISTS_KEY);
    const venuesRaw = localStorage.getItem(VENUES_KEY);

    const loadedArtists = safeParse(artistsRaw);
    const loadedVenues = safeParse(venuesRaw);

    // Limpiamos duplicados
    setArtists(uniqueById(loadedArtists));
    setVenues(uniqueById(loadedVenues));
  }, [session, ARTISTS_KEY, VENUES_KEY]);

  // ⚠️ Si no hay sesión, mensaje
  if (!session) {
    return (
      <div className="page my-content-page">
        <h1>Mis venues y artistas</h1>
        <p>Tenés que iniciar sesión para ver tu contenido.</p>
      </div>
    );
  }

  // 🗑 BORRAR venue por índice
  const handleDeleteVenue = (index) => {
    updateVenues((prev) => prev.filter((_, i) => i !== index));
  };

  // ✏️ EDITAR venue con prompts simples
  const handleEditVenue = (index) => {
    updateVenues((prev) => {
      const copy = [...prev];
      const current = copy[index] || {};

      const name = window.prompt(
        "Nombre del venue",
        current.name || ""
      );
      if (name === null) return prev;

      const city = window.prompt(
        "Ciudad",
        current.city || ""
      );
      if (city === null) return prev;

      const capacity = window.prompt(
        "Capacidad",
        current.capacity || ""
      );
      if (capacity === null) return prev;

      copy[index] = {
        ...current,
        name,
        city,
        capacity,
      };

      return copy;
    });
  };

  // 🗑 BORRAR artista por índice
  const handleDeleteArtist = (index) => {
    updateArtists((prev) => prev.filter((_, i) => i !== index));
  };

  // ✏️ EDITAR artista con prompts simples
  const handleEditArtist = (index) => {
    updateArtists((prev) => {
      const copy = [...prev];
      const current = copy[index] || {};

      const name = window.prompt(
        "Nombre del artista",
        current.name || ""
      );
      if (name === null) return prev;

      const genre = window.prompt(
        "Género",
        current.genre || ""
      );
      if (genre === null) return prev;

      const city = window.prompt(
        "Ciudad",
        current.city || ""
      );
      if (city === null) return prev;

      copy[index] = {
        ...current,
        name,
        genre,
        city,
      };

      return copy;
    });
  };

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
                (venue.name &&
                  venue.city &&
                  `${venue.name}|${venue.city}`) ||
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
                      <p className="my-meta">
                        Capacidad: {venue.capacity}
                      </p>
                    )}
                  </div>

                  <div className="my-item-actions">
                    <button onClick={() => handleEditVenue(index)}>
                      Editar
                    </button>
                    <button onClick={() => handleDeleteVenue(index)}>
                      Borrar
                    </button>
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

                  <div className="my-item-actions">
                    <button onClick={() => handleEditArtist(index)}>
                      Editar
                    </button>
                    <button onClick={() => handleDeleteArtist(index)}>
                      Borrar
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
