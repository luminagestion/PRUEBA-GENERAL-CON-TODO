import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import seed from "../data/artists.json";
import ArtistModal from "../components/ArtistModal.jsx";
import ArtistForm from "../components/ArtistForm.jsx";
import { useAuth } from "../context/AuthContext"; // 👈 usamos el contexto real

const STORAGE_KEY = "LUMINA_ARTISTS_DB";

function loadArtists() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function saveArtists(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

export default function Artists() {
  const { user } = useAuth(); // 👈 usuario logueado (Supabase)
  const [params] = useSearchParams();
  const fromVenue = params.get("fromVenue"); // venue id

  const [artists, setArtists] = useState(() => loadArtists());
  const [active, setActive] = useState(null);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState("browse");
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    saveArtists(artists);
  }, [artists]);

  const genres = useMemo(() => {
    const set = new Set();
    artists.forEach((a) => (a.genres || []).forEach((g) => set.add(g)));
    return Array.from(set).sort();
  }, [artists]);

  const cities = useMemo(() => {
    const set = new Set();
    artists.forEach((a) => a.city && set.add(a.city));
    return Array.from(set).sort();
  }, [artists]);

  const filtered = useMemo(() => {
    return artists.filter((a) => {
      const qMatch = q
        ? a.name.toLowerCase().includes(q.toLowerCase())
        : true;
      const gMatch = genre ? (a.genres || []).includes(genre) : true;
      const cMatch = city ? a.city === city : true;
      const vMatch = fromVenue
        ? (a.venuesPlayed || []).includes(fromVenue)
        : true;
      return qMatch && gMatch && cMatch && vMatch;
    });
  }, [q, genre, city, fromVenue, artists]);

  // 🔐 Solo el dueño puede editar
  function updateArtist(a) {
    if (!user || user.id !== a.ownerId) {
      alert("Solo podés editar tus propios proyectos.");
      return;
    }
    setArtists((prev) => prev.map((x) => (x.id === a.id ? a : x)));
    setEditing(null);
    setView("browse");
  }

  // 🔐 Solo el dueño puede borrar
  function removeArtist(id) {
    const item = artists.find((x) => x.id === id);
    if (!user || user.id !== item?.ownerId) {
      alert("Solo podés eliminar tus propios proyectos.");
      return;
    }
    if (confirm("¿Eliminar proyecto?")) {
      setArtists((prev) => prev.filter((x) => x.id !== id));
    }
  }

  return (
    <main className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
        }}
      >
        <h1 style={{ margin: "8px 0" }}>Directorio de Artistas</h1>
        <div className="row">
          <a className="btn small" href="/add-artist">
            Agregar
          </a>
        </div>
      </div>

      {view === "browse" && (
        <>
          <div className="row" style={{ margin: "10px 0" }}>
            <input
              style={{ flex: 1 }}
              className="input"
              placeholder="Buscar por nombre..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="">Todos los géneros</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Todas las ciudades</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid">
            {filtered.map((a) => (
              <div
                key={a.id}
                className="card"
                style={{ display: "grid", gap: 10 }}
              >
                <div style={{ display: "flex", gap: 12 }}>
                  {a.photo && (
                    <img
                      src={a.photo}
                      alt=""
                      style={{
                        width: 86,
                        height: 86,
                        objectFit: "cover",
                        borderRadius: 12,
                      }}
                    />
                  )}
                  <div style={{ display: "grid", gap: 4 }}>
                    <strong>{a.name}</strong>
                    <div className="row" style={{ gap: 6 }}>
                      <span className="badge">
                        {(a.genres || []).join(", ") || "—"}
                      </span>
                      <span className="badge">{a.city || "—"}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="row"
                  style={{ justifyContent: "space-between" }}
                >
                  <div className="row" style={{ gap: 8 }}>
                    <button
                      className="btn small"
                      onClick={() => setActive(a)}
                    >
                      Ver ficha
                    </button>

                    {/* 👇 Botón editar solo si sos la dueña */}
                    {user && user.id === a.ownerId && (
                      <button
                        className="btn ghost small"
                        onClick={() => {
                          setEditing(a);
                          setView("edit");
                        }}
                      >
                        Editar
                      </button>
                    )}
                  </div>

                  {/* 👇 Botón eliminar solo si sos la dueña */}
                  {user && user.id === a.ownerId && (
                    <button
                      className="btn ghost small"
                      onClick={() => removeArtist(a.id)}
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {view === "edit" && editing && (
        <ArtistForm
          initial={editing}
          onSubmit={updateArtist}
          onCancel={() => {
            setEditing(null);
            setView("browse");
          }}
        />
      )}

      <ArtistModal
        artist={active}
        onClose={() => setActive(null)}
        onGoToVenues={() => {
          setActive(null);
          alert("En el mapa podés buscar los venues donde se presentó.");
        }}
      />
    </main>
  );
}
