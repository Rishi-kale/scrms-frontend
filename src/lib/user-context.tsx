"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@/lib/api-services';
import { User } from '@/lib/api-services';
import { getAccessToken } from '@/lib/api';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  clearUser: () => void;
}

// API Response interface
interface UserDetailsResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    roles: Array<{
      id: string;
      name: string;
      key: string;
    }>;
  };
  message: string;
  error: Record<string, unknown>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const queryClient = useQueryClient();

  // Set client flag when component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get current token to use as part of the query key
  const token = getAccessToken();

  const {
    data: userResponse,
    isLoading,
    refetch,
  } = useQuery<UserDetailsResponse>({
    queryKey: ['user', 'details', token], // Include token in query key
    queryFn: () => authAPI.getUserDetails(),
    enabled: isClient && !!token, // Only run query if client and token exists
    retry: 1,
    staleTime: 0, // Don't cache - always fetch fresh data
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
  });

  // Listen for token changes and refetch user data
  useEffect(() => {
    if (isClient && token) {
      // Refetch user data when token changes
      refetch();
    }
  }, [token, isClient, refetch]);

  // Listen for localStorage changes (when token is updated)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'Company_token' && isClient) {
        // Token changed, refetch user data
        refetch();
      }
    };

    const handleTokenChange = (e: CustomEvent) => {
      if (isClient) {
        // Token changed via custom event, refetch user data
        refetch();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tokenChanged', handleTokenChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenChanged', handleTokenChange as EventListener);
    };
  }, [isClient, refetch]);

  // Transform the API response to match our User interface
  const user = userResponse?.data ? {
    id: userResponse.data.id,
    name: userResponse.data.name,
    email: userResponse.data.email,
    password: '', // Not provided in response
    isActive: userResponse.data.isActive,
    createdAt: userResponse.data.createdAt,
    updatedAt: userResponse.data.updatedAt,
    azureOid: null, // Not provided in response
    azureTid: null, // Not provided in response
    userRoles: userResponse.data.roles.map(role => ({
      id: role.id,
      role: {
        id: role.id,
        key: role.key,
        name: role.name
      }
    })),
    histories: [], // Not provided in response
    changedHistories: [], // Not provided in response
    auditLogs: [] // Not provided in response
  } : null;

  const clearUser = () => {
    // Clear user data from cache when logging out
    queryClient.removeQueries({ queryKey: ['user', 'details'] });
  };

  const value: UserContextType = {
    user: user as User | null,
    isLoading,
    error: null,
    refetch,
    clearUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
