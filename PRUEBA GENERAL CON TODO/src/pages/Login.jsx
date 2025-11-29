import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [mode, setMode] = useState("login"); // "login" o "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const isLogin = mode === "login";

  // Ver si ya hay usuario logueado
  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setCurrentUser(data.user);
      }
    };
    checkUser();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      let error = null;

      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        error = signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        error = signUpError;
      }

      if (error) throw error;

      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user || null);
      window.location.href = "/";
    } catch (err) {
      setErrorMsg(err.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    window.location.href = "/";
  };

  // Si ya hay sesión iniciada
  if (currentUser) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050009",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            background: "#14101d",
            padding: 24,
            borderRadius: 16,
            maxWidth: 380,
            width: "100%",
          }}
        >
          <h2 style={{ marginBottom: 8 }}>Ya iniciaste sesión</h2>
          <p style={{ marginBottom: 16, fontSize: 14 }}>
            Estás conectada como <strong>{currentUser.email}</strong>.
          </p>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 999,
              border: "none",
              background: "#e52687",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    );
  }

  // Formulario login / registro
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050009",
        color: "white",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          background: "#14101d",
          padding: 24,
          borderRadius: 16,
          maxWidth: 380,
          width: "100%",
        }}
      >
        {/* Botones arriba para cambiar modo */}
        <div style={{ display: "flex", marginBottom: 16 }}>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg("");
            }}
            style={{
              flex: 1,
              padding: 8,
              border: "none",
              cursor: "pointer",
              background: isLogin ? "#e52687" : "#2a2235",
              color: "white",
              fontWeight: 600,
            }}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setErrorMsg("");
            }}
            style={{
              flex: 1,
              padding: 8,
              border: "none",
              cursor: "pointer",
              background: !isLogin ? "#e52687" : "#2a2235",
              color: "white",
              fontWeight: 600,
            }}
          >
            Registrarse
          </button>
        </div>

        <h1 style={{ fontSize: 20, marginBottom: 16 }}>
          {isLogin ? "Iniciá sesión" : "Creá tu cuenta"}
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label
              style={{ display: "block", fontSize: 12, marginBottom: 4 }}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 8,
                border: "1px solid #30263b",
                background: "#1b1527",
                color: "white",
                fontSize: 14,
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label
              style={{ display: "block", fontSize: 12, marginBottom: 4 }}
            >
              Contraseña (mínimo 6 caracteres)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                borderRadius: 8,
                border: "1px solid #30263b",
                background: "#1b1527",
                color: "white",
                fontSize: 14,
              }}
            />
          </div>

          {errorMsg && (
            <div
              style={{
                marginBottom: 10,
                fontSize: 12,
                color: "#ff9ea9",
              }}
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 10,
              borderRadius: 999,
              border: "none",
              background: "#e52687",
              color: "white",
              cursor: "pointer",
              fontWeight: 600,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? "Procesando..."
              : isLogin
              ? "Iniciar sesión"
              : "Registrarse"}
          </button>
        </form>
      </div>
    </div>
  );
}
