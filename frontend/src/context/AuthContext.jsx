import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/dataService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      // ignore
    }

    const token = sessionStorage.getItem('token');
    if (token) {
      authService.getCurrentUser()
        .then(res => {
          setUser(res.data);
        })
        .catch(() => {
          sessionStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials, expectedRole) => {
    const res = await authService.login(credentials);
    const userData = res.data;

    if (expectedRole && userData.role !== expectedRole) {
      const targetPortal = expectedRole === 'STUDENT' ? 'Student' : 'Faculty';
      const actualRole = userData.role === 'STUDENT' ? 'Student' : 'Faculty';
      throw new Error(`${actualRole} credentials cannot authenticate through the ${targetPortal} portal.`);
    }

    sessionStorage.setItem('token', userData.token);
    setUser(userData);
    return userData;
  };

  const registerStudent = async (data) => {
    const res = await authService.registerStudent(data);
    const userData = res.data;
    sessionStorage.setItem('token', userData.token);
    setUser(userData);
    return userData;
  };

  const registerFaculty = async (data) => {
    const res = await authService.registerFaculty(data);
    const userData = res.data;
    sessionStorage.setItem('token', userData.token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch {
      // ignore
    }
    setUser(null);
  };

  const isStudent = () => user?.role === 'STUDENT';
  const isFaculty = () => user?.role === 'FACULTY';

  return (
    <AuthContext.Provider value={{
      user, loading, login, registerStudent, registerFaculty, logout, isStudent, isFaculty
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
