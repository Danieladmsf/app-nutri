import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Register
  const register = async (email, password) => {
    console.log("[AuthContext] Iniciando criação de usuário (register) para:", email);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log("[AuthContext] Sucesso! Usuário criado:", result.user);
      return result;
    } catch (err) {
      console.error("[AuthContext] Erro ao criar usuário (register):", err);
      throw err;
    }
  };

  // Login
  const login = async (email, password) => {
    console.log("[AuthContext] Iniciando login com senha para:", email);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("[AuthContext] Sucesso! Login efetuado:", result.user);
      return result;
    } catch (err) {
      console.error("[AuthContext] Erro no login:", err);
      throw err;
    }
  };

  // Logout
  const logout = () => {
    console.log("[AuthContext] Iniciando logout.");
    return signOut(auth);
  };

  // Google Login
  const loginWithGoogle = () => {
    console.log("[AuthContext] Iniciando Redirecionamento Google OAuth...");
    const provider = new GoogleAuthProvider();
    return signInWithRedirect(auth, provider);
  };

  useEffect(() => {
    console.log("[AuthContext] useEffect carregado. Checando redirect anterior...");
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("[AuthContext] Recebeu Credenciais do Google Redirect com SUCESSO!", result.user);
        } else {
          console.log("[AuthContext] Nenhum redirect do Google pendente.");
        }
      })
      .catch((error) => {
        console.error("[AuthContext] Erro FATAL no retorno do Google (getRedirectResult):", error);
      });

    console.log("[AuthContext] Ligando onAuthStateChanged listener...");
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("[AuthContext] State Mudou! Usuário Atual:", user ? `${user.email} (UID: ${user.uid})` : "Nenhum/Deslogado");
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    register,
    logout,
    loginWithGoogle
  };

  // Prevent children from rendering while auth state loads
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
