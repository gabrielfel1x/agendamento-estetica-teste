'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'funcionario' | 'cliente';
  plan?: string;
  planStatus?: 'ativo' | 'pendente' | 'cancelado';
  subscriptionDate?: string;
  nextBillingDate?: string;
  monthlyValue?: string;
}

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string) => boolean;
  updateUser: (updates: Partial<User>) => void;
}

interface MockUser extends User {
  password: string;
}

const MOCK_USERS: MockUser[] = [
  { id: '1', name: 'Dra. Ana Souza',   email: 'admin@lumiere.com',      password: 'admin123', role: 'admin' },
  { id: '2', name: 'Clara Mendes',     email: 'funcionaria@lumiere.com', password: '123456',   role: 'funcionario' },
  { id: '3', name: 'Ana Paula Mendes', email: 'ana@lumiere.com',         password: 'cliente1', role: 'cliente', plan: 'premium', planStatus: 'ativo', subscriptionDate: '2026-01-15', nextBillingDate: '2026-04-15', monthlyValue: 'R$ 389' },
];

const AuthContext = createContext<AuthCtx>({
  user: null,
  login: () => false,
  logout: () => {},
  register: () => false,
  updateUser: () => {},
});

const STORAGE_KEY = 'lumiere_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUser(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  function login(email: string, password: string): boolean {
    const found = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!found) return false;
    const { password: _, ...u } = found;
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    return true;
  }

  function register(name: string, email: string, password: string): boolean {
    const exists = MOCK_USERS.find(u => u.email === email);
    if (exists) return false;
    const newUser: MockUser = {
      id: String(Date.now()),
      name,
      email,
      password,
      role: 'cliente',
    };
    MOCK_USERS.push(newUser);
    const { password: _, ...u } = newUser;
    setUser(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    return true;
  }

  function updateUser(updates: Partial<User>) {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  if (!loaded) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
