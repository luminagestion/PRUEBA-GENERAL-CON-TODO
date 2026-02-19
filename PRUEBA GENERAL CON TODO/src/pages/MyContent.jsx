import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function MyContent() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [venues, setVenues] = useState([]);
  const [artists, setArtists] = useState([]);

  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Estado de sesión (evita bug en incógnito)
  if (loading) {
    return (
      <div className="page my-content-page">
        <h1>Mis venues y artistas</h1>
        <p>Cargando sesión…</p>
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

  // ✅ Cargar datos del usuario logueado
  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        setError(null);

        setLoadingVenues(true);
        const { data: venuesData, error: venuesErr } = await supabase
          .from("venues")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (venuesErr) throw venuesErr;

        if (!cancelled) setVenues(venuesData || []);
        setLoadingVenues(false);

        setLoadingArtists(true);
        const { data: artistsData, error: artistsErr } = await supabase
          .from("artists")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (artistsErr) throw artistsErr;

        if (!cancelled) setArtists(artistsData || []);
        setLoadingArtists(false);
      } catch (err) {
        console.error("Error cargando contenido:", err);
        if (!cancelled) setError(err.message || "Error cargando contenido");
        setLoadingVenues(false);
        setLoadingArtists(false);
      }
    }

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // ✅ Edit Venue
  function handleEditVenue(venueId) {
    navigate(`/edit-venue/${venueId}`);
  }

  // ✅ Delete Venue (por id real)
  async function handleDeleteVenue(venueId) {
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
      .select("id");

    if (delError) {
      console.error("Error borrando venue:", delError);
      alert("No se pudo borrar (permiso o error).");
      return;
    }

    if (!deleted || deleted.length === 0) {
      alert("No tenés permisos para borrar este venue.");
      return;
    }

    setVenues((prev) => prev.filter((v) => v.id !== venueId));
  }

  // ✅ Edit Artist
  function handleEditArtist(artistId) {
    navigate(`/edit-artist/${artistId}`);
  }

  // ✅ Delete Artist (por id real)
  async function handleDeleteArtist(artistId) {
    const artist = artists.find((a) => a.id === artistId);

    if (
      !window.confirm(`¿Eliminar el artista "${artist?.name || "sin nombre"}"?`)
    ) {
      return;
    }

    const { data: deleted, error: delError } = await supabase
      .from("artists")
      .delete()
      .eq("id", artistId)
      .select("id");

    if (delError) {
      console.error("Error borrando artist:", delError);
      alert("No se pudo borrar (permiso o error).");
      return;
    }

    if (!deleted || deleted.length === 0) {
      alert("No tenés permisos para borrar este artista.");
      return;
    }

    setArtists((prev) => prev.filter((a) => a.id !== artistId));
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
                  {venue.country && <p className="my-meta">País: {venue.country}</p>}
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

      {/* ARTISTS */}
      <section className="my-section">
        <h2>Mis artistas</h2>

        {loadingArtists ? (
          <p>Cargando artistas…</p>
        ) : artists.length === 0 ? (
          <p>No hay artistas cargados todavía.</p>
        ) : (
          <ul className="my-grid">
            {artists.map((artist) => (
              <li key={artist.id} className="my-item-card">
                <div className="my-item-info">
                  <h3>{artist.name || "Sin nombre"}</h3>
                  {artist.city && <p className="my-meta">Ciudad: {artist.city}</p>}
                  {Array.isArray(artist.genres) && artist.genres.length > 0 && (
                    <p className="my-meta">Géneros: {artist.genres.join(", ")}</p>
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
                    onClick={() => handleEditArtist(artist.id)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn ghost small"
                    onClick={() => handleDeleteArtist(artist.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
