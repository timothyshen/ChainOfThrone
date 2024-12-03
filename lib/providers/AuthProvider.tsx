"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { isConnected, isConnecting } = useAccount();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isConnecting) {
            setIsLoading(false);
        }
    }, [isConnecting]);

    const value = {
        isAuthenticated: isConnected,
        isLoading: isLoading || isConnecting,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext); 