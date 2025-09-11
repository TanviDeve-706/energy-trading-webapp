import * as React from 'react';

const { createContext, useContext, useState, useEffect } = React;
type ReactNode = React.ReactNode;
import { useWallet } from '@/hooks/use-wallet';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  userType: 'prosumer' | 'consumer';
  walletAddress: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, userType: 'prosumer' | 'consumer') => Promise<void>;
  logout: () => void;
  updateUserType: (userType: 'prosumer' | 'consumer') => void;
  connectWalletToUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isConnected, account, connectWallet } = useWallet();
  const { toast } = useToast();

  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing session on mount
    const storedUser = localStorage.getItem('energy-trading-user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem('energy-trading-user');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Auto-connect wallet if user is authenticated but wallet not connected to account
    if (user && !user.walletAddress && isConnected && account) {
      connectWalletToUser();
    }
  }, [user, isConnected, account]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        username,
        password,
      });
      
      const userData: User = {
        id: response.user.id,
        username: response.user.username,
        userType: response.user.userType,
        walletAddress: response.user.walletAddress,
      };
      
      setUser(userData);
      localStorage.setItem('energy-trading-user', JSON.stringify(userData));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.username}!`,
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, userType: 'prosumer' | 'consumer') => {
    setIsLoading(true);
    try {
      const response = await apiRequest('POST', '/api/auth/register', {
        username,
        password,
        userType,
      });
      
      const userData: User = {
        id: response.user.id,
        username: response.user.username,
        userType: response.user.userType,
        walletAddress: null,
      };
      
      setUser(userData);
      localStorage.setItem('energy-trading-user', JSON.stringify(userData));
      
      toast({
        title: "Registration Successful",
        description: `Welcome to Energy Trading, ${userData.username}!`,
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const connectWalletToUser = async () => {
    if (!user || !isConnected || !account) {
      // Try to connect wallet first
      if (!isConnected) {
        await connectWallet();
        return;
      }
      return;
    }

    try {
      const response = await apiRequest('POST', '/api/wallet/connect', {
        walletAddress: account,
      }, {
        'user-id': user.id,
      });
      
      const updatedUser = {
        ...user,
        walletAddress: response.user.walletAddress,
      };
      
      setUser(updatedUser);
      localStorage.setItem('energy-trading-user', JSON.stringify(updatedUser));
      
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been linked to your account.",
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet to account",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('energy-trading-user');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const updateUserType = (userType: 'prosumer' | 'consumer') => {
    if (!user) return;
    
    const updatedUser = { ...user, userType };
    setUser(updatedUser);
    localStorage.setItem('energy-trading-user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateUserType,
        connectWalletToUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}