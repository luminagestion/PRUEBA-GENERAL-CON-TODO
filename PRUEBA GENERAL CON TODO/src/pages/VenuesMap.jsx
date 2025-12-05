import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "../lib/supabaseClient";

// Ícono seguro SVG embebido (no depende de archivos externos)
const svgPin = encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'>
  <path fill='%23e52687' d='M16 1C9.925 1 5 5.925 5 12c0 7.5 9.2 18.1 10.0 19.0a1.3 1.3 0 0 0 2 0C17.8 30.1 27 19.5 27 12 27 5.925 22.075 1 16 1z'/>
  <circle cx='16' cy='12' r='5' fill='white'/>
</svg>`);

const safeIcon = L.icon({
  iconUrl: "data:image/svg+xml;utf8," + svgPin,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -26],
  className: "venue-pin",
});

function toNum(v) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function readLat(v) {
  return toNum(v?.lat ?? v?.latitude ?? v?.Lat ?? v?.Latitude);
}
function readLng(v) {
  return toNum(
    v?.lng ??
      v?.lon ??
      v?.long ??
      v?.longitude ??
      v?.Lng ??
      v?.Longitude
  );
}

export default function VenuesMap() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [qLocalidad, setQLocalidad] = useState("");
  const [qAforo, setQAforo] = useState(""); // '', 'mas100', 'menos100'

  // 🚀 Carga de datos desde Supabase
  useEffect(() => {
    async function fetchVenues() {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await supabase
        .from("venues")
        .select("*");

      if (error) {
        console.error("Error cargando venues:", error);
        setLoadError("No se pudieron cargar los venues.");
        setVenues([]);
      } else {
        setVenues(data || []);
      }
      setLoading(false);
    }

    fetchVenues();
  }, []);

  // Filtrado por localidad + aforo
  const filtered = useMemo(() => {
    return venues.filter((v) => {
      const localidad = (
        v.localidad ||
        v.city ||
        v.ciudad ||
        v.barrio ||
        v.country || // usamos country como fallback en el nuevo esquema
        ""
      )
        .toString()
        .toLowerCase();

      const okLocalidad = qLocalidad
        ? localidad.includes(qLocalidad.toLowerCase())
        : true;

      const aforo = toNum(
        v.aforo ?? v.capacity ?? v.capacidad
      );
      let okAforo = true;
      if (qAforo === "mas100")
        okAforo =
          aforo == null ? false : aforo > 100;
      if (qAforo === "menos100")
        okAforo =
          aforo == null ? false : aforo <= 100;

      // Validar coordenadas
      const lat = readLat(v);
      const lng = readLng(v);
      const okCoords =
        Number.isFinite(lat) && Number.isFinite(lng);

      return okLocalidad && okAforo && okCoords;
    });
  }, [venues, qLocalidad, qAforo]);

  // Centro por defecto (CABA)
  const center = [-34.6037, -58.3816];

  return (
    <div
      className="page venues"
      style={{ display: "grid", gap: 12 }}
    >
      <h2>Mapa de Venues</h2>

      <div
        className="filters card"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          padding: 12,
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <span>Localidad</span>
          <input
            type="text"
            placeholder="Ej: Palermo, Quilmes, Rosario…"
            value={qLocalidad}
            onChange={(e) =>
              setQLocalidad(e.target.value)
            }
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Aforo</span>
          <select
            value={qAforo}
            onChange={(e) =>
              setQAforo(e.target.value)
            }
          >
            <option value="">Todos</option>
            <option value="mas100">
              Más de 100
            </option>
            <option value="menos100">
              Hasta 100
            </option>
          </select>
        </label>

        <div
          style={{
            marginLeft: "auto",
            alignSelf: "end",
            opacity: 0.7,
          }}
        >
          {loading
            ? "Cargando…"
            : `${filtered.length} resultado(s)`}
        </div>
      </div>

      <div
        style={{
          height: "70vh",
          width: "100%",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <MapContainer
          center={center}
          zoom={11}
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {!loading &&
            filtered.map((v, idx) => {
              const lat = readLat(v);
              const lng = readLng(v);
              const name =
                v.name ||
                v.nombre ||
                "Venue sin nombre";
              const localidad =
                v.localidad ||
                v.city ||
                v.ciudad ||
                v.barrio ||
                v.country ||
                "—";
              const aforo =
                v.aforo ??
                v.capacity ??
                v.capacidad;

              return (
                <Marker
                  key={v.id || name + idx}
                  position={[lat, lng]}
                  icon={safeIcon}
                >
                  <Popup>
                    <div style={{ minWidth: 220 }}>
                      <strong>{name}</strong>
                      <br />
                      {localidad}
                      <br />
                      {aforo != null ? (
                        <>
                          Aforo:{" "}
                          <b>{aforo}</b>
                        </>
                      ) : null}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>

      {!loading && loadError && (
        <div
          className="alert error"
          style={{ marginTop: 8 }}
        >
          {loadError}
        </div>
      )}

      {!loading &&
        !loadError &&
        filtered.length === 0 && (
          <div
            className="alert info"
            style={{ marginTop: 8 }}
          >
            No hay venues con los filtros actuales
            o faltan coordenadas (lat/lng). Verificá
            que cada venue tenga latitud y longitud.
          </div>
        )}
    </div>
  );
}
