/**
 * --------------------------------------------------------
 * File: components/AuthProvider.tsx
 * Purpose: Custom local session state provider.
 * Responsibilities: Replicates Firebase authentication context interface, handling session state recovery, custom credential login/signup, mock Google login, and session destruction.
 * Author: srihanrajguduru
 * --------------------------------------------------------
 */

"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    metadata: {
        creationTime: string;
    };
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isDeveloper: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name?: string) => Promise<void>;
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

    // Toggle this to true if you want to bypass local database login and test with a mocked developer session
    const DEV_BYPASS = false;

    const fetchMe = async () => {
        try {
            const res = await fetch("/api/auth/me");
            const data = await res.json();
            if (data.user) {
                const formattedUser: User = {
                    uid: data.user.id,
                    email: data.user.email,
                    displayName: data.user.name || "Explorer",
                    photoURL: null,
                    metadata: {
                        creationTime: new Date().toISOString(),
                    },
                    role: data.user.role,
                };
                setUser(formattedUser);
                setIsDeveloper(data.user.role === "developer");
            } else {
                setUser(null);
                setIsDeveloper(false);
            }
        } catch (e) {
            console.error("Failed to restore session", e);
            setUser(null);
            setIsDeveloper(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (DEV_BYPASS) {
            const mockUser: User = {
                uid: 'mock-dev-123',
                email: 'admin@visit.test',
                displayName: 'Developer Admin',
                photoURL: null,
                metadata: {
                    creationTime: new Date().toISOString(),
                },
                role: 'developer',
            };
            setUser(mockUser);
            setIsDeveloper(true);
            setLoading(false);

            // Set mock cookies for proxy/middleware
            document.cookie = `__session=mock-token; path=/; max-age=3600; Secure; SameSite=Strict`;
            document.cookie = `__role=developer; path=/; max-age=3600; Secure; SameSite=Strict`;
            return;
        }

        fetchMe();
    }, []);

    const login = async (email: string, password: string) => {
        if (DEV_BYPASS) {
            window.location.href = '/dashboard';
            return;
        }

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Login failed");
        }

        const formattedUser: User = {
            uid: data.user.id,
            email: data.user.email,
            displayName: data.user.name || "Explorer",
            photoURL: null,
            metadata: {
                creationTime: new Date().toISOString(),
            },
            role: data.user.role,
        };

        setUser(formattedUser);
        const isDev = data.user.role === "developer";
        setIsDeveloper(isDev);

        window.location.href = isDev ? '/developer' : '/dashboard';
    };

    const signup = async (email: string, password: string, name?: string) => {
        if (DEV_BYPASS) {
            window.location.href = '/dashboard';
            return;
        }

        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Signup failed");
        }

        const formattedUser: User = {
            uid: data.user.id,
            email: data.user.email,
            displayName: data.user.name || "Explorer",
            photoURL: null,
            metadata: {
                creationTime: new Date().toISOString(),
            },
            role: data.user.role,
        };

        setUser(formattedUser);
        setIsDeveloper(data.user.role === "developer");

        window.location.href = '/dashboard';
    };

    const loginWithGoogle = async () => {
        // Mock a successful Google signup/login locally
        if (DEV_BYPASS) {
            window.location.href = '/dashboard';
            return;
        }

        // Mock sign in with a demo google user
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: "google.explorer@visit.com",
                password: "GoogleExplorerPassword123!",
                name: "Google Explorer",
            }),
        });

        // If user already exists, login instead
        if (!res.ok) {
            const loginRes = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: "google.explorer@visit.com",
                    password: "GoogleExplorerPassword123!",
                }),
            });
            const loginData = await loginRes.json();
            if (!loginRes.ok) {
                throw new Error(loginData.error || "Google login failed");
            }
            const formattedUser: User = {
                uid: loginData.user.id,
                email: loginData.user.email,
                displayName: loginData.user.name,
                photoURL: null,
                metadata: { creationTime: new Date().toISOString() },
                role: loginData.user.role,
            };
            setUser(formattedUser);
            setIsDeveloper(loginData.user.role === "developer");
        } else {
            const data = await res.json();
            const formattedUser: User = {
                uid: data.user.id,
                email: data.user.email,
                displayName: data.user.name,
                photoURL: null,
                metadata: { creationTime: new Date().toISOString() },
                role: data.user.role,
            };
            setUser(formattedUser);
            setIsDeveloper(data.user.role === "developer");
        }

        window.location.href = '/dashboard';
    };

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUser(null);
        setIsDeveloper(false);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, isDeveloper, login, signup, loginWithGoogle, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}
