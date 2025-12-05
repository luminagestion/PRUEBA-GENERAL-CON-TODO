import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient.js";

// --- Helpers para legacy localStorage (artists) ---

const ARTISTS_KEY = "artists";

function safeParse(json) {
  try {
    const data = JSON.parse(json);
    if (Array.isArray(data)) return data;
    return [];
  } catch {
    return [];
  }
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
  const { user, loading } = useAuth();

  const [artists, setArtists] = useState([]);
  const [venues, setVenues] = useState([]);
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (loading) return; // todavía resolviendo auth
    if (!user) {
      setArtists([]);
      setVenues([]);
      setLoadingData(false);
      return;
    }

    let cancelled = false;

    async function loadData() {
      try {
        setError(null);
        setLoadingData(true);

        // 1) VENUES DESDE SUPABASE (los del usuario logueado)
        const { data: venuesDb, error: venuesError } = await supabase
          .from("venues")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (venuesError) throw venuesError;

        // 2) ARTISTS DESDE LOCALSTORAGE (por ahora, hasta migrar tabla artists)
        const artistsRaw = localStorage.getItem(ARTISTS_KEY);
        const allArtists = safeParse(artistsRaw);

        const myArtists = allArtists.filter(
          (a) =>
            a.ownerId === user.id ||
            a.ownerEmail === user.email ||
            a.owner_email === user.email
        );

        if (!cancelled) {
          setVenues(venuesDb || []);
          setArtists(myArtists);
        }
      } catch (err) {
        console.error("Error cargando MyContent:", err);
        if (!cancelled) {
          setError("No se pudo cargar tu contenido. Probá recargar la página.");
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  // --- Estados de UI ---

  if (loading || loadingData) {
    return (
      <div className="page my-content-page">
        <h1>Mis venues y artistas</h1>
        <p>Cargando tu contenido…</p>
      </div>
    );
  }

  if (!user) {
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

      {error && <div className="alert error" style={{ marginBottom: 16 }}>{error}</div>}

      {/* VENUES (Supabase) */}
      <section className="my-section">
        <h2>Mis venues</h2>
        {venues.length === 0 ? (
          <p>No tenés venues cargados todavía.</p>
        ) : (
          <ul className="my-grid">
            {venues.map((venue) => (
              <li key={venue.id} className="my-item-card">
                <div className="my-item-info">
                  <h3>{venue.name || "Sin nombre"}</h3>

                  {venue.country && (
                    <p className="my-meta">País: {venue.country}</p>
                  )}

                  {venue.city && (
                    <p className="my-meta">Ciudad: {venue.city}</p>
                  )}

                  {venue.capacity != null && venue.capacity !== "" && (
                    <p className="my-meta">Capacidad: {venue.capacity}</p>
                  )}

                  {venue.predominant_genre && (
                    <p className="my-meta">
                      Género predominante: {venue.predominant_genre}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ARTISTAS (por ahora legacy localStorage) */}
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
                    {Array.isArray(artist.genres) && artist.genres.length > 0 && (
                      <p className="my-meta">
                        Géneros: {artist.genres.join(", ")}
                      </p>
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
