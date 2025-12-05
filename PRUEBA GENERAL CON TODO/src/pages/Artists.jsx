import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import ArtistModal from "../components/ArtistModal.jsx";
import ArtistForm from "../components/ArtistForm.jsx";
import { getSession } from "../lib/session";

export default function Artists() {
  const session = getSession();
  const [params] = useSearchParams();
  const fromVenue = params.get("fromVenue");

  const [artists, setArtists] = useState([]);
  const [active, setActive] = useState(null);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState("browse");

  const [q, setQ] = useState("");
  const [genre, setGenre] = useState("");
  const [city, setCity] = useState("");

  async function loadArtists() {
    const { data, error } = await supabase.from("artists").select("*");
    if (!error) setArtists(data);
  }

  useEffect(() => {
    loadArtists();
  }, []);

  const genres = useMemo(() => {
    const set = new Set();
    artists.forEach((a) => (a.genres || []).forEach((g) => set.add(g)));
    return [...set].sort();
  }, [artists]);

  const cities = useMemo(() => {
    const set = new Set();
    artists.forEach((a) => a.city && set.add(a.city));
    return [...set].sort();
  }, [artists]);

  const filtered = useMemo(() => {
    return artists.filter((a) => {
      const qMatch = q ? a.name.toLowerCase().includes(q.toLowerCase()) : true;
      const gMatch = genre ? (a.genres || []).includes(genre) : true;
      const cMatch = city ? a.city === city : true;
      const vMatch = fromVenue ? (a.venuesPlayed || []).includes(fromVenue) : true;
      return qMatch && gMatch && cMatch && vMatch;
    });
  }, [q, genre, city, fromVenue, artists]);

  async function updateArtist(artist) {
    if (!session || session.id !== artist.user_id)
      return alert("Solo podés editar tus propios proyectos.");

    const { error } = await supabase
      .from("artists")
      .update(artist)
      .eq("id", artist.id);

    if (!error) {
      setEditing(null);
      setView("browse");
      loadArtists();
    }
  }

  async function removeArtist(id) {
    const item = artists.find((x) => x.id === id);

    if (!session || session.id !== item?.user_id)
      return alert("Solo podés eliminar tus propios proyectos.");

    if (confirm("¿Eliminar proyecto?")) {
      await supabase.from("artists").delete().eq("id", id);
      loadArtists();
    }
  }

  return (
    <main className="container">
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Directorio de Artistas</h1>
        <a className="btn small" href="/add-artist">
          Agregar
        </a>
      </div>

      {view === "browse" && (
        <>
          <div className="row" style={{ margin: "10px 0" }}>
            <input
              style={{ flex: 1 }}
              className="input"
              placeholder="Buscar..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select value={genre} onChange={(e) => setGenre(e.target.value)}>
              <option value="">Todos los géneros</option>
              {genres.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Todas las ciudades</option>
              {cities.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid">
            {filtered.map((a) => (
              <div key={a.id} className="card" style={{ display: "grid", gap: 10 }}>
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
                  <div>
                    <strong>{a.name}</strong>
                    <div className="row" style={{ gap: 6 }}>
                      <span className="badge">{(a.genres || []).join(", ")}</span>
                      <span className="badge">{a.city || "—"}</span>
                    </div>
                  </div>
                </div>

                <div className="row" style={{ justifyContent: "space-between" }}>
                  <div className="row" style={{ gap: 8 }}>
                    <button className="btn small" onClick={() => setActive(a)}>
                      Ver ficha
                    </button>
                    {session?.id === a.user_id && (
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

                  {session?.id === a.user_id && (
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

      <ArtistModal artist={active} onClose={() => setActive(null)} />
    </main>
  );
}

