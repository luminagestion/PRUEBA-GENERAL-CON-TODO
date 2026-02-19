import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";


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
 const { user, loading } = useAuth();


  const [artists, setArtists] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Cargar VENUES desde Supabase (SOLO del usuario logueado)
  useEffect(() => {
  async function loadVenues() {
    try {
      setLoadingVenues(true);
      setError(null);

      const { data: authData, error: authErr } = await supabase.auth.getUser();
      const user = authData?.user;

      if (authErr || !user) {
        setVenues([]);
        return;
      }

      // 1) chequear rol
      const { data: roleRow, error: roleErr } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (roleErr) throw roleErr;

      const isAdmin = roleRow?.role === "admin";

      // 2) query venues
      let q = supabase.from("venues").select("*").order("created_at", { ascending: false });

      if (!isAdmin) {
        q = q.eq("user_id", user.id);
      }

      const { data, error: dbError } = await q;
      if (dbError) throw dbError;

      setVenues(data || []);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar las venues.");
    } finally {
      setLoadingVenues(false);
    }
  }

  loadVenues();
}, []);


  // ✅ BORRAR venue por ID (con confirmación + check de permisos)
  const handleDeleteVenue = async (venueId) => {
    const venue = venues.find((v) => v.id === venueId);

    if (
      !window.confirm(`¿Eliminar la venue "${venue?.name || "sin nombre"}"?`)
    ) {
      return;
    }

    const { data: deleted, error: delError } = await supabase
      .from("venues")
      .delete()
      .eq("id", venueId)
      .select("id"); // importante para saber si borró realmente

    if (delError) {
      console.error("Error borrando venue:", delError);
      alert("No se pudo borrar (permiso o error).");
      return;
    }

    // Si RLS bloquea, suele volver deleted vacío
    if (!deleted || deleted.length === 0) {
      alert("No tenés permisos para borrar este venue.");
      return;
    }

    setVenues((prev) => prev.filter((v) => v.id !== venueId));
  };

  // Cargar ARTISTS desde Supabase (solo del usuario logueado)
useEffect(() => {
  async function loadArtists() {
    try {
      setLoadingArtists(true);

      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        setArtists([]);
        return;
      }

      const { data, error } = await supabase
        .from("artists")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setArtists(data || []);
    } catch (err) {
      console.error("Error cargando artistas:", err);
    } finally {
      setLoadingArtists(false);
    }
  }

  loadArtists();
}, []);

  // ✅ EDIT venue
  function handleEditVenue(venueId) {
    navigate(`/edit-venue/${venueId}`);
  }

  // ✅ EDIT artist
  function handleEditArtist(index) {
    const artist = artists[index];
    navigate(`/edit-artist/${artist.id}`);
  }

  // ✅ DELETE artist (localStorage)
  function handleDeleteArtist(index) {
    const artist = artists[index];
    if (!artist) return;

    if (
      !window.confirm(`¿Eliminar el artista "${artist.name || "sin nombre"}"?`)
    ) {
      return;
    }

    try {
      const raw = localStorage.getItem(ARTISTS_KEY);
      const arr = safeParse(raw).filter(
        (a) => a.id !== artist.id && a.name !== artist.name
      );
      localStorage.setItem(ARTISTS_KEY, JSON.stringify(arr));
    } catch (err) {
      console.error("Error actualizando localStorage de artists:", err);
    }

    setArtists((prev) => prev.filter((_, i) => i !== index));
  }

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

      {error && (
        <div className="alert error" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* VENUES */}
      <section className="my-section">
        <h2>Mis venues</h2>

        {loadingVenues ? (
          <p>Cargando venues…</p>
        ) : venues.length === 0 ? (
          <p>No hay venues cargadas todavía.</p>
        ) : (
          <ul className="my-grid">
            {venues.map((venue) => (
              <li key={venue.id} className="my-item-card">
                <div className="my-item-info">
                  <h3>{venue.name || "Sin nombre"}</h3>

                  {venue.country && (
                    <p className="my-meta">País: {venue.country}</p>
                  )}

                  {venue.capacity != null && (
                    <p className="my-meta">Capacidad: {venue.capacity}</p>
                  )}

                  {venue.predominant_genre && (
                    <p className="my-meta">
                      Género predominante: {venue.predominant_genre}
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
                    onClick={() => handleEditVenue(venue.id)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="btn ghost small"
                    onClick={() => handleDeleteVenue(venue.id)}
                  >
                    Eliminar
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
          <p>No hay artistas cargados todavía.</p>
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
                      {genresText && (
                        <p className="my-meta">Géneros: {genresText}</p>
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
