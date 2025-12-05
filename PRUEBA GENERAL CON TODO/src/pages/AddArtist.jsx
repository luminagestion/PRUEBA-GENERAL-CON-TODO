import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";

const GENRES = [
  "Rock",
  "Rock alternativo",
  "Metal",
  "Hard rock",
  "Indie",
  "Folk",
  "Country",
  "Pop",
  "Reaggueton",
  "Rap",
  "Trap",
  "Hip hop",
  "Musica tropical",
  "Tango",
  "Candombe",
  "Techno",
  "Instrumental",
  "Infantil",
  "Religiosa",
  "Milonga",
  "Canto popular",
  "Folklore",
];

// Redimensiona la imagen antes de guardarla
async function resizeImage(file, maxSize = 1500) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = dataUrl;
  });

  const { width, height } = img;
  const maxDim = Math.max(width, height);
  if (maxDim <= maxSize) {
    return dataUrl;
  }

  const scale = maxSize / maxDim;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export default function AddArtist() {
  const nav = useNavigate();
  const { user, session, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    members: "",
    genres: [],
    photo: "",
    bio: "",
    instagram: "",
    youtube: "",
    spotify: "",
    email: "",
    whatsapp: "",
    city: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      nav("/login");
    }
  }, [loading, user, nav]);

  if (loading || !user) return null;

  const userId = user?.id || session?.user?.id;

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file, 1500);
      updateField("photo", resized);
    } catch (err) {
      console.error(err);
      setError("No se pudo procesar la imagen");
    }
  }

  function handleGenresChange(e) {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    updateField("genres", selected);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!form.name) throw new Error("El nombre es obligatorio");

      const { error: insertError } = await supabase.from("artists").insert({
        user_id: userId,
        name: form.name.trim(),
        members: Number(form.members) || 1,
        genres: form.genres,
        photo: form.photo,
        bio: form.bio,
        instagram: form.instagram,
        youtube: form.youtube,
        spotify: form.spotify,
        email: form.email,
        whatsapp: form.whatsapp,
        city: form.city,
      });

      if (insertError) throw insertError;

      nav("/artists");
    } catch (err) {
      setError(err.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  const cardStyle = {
    display: "grid",
    gap: 12,
    padding: 16,
    background: "var(--surface, rgba(255,255,255,0.06))",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
  };

  const inputStyle = {
    background: "#2a2630",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 10,
    padding: "10px 12px",
  };

  return (
    <div className="page add-artist" style={{ maxWidth: 680, margin: "24px auto" }}>
      <h2>Agregar proyecto / artista</h2>

      <form onSubmit={handleSubmit} className="card" style={cardStyle}>
        <label>
          <span>Nombre*</span>
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            style={inputStyle}
          />
        </label>

        <label>
          <span>Cantidad de integrantes</span>
          <input
            type="number"
            min="1"
            value={form.members}
            onChange={(e) => updateField("members", e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <span>Género(s)</span>
          <select
            multiple
            value={form.genres}
            onChange={handleGenresChange}
            style={{ ...inputStyle, minHeight: 140 }}
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Foto</span>
          <input type="file" accept="image/*" onChange={handlePhoto} />
          {form.photo && (
            <img src={form.photo} alt="preview" style={{ maxWidth: 200, marginTop: 8 }} />
          )}
        </label>

        <label>
          <span>Bio</span>
          <textarea
            rows={5}
            value={form.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <span>Ciudad</span>
          <input
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <span>Instagram</span>
          <input
            value={form.instagram}
            onChange={(e) => updateField("instagram", e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <span>Youtube</span>
          <input
            value={form.youtube}
            onChange={(e) => updateField("youtube", e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <span>Spotify</span>
          <input
            value={form.spotify}
            onChange={(e) => updateField("spotify", e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          <span>WhatsApp</span>
          <input
            value={form.whatsapp}
            onChange={(e) => updateField("whatsapp", e.target.value)}
            style={inputStyle}
          />
        </label>

        {error && <div className="alert error">{error}</div>}

        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </div>
  );
}
