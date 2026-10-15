'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  credits: number;
  plan: 'free' | 'sub_creator' | 'sub_studio';
  subscriptionId?: string | null;
  createdAt: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  consumeCredit: (amount?: number) => Promise<boolean>;
  addCredits: (amount: number) => Promise<void>;
  setSubscriptionPlan: (planId: 'sub_creator' | 'sub_studio', subscriptionId?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = 'bleumaia_demo_user_profile';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Load / Sync Profile
  const loadOrCreateProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setProfile(userSnap.data() as UserProfile);
      } else {
        // Nuevo usuario: obsequiamos 50 créditos de bienvenida
        const newProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || 'Creador Bleumaia',
          photoURL: firebaseUser.photoURL,
          credits: 50,
          plan: 'free',
          createdAt: Date.now(),
        };
        await setDoc(userRef, newProfile);
        setProfile(newProfile);
      }
    } catch (err) {
      console.warn('Error accediendo a Firestore, usando perfil local en memoria:', err);
      // Fallback local
      const fallbackProfile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Creador Bleumaia',
        photoURL: firebaseUser.photoURL,
        credits: 50,
        plan: 'free',
        createdAt: Date.now(),
      };
      setProfile(fallbackProfile);
    }
  };

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          await loadOrCreateProfile(currentUser);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Modo Demo / Local (si el usuario aún no configuró las claves de Firebase)
      const stored = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setProfile(parsed);
          setUser({ uid: parsed.uid, email: parsed.email, displayName: parsed.displayName } as any);
        } catch {
          // ignore
        }
      } else {
        // Crear perfil inicial de invitado con 50 créditos
        const initialGuest: UserProfile = {
          uid: 'guest_' + Math.random().toString(36).substring(2, 9),
          email: 'invitado@bleumaia.ai',
          displayName: 'Invitado Creativo',
          photoURL: null,
          credits: 50,
          plan: 'free',
          createdAt: Date.now(),
        };
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(initialGuest));
        setProfile(initialGuest);
      }
      setLoading(false);
    }
  }, []);

  // Iniciar con Google
  const signInWithGoogle = async () => {
    if (isFirebaseConfigured) {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      await loadOrCreateProfile(res.user);
    } else {
      // Simulación de Google en modo local
      const mockGoogleUser: UserProfile = {
        uid: 'google_user_' + Date.now(),
        email: 'creador.google@gmail.com',
        displayName: 'Creador Google',
        photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        credits: 50,
        plan: 'free',
        createdAt: Date.now(),
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockGoogleUser));
      setProfile(mockGoogleUser);
      setUser({ uid: mockGoogleUser.uid, email: mockGoogleUser.email, displayName: mockGoogleUser.displayName } as any);
    }
  };

  // Iniciar con Correo y Contraseña
  const signInWithEmail = async (email: string, pass: string) => {
    if (isFirebaseConfigured) {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      await loadOrCreateProfile(res.user);
    } else {
      const mockUser: UserProfile = {
        uid: 'email_user_' + Date.now(),
        email,
        displayName: email.split('@')[0],
        photoURL: null,
        credits: 50,
        plan: 'free',
        createdAt: Date.now(),
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(mockUser));
      setProfile(mockUser);
      setUser({ uid: mockUser.uid, email: mockUser.email, displayName: mockUser.displayName } as any);
    }
  };

  // Registro con Correo y Contraseña
  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    if (isFirebaseConfigured) {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (name) {
        await updateProfile(res.user, { displayName: name });
      }
      await loadOrCreateProfile(res.user);
    } else {
      const newUser: UserProfile = {
        uid: 'user_' + Date.now(),
        email,
        displayName: name || email.split('@')[0],
        photoURL: null,
        credits: 50,
        plan: 'free',
        createdAt: Date.now(),
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
      setProfile(newUser);
      setUser({ uid: newUser.uid, email: newUser.email, displayName: newUser.displayName } as any);
    }
  };

  // Cerrar sesión
  const logout = async () => {
    if (isFirebaseConfigured) {
      await firebaseSignOut(auth);
    } else {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
      // Restablecer a invitado con 50 créditos
      const guest: UserProfile = {
        uid: 'guest_' + Math.random().toString(36).substring(2, 9),
        email: 'invitado@bleumaia.ai',
        displayName: 'Invitado Creativo',
        photoURL: null,
        credits: 50,
        plan: 'free',
        createdAt: Date.now(),
      };
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(guest));
      setProfile(guest);
      setUser(null);
    }
  };

  // Consumir créditos (o ilimitado si es PRO)
  const consumeCredit = async (amount = 1): Promise<boolean> => {
    if (!profile) return false;

    // Si tiene plan de suscripción activo, las generaciones son ilimitadas
    if (profile.plan === 'sub_creator' || profile.plan === 'sub_studio') {
      return true;
    }

    if (profile.credits < amount) {
      return false; // Saldo insuficiente
    }

    const updatedCredits = profile.credits - amount;
    const updatedProfile = { ...profile, credits: updatedCredits };
    setProfile(updatedProfile);

    if (isFirebaseConfigured && user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { credits: increment(-amount) });
      } catch (e) {
        console.error('Error al actualizar créditos en Firestore:', e);
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedProfile));
    }

    return true;
  };

  // Agregar créditos tras compra con PayPal
  const addCredits = async (amount: number) => {
    if (!profile) return;

    const updatedCredits = (profile.credits || 0) + amount;
    const updatedProfile = { ...profile, credits: updatedCredits };
    setProfile(updatedProfile);

    if (isFirebaseConfigured && user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { credits: increment(amount) });
      } catch (e) {
        console.error('Error al sumar créditos en Firestore:', e);
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedProfile));
    }
  };

  // Actualizar suscripción tras pago con PayPal
  const setSubscriptionPlan = async (planId: 'sub_creator' | 'sub_studio', subscriptionId?: string) => {
    if (!profile) return;

    const bonusCredits = planId === 'sub_creator' ? 400 : 1200;
    const updatedProfile: UserProfile = {
      ...profile,
      plan: planId,
      subscriptionId: subscriptionId || null,
      credits: (profile.credits || 0) + bonusCredits,
    };

    setProfile(updatedProfile);

    if (isFirebaseConfigured && user) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          plan: planId,
          subscriptionId: subscriptionId || null,
          credits: increment(bonusCredits),
        });
      } catch (e) {
        console.error('Error al actualizar suscripción en Firestore:', e);
      }
    } else {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updatedProfile));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        consumeCredit,
        addCredits,
        setSubscriptionPlan,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
