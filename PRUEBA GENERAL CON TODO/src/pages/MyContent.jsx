import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getSession } from "../lib/session.js";

// Claves de localStorage
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
  const navigate = useNavigate();
  const [session] = useState(getSession());
  const [artists, setArtists] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos
  useEffect(() => {
    if (!session) {
      setLoadingVenues(false);
      setLoadingArtists(false);
      return;
    }

    const loadVenues = async () => {
      try {
        setLoadingVenues(true);

        // 1) Venues desde Supabase
        const { data: dbVenues, error: dbError } = await supabase
          .from("venues")
          .select("*")
          .eq("user_id", session.id)
          .order("created_at", { ascending: false });

        if (dbError) throw dbError;

        let merged = dbVenues || [];

        // 2) Venues legacy desde localStorage (si hubiera)
        try {
          const raw = localStorage.getItem(VENUES_KEY);
          const legacyAll = safeParse(raw);
          const legacyMine = legacyAll.filter(
            (v) =>
              v.ownerId === session.id ||
              v.ownerEmail === session.email
          );
          merged = uniqueById([...(dbVenues || []), ...legacyMine]);
        } catch {
          // si falla, ignoramos
        }

        setVenues(merged);
      } catch (err) {
        console.error("Error cargando venues:", err);
        setError("No se pudieron cargar tus venues.");
      } finally {
        setLoadingVenues(false);
      }
    };

    const loadArtists = () => {
      try {
        const raw = localStorage.getItem(ARTISTS_KEY);
        const all = safeParse(raw);

        const mine = all.filter(
          (a) =>
            a.ownerId === session.id ||
            a.ownerEmail === session.email
        );

        setArtists(uniqueById(mine));
      } catch (err) {
        console.error("Error cargando artistas:", err);
      } finally {
        setLoadingArtists(false);
      }
    };

    loadVenues();
    loadArtists();
  }, [session]);

  // --- Handlers VENUES ---

  function handleEditVenue(index) {
    const venue = venues[index];
    if (!venue) return;
    console.log("Editar venue desde MyContent (por ahora solo navega):", venue);
    // Más adelante podemos pasar un ID por query para prellenar el formulario
    navigate("/add-venue");
  }

  async function handleDeleteVenue(index) {
    const venue = venues[index];
    if (!venue) return;

    if (!window.confirm("¿Eliminar este venue?")) return;

    try {
      // 1) Borrar en Supabase si tiene id
      if (venue.id) {
        const { error: delError } = await supabase
          .from("venues")
          .delete()
          .eq("id", venue.id)
          .eq("user_id", session?.id ?? null);

        if (delError) throw delError;
      }

      // 2) Limpiar de localStorage (legacy)
      try {
        const raw = localStorage.getItem(VENUES_KEY);
        if (raw) {
          const arr = safeParse(raw).filter(
            (v) => v.id !== venue.id && v.name !== venue.name
          );
          localStorage.setItem(VENUES_KEY, JSON.stringify(arr));
        }
      } catch {
        // si falla, no rompemos la app
      }

      // 3) Actualizar estado
      setVenues((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Error al eliminar venue:", err);
      alert("No se pudo eliminar el venue.");
    }
  }

  // --- Handlers ARTISTS ---

  function handleEditArtist(index) {
    const artist = artists[index];
    if (!artist) return;
    console.log("Editar artista desde MyContent (por ahora solo navega):", artist);
    navigate("/add-artist");
  }

  function handleDeleteArtist(index) {
    const artist = artists[index];
    if (!artist) return;

    if (!window.confirm("¿Eliminar este artista/proyecto?")) return;

    try {
      const raw = localStorage.getItem(ARTISTS_KEY);
      const arr = safeParse(raw).filter(
        (a) => a.id !== artist.id && a.name !== artist.name
      );
      localStorage.setItem(ARTISTS_KEY, JSON.stringify(arr));
    } catch {
      // ignoramos errores de localStorage
    }

    setArtists((prev) => prev.filter((_, i) => i !== index));
  }

  // --- UI ---

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

      {error && <div className="alert error">{error}</div>}

      {/* VENUES */}
      <section className="my-section">
        <h2>Mis venues</h2>
        {loadingVenues ? (
          <p>Cargando venues…</p>
        ) : venues.length === 0 ? (
          <p>No tenés venues cargados todavía.</p>
        ) : (
          <ul className="my-grid">
            {venues.map((venue, index) => (
              <li key={venue.id ?? index} className="my-item-card">
                <div className="my-item-info">
                  <h3>{venue.name || "Sin nombre"}</h3>
                  {venue.country && (
                    <p className="my-meta">País: {venue.country}</p>
                  )}
                  {(venue.capacity || venue.capacidad) && (
                    <p className="my-meta">
                      Capacidad: {venue.capacity ?? venue.capacidad}
                    </p>
                  )}
                  {(venue.predominant_genre || venue.predominantGenre) && (
                    <p className="my-meta">
                      Género predominante:{" "}
                      {venue.predominant_genre ?? venue.predominantGenre}
                    </p>
                  )}
                </div>

                <div className="my-item-actions">
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
                    Borrar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ARTISTAS */}
      <section className="my-section">
        <h2>Mis artistas</h2>
        {loadingArtists ? (
          <p>Cargando artistas…</p>
        ) : artists.length === 0 ? (
          <p>No tenés artistas cargados todavía.</p>
        ) : (
          <ul className="my-grid">
            {artists.map((artist, index) => {
              const img = getImage(artist);
              const genresText =
                Array.isArray(artist.genres) && artist.genres.length > 0
                  ? artist.genres.join(", ")
                  : artist.genre || "";

              return (
                <li key={artist.id ?? index} className="my-item-card">
                  {img && (
                    <div className="my-item-thumb">
                      <img src={img} alt={artist.name || "Artista"} />
                    </div>
                  )}

                  <div className="my-item-info">
                    <h3>{artist.name || "Sin nombre"}</h3>
                    {genresText && (
                      <p className="my-meta">Géneros: {genresText}</p>
                    )}
                    {artist.city && (
                      <p className="my-meta">Ciudad: {artist.city}</p>
                    )}
                  </div>

                  <div className="my-item-actions">
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
