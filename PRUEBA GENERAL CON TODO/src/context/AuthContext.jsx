import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";


const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión actual al iniciar la app
    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error al obtener sesión:", error);
      }
      setUser(data?.session?.user ?? null);
      setLoading(false);
    }

    loadSession();

    // Escuchar cambios de autenticación (login/logout/signup)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Limpiar la suscripción al cerrar
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto desde cualquier parte de la app
export function useAuth() {
  return useContext(AuthContext);
}
