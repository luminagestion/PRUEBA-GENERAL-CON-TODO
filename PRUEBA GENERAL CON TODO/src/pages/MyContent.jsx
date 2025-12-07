import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { getSession } from "../lib/session.js";

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
  const [session] = useState(getSession());

  const [artists, setArtists] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(true);
  const [error, setError] = useState(null);

  // Cargar VENUES desde Supabase (TODOS, sin filtrar por usuario por ahora)
  useEffect(() => {
    async function loadVenues() {
      try {
        setLoadingVenues(true);
        setError(null);

        const { data, error: dbError } = await supabase
          .from("venues")
          .select("*")
          .order("created_at", { ascending: false });

        if (dbError) throw dbError;

        setVenues(data || []);
      } catch (err) {
        console.error("Error cargando venues:", err);
        setError("No se pudieron cargar las venues.");
      } finally {
        setLoadingVenues(false);
      }
    }

    loadVenues();
  }, []);

  // Cargar ARTISTS desde localStorage (TODOS)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ARTISTS_KEY);
      const all = safeParse(raw);
      setArtists(all);
    } catch (err) {
      console.error("Error cargando artistas:", err);
    } finally {
      setLoadingArtists(false);
    }
  }, []);

  // Handlers VENUES
  function handleEditVenue(index) {
    const venue = venues[index];
    console.log("Editar venue (solo navega por ahora):", venue);
    navigate(`/edit-venue/${venue.id}`);

  }

  async function handleDeleteVenue(index) {
    const venue = venues[index];
    if (!venue) return;

    if (!window.confirm(`¿Eliminar la venue "${venue.name || "sin nombre"}"?`)) {
      return;
    }

    try {
      if (venue.id) {
        const { error: delError } = await supabase
          .from("venues")
          .delete()
          .eq("id", venue.id);

        if (delError) throw delError;
      }

      setVenues((prev) => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Error eliminando venue:", err);
      alert("No se pudo eliminar la venue.");
    }
  }

  // Handlers ARTISTS
  function handleEditArtist(index) {
    const artist = artists[index];
    console.log("Editar artista (solo navega por ahora):", artist);
    navigate(`/edit-artist/${artist.id}`);

  }

  function handleDeleteArtist(index) {
    const artist = artists[index];
    if (!artist) return;

    if (!window.confirm(`¿Eliminar el artista "${artist.name || "sin nombre"}"?`)) {
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
