import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    photoDataUrl: "",
    bio: "",
    instagram: "",
    youtube: "",
    spotify: "",
    email: "",
    whatsapp: "",
    hideWhatsapp: false,
    city: "",
  });

  // Si no hay usuario, mandamos al login
  useEffect(() => {
    if (!loading && !user) {
      nav("/login");
    }
  }, [loading, user, nav]);

  if (loading || !user) {
    // Mientras resuelve auth o redirigimos, no mostramos nada
    return null;
  }

  const userId = user?.id || session?.user?.id || null;
  const userEmail = user?.email || session?.user?.email || "";

  // Sufijo para guardar cosas de ESTE usuario
  const userKeySuffix = userId || userEmail || "anon";
  const USER_ARTISTS_KEY = `artists_${userKeySuffix}`;

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const resized = await resizeImage(file, 1500);
      updateField("photoDataUrl", resized);
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

      // 📌 1) BASE GENERAL (todos los artistas, para directorio, etc.)
      const STORAGE_KEY = "LUMINA_ARTISTS_DB";

      const prevRaw = localStorage.getItem(STORAGE_KEY);
      let prev = [];
      try {
        if (prevRaw) {
          const arr = JSON.parse(prevRaw);
          if (Array.isArray(arr)) prev = arr;
        }
      } catch {
        /* ignore */
      }

      const newArtist = {
        id: Date.now().toString(),
        ownerId: userId,
        ownerEmail: userEmail,
        name: form.name?.trim() || "",
        members: Number(form.members) || 1,
        genres: Array.isArray(form.genres) ? form.genres : [],
        photo: form.photoDataUrl || "",
        links: {
          instagram: form.instagram || "",
          spotify: form.spotify || "",
          youtube: form.youtube || "",
          tiktok: "",
          website: "",
        },
        contact: {
          email: form.email || "",
          whatsapp: form.whatsapp || "",
          hideWhatsapp: !!form.hideWhatsapp,
        },
        city: form.city || "",
        bio: form.bio || "",
        venuesPlayed: [],
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify([...prev, newArtist]));

      // Este formato "simplificado" es el que usan MyContent y otras partes
      const legacyArtist = {
        id: newArtist.id,
        name: newArtist.name,
        members: newArtist.members,
        genres: newArtist.genres,
        photoDataUrl: newArtist.photo,
        instagram: newArtist.links.instagram,
        youtube: newArtist.links.youtube,
        spotify: newArtist.links.spotify,
        email: newArtist.contact.email,
        whatsapp: newArtist.contact.whatsapp,
        hideWhatsapp: newArtist.contact.hideWhatsapp,
        city: newArtist.city,
        bio: newArtist.bio,
        ownerEmail: userEmail || "desconocido",
      };

      // 📌 2) COPIA GLOBAL LEGACY ("artists") – por compatibilidad
      try {
        const legacyRaw = localStorage.getItem("artists");
        const legacy = legacyRaw ? JSON.parse(legacyRaw) : [];
        localStorage.setItem(
          "artists",
          JSON.stringify([
            ...(Array.isArray(legacy) ? legacy : []),
            legacyArtist,
          ])
        );
      } catch {
        /* ignore */
      }

      // 📌 3) LISTA POR USUARIO ("artists_<user>")
      try {
        const userRaw = localStorage.getItem(USER_ARTISTS_KEY);
        let userArtists = [];
        if (userRaw) {
          const arr = JSON.parse(userRaw);
          if (Array.isArray(arr)) userArtists = arr;
        }
        userArtists.push(legacyArtist);
        localStorage.setItem(
          USER_ARTISTS_KEY,
          JSON.stringify(userArtists)
        );
      } catch {
        /* ignore */
      }

      nav("/");
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
    color: "var(--text, #fff)",
  };

  const inputStyle = {
    background: "#2a2630",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 10,
    padding: "10px 12px",
  };

  return (
    <div
      className="page add-artist"
      style={{ maxWidth: 680, margin: "24px auto" }}
    >
      <h2>Agregar proyecto / artista</h2>

      <form onSubmit={handleSubmit} className="card" style={cardStyle}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Nombre*</span>
          <input
            name="name"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Cantidad de integrantes</span>
          <input
            name="members"
            type="number"
            min="1"
            value={form.members}
            onChange={(e) => updateField("members", e.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Género(s)</span>
          <select
            multiple
            value={form.genres}
            onChange={handleGenresChange}
            style={{ ...inputStyle, minHeight: 140 }}
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <small>Usá Ctrl/Cmd para seleccionar múltiples.</small>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Foto (máx 1500px, se redimensiona si es necesario)</span>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            style={{ ...inputStyle, padding: 8 }}
          />
          {form.photoDataUrl && (
            <img
              src={form.photoDataUrl}
              alt="preview"
              style={{ maxWidth: 240, borderRadius: 12 }}
            />
          )}
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Bio</span>
          <textarea
            rows={5}
            value={form.bio}
            onChange={(e) => updateField("bio", e.target.value)}
            style={inputStyle}
          />
        </label>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 1fr",
            alignItems: "start",
          }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span>Instagram</span>
            <input
              placeholder="https://instagram.com/…"
              value={form.instagram}
              onChange={(e) => updateField("instagram", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Youtube</span>
            <input
              placeholder="https://youtube.com/…"
              value={form.youtube}
              onChange={(e) => updateField("youtube", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Spotify</span>
            <input
              placeholder="https://open.spotify.com/…"
              value={form.spotify}
              onChange={(e) => updateField("spotify", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Email de contacto</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>WhatsApp de contacto</span>
            <input
              placeholder="+54 9 …"
              value={form.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={form.hideWhatsapp}
              onChange={(e) =>
                updateField("hideWhatsapp", e.target.checked)
              }
            />
            <span>Ocultar número al público</span>
          </label>
        </div>

        {error && <div className="alert error">{error}</div>}

        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </div>
  );
}
