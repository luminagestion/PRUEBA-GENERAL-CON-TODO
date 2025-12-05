import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../lib/supabaseClient"; // si tu client es default, cambiá a: import supabase from "../lib/supabaseClient";

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

// Ícono SVG embebido, color Lumina
const svgPin = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
  <path fill='%23e52687' d='M16 1C9.925 1 5 5.925 5 12c0 7.5 9.2 13.6 10.6 17.1.2.5.8.9 1.4.9s1.2-.3 1.4-.9C22.8 25.6 27 19.5 27 12 27 5.925 22.075 1 16 1z'/>
  <circle cx='16' cy='12' r='5' fill='white'/>
</svg>`);

const safeIcon = L.icon({
  iconUrl: "data:image/svg+xml;utf8," + svgPin,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

function ClickToSetMarker({ onSet }) {
  useMapEvents({
    click(e) {
      onSet({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function AddVenue() {
  const nav = useNavigate();
  const { user, session, loading } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    country: "",
    lat: "",
    lng: "",
    capacity: "",
    predominantGenre: "",
    email: "",
    whatsapp: "",
    hideWhatsapp: false,
  });

  // Redirigir al login si no hay usuario
  useEffect(() => {
    if (!loading && !user) {
      nav("/login");
    }
  }, [loading, user, nav]);

  if (loading || !user) {
    return null;
  }

  const userId = user?.id || session?.user?.id || null;

  function updateField(field, value) {
    if (field === "lat" || field === "lng") {
      if (typeof value === "string") value = value.replace(",", ".");
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const markerPos = useMemo(() => {
    const lat = Number(form.lat);
    const lng = Number(form.lng);
    return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
  }, [form.lat, form.lng]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      if (!form.name) throw new Error("El nombre es obligatorio");
      if (!markerPos) throw new Error("Seleccioná la ubicación en el mapa");
      if (!userId) throw new Error("No se pudo identificar al usuario");

      const payload = {
        user_id: userId,
        name: form.name.trim(),
        country: form.country || null,
        lat: Number(form.lat),
        lng: Number(form.lng),
        capacity:
          (form.capacity && String(form.capacity)) || null,
        predominant_genre: form.predominantGenre || null,
        email: form.email || null,
        whatsapp: form.whatsapp || null,
        hide_whatsapp: !!form.hideWhatsapp,
      };

      const { error: insertError } = await supabase
        .from("venues")
        .insert(payload);

      if (insertError) {
        console.error(insertError);
        throw new Error("No se pudo guardar en Supabase");
      }

      nav("/venues");
    } catch (err) {
      console.error(err);
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
      className="page add-venue"
      style={{
        maxWidth: 900,
        margin: "24px auto",
        display: "grid",
        gap: 16,
      }}
    >
      <h2>Agregar venue</h2>

      <form onSubmit={handleSubmit} className="card" style={cardStyle}>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 1fr",
          }}
        >
          <label style={{ display: "grid", gap: 6 }}>
            <span>Nombre*</span>
            <input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>País</span>
            <input
              value={form.country}
              onChange={(e) => updateField("country", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Capacidad</span>
            <input
              value={form.capacity}
              onChange={(e) => updateField("capacity", e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Género predominante</span>
            <select
              value={form.predominantGenre}
              onChange={(e) =>
                updateField("predominantGenre", e.target.value)
              }
              style={inputStyle}
            >
              <option value="">—</option>
              {GENRES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
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
              value={form.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              placeholder="+54 9 …"
              style={inputStyle}
            />
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 8,
            }}
          >
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

        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ fontSize: 14, opacity: 0.85 }}>
            <strong>
              Busca tu dirección y hacé clic sobre ella para agregarla al mapa
            </strong>
          </div>

          <div
            style={{
              height: 360,
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <MapContainer
              center={[-34.6037, -58.3816]}
              zoom={12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickToSetMarker
                onSet={({ lat, lng }) => {
                  updateField("lat", String(lat));
                  updateField("lng", String(lng));
                }}
              />
              {markerPos && <Marker position={markerPos} icon={safeIcon} />}
            </MapContainer>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <label style={{ display: "grid", gap: 6 }}>
              <span>Latitud*</span>
              <input
                value={form.lat}
                onChange={(e) => updateField("lat", e.target.value)}
                required
                style={inputStyle}
              />
            </label>

            <label style={{ display: "grid", gap: 6 }}>
              <span>Longitud*</span>
              <input
                value={form.lng}
                onChange={(e) => updateField("lng", e.target.value)}
                required
                style={inputStyle}
              />
            </label>
          </div>
        </div>

        {error && <div className="alert error">{error}</div>}

        <button className="btn" type="submit" disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </form>
    </div>
  );
}
