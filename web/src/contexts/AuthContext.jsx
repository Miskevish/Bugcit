import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../api";

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await auth.me();
        setUser(res?.user || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const res = await auth.login({ email, password });
    setUser(res?.user || null);
    return res?.user || null;
  };

  const register = async (name, email, password) => {
    const res = await auth.register({ name, email, password });
    setUser(res?.user || null);
    return res?.user || null;
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch {}
    setUser(null);
    navigate("/login", { replace: true });
  };

  const updateProfile = async (payload) => {
    const res = await auth.updateProfile(payload);
    // el backend re-emite cookie y devuelve user actualizado
    setUser(res?.user || null);
    return res?.user || null;
  };

  const changePassword = async (currentPassword, newPassword) => {
    await auth.changePassword({ currentPassword, newPassword });
    return true;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuth: !!user,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
    }),
    [user, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export default AuthProvider;
