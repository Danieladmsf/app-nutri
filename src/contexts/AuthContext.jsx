import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup,
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
  const loginWithGoogle = async () => {
    console.log("[AuthContext] Iniciando Popup Google OAuth...");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("[AuthContext] Sucesso no Popup Google OAuth:", result.user);
      return result;
    } catch (err) {
      console.error("[AuthContext] Erro ao abrir Popup Google OAuth:", err);
      throw err;
    }
  };

  useEffect(() => {
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
