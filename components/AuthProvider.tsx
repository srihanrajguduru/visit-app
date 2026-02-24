"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isDeveloper: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDeveloper, setIsDeveloper] = useState(false);

    const DEV_BYPASS = false;

    useEffect(() => {
        if (DEV_BYPASS) {
            // Mock an authenticated developer user
            setUser({
                uid: 'mock-dev-123',
                email: 'admin@visit.test',
                displayName: 'Developer Admin',
            } as User);
            setIsDeveloper(true);
            setLoading(false);

            // Set mock cookie for middleware
            document.cookie = `__session=mock-token; path=/; max-age=3600; Secure; SameSite=Strict`;
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user && user.email) {
                try {
                    const res = await fetch('/api/auth/sync-role', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: user.email })
                    });

                    const { role } = await res.json();
                    const isDev = role === 'developer';
                    setIsDeveloper(isDev);

                    // Set cookies for Next.js Middleware to read
                    document.cookie = `__session=${await user.getIdToken()}; path=/; max-age=3600; Secure; SameSite=Strict`;
                    document.cookie = `__role=${role}; path=/; max-age=3600; Secure; SameSite=Strict`;

                    // Route users on login
                    const path = window.location.pathname;
                    if (path === '/' || path === '/login' || path === '/signup') {
                        window.location.href = isDev ? '/developer' : '/dashboard';
                    }
                } catch (e) {
                    console.error("Failed to sync role", e);
                    setIsDeveloper(false);
                }
            } else {
                setIsDeveloper(false);
                document.cookie = `__session=; path=/; max-age=0;`;
                document.cookie = `__role=; path=/; max-age=0;`;
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const login = async (email: string, password: string) => {
        if (DEV_BYPASS) { window.location.href = '/dashboard'; return; }
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signup = async (email: string, password: string) => {
        if (DEV_BYPASS) { window.location.href = '/dashboard'; return; }
        await createUserWithEmailAndPassword(auth, email, password);
    };

    const loginWithGoogle = async () => {
        if (DEV_BYPASS) { window.location.href = '/dashboard'; return; }
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    };

    const logout = async () => {
        if (DEV_BYPASS) {
            document.cookie = `__session=; path=/; max-age=0;`;
            window.location.href = '/login';
            return;
        }
        await signOut(auth);
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, isDeveloper, login, signup, loginWithGoogle, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}
