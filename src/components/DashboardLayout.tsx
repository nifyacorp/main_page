import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Bell, Settings, LogOut, User } from 'lucide-react';

import type { UserProfile } from '../lib/api/types';
import { user } from '../lib/api';

const menuItems = [
  { icon: Home, label: 'Inicio', href: '/dashboard' },
  { icon: Bell, label: 'Subscripciones', href: '/subscriptions' },
  { icon: Settings, label: 'Ajustes', href: '/settings' },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.group('🔒 User Profile Flow');
        console.log('Step 1: Checking authentication state');
        
        const token = localStorage.getItem('accessToken');
        
        console.log('Current auth state:', {
          hasToken: !!token,
          tokenValue: token ? `${token.substring(0, 10)}...` : null
        });
        
        if (!token) {
          console.error('Step 1 Failed: Missing authentication token');
          console.groupEnd();
          handleLogout();
          return;
        }

        console.log('Step 2: Fetching user profile from API');
        console.log('Making request to /api/users/me endpoint');

        const { data, error } = await user.getProfile();
        
        if (error) {
          console.error('Step 2 Failed: API request error', error);
          if (error.toLowerCase().includes('unauthorized')) {
            console.error('Unauthorized access - clearing session');
            handleLogout();
            return;
          }
          throw new Error(error);
        }

        console.log('Step 3: Processing API response');
        console.log('Response data:', {
          ...data,
          profile: data?.profile ? {
            ...data.profile,
            email: '***@***.***', // Mask sensitive data
            id: '***' // Mask sensitive data
          } : null
        });

        if (data?.profile) {
          console.log('Step 3 Success: Valid profile data received');
          setProfile(data.profile);
        } else {
          console.error('Step 3 Failed: Invalid or missing profile data');
          throw new Error('Invalid profile data received');
        }
        
        console.log('✅ Profile fetch completed successfully');
        console.groupEnd();
      } catch (err) {
        console.error('❌ Profile fetch failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load user profile');
        if (err instanceof Error && err.message.toLowerCase().includes('unauthorized')) {
          console.log('Unauthorized error detected - initiating logout');
          handleLogout();
        }
        console.groupEnd();
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      console.group('🚪 Logout Process');
      console.log('Starting logout process');
      
      // First clear user state
      setProfile(null);
      
      console.log('Clearing auth data from storage');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('isAuthenticated');
      
      console.log('Auth data cleared successfully');
      console.groupEnd();
      
    } catch (err) {
      console.error('Unexpected error during logout:', err);
      console.groupEnd();
    } finally {
      navigate('/auth');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <nav className="w-64 border-r bg-card flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src="https://ik.imagekit.io/appraisily/NYFIA/logo.png" alt="NIFYA" className="h-10 w-10" />
            <div>
              <h1 className="text-xl font-bold text-foreground">NIFYA</h1>
              <p className="text-xs text-muted-foreground">Notificaciones Inteligentes</p>
            </div>
          </Link>
        </div>

        {/* User Section */}
        <div className="p-6 border-b">
          {loading ? (
            <div className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <User className="h-6 w-6 text-primary/50" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-3 w-32 bg-muted rounded" />
                </div>
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                {profile?.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.name}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  <User className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium">{profile?.name}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                {profile?.bio && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {profile.bio}
                  </p>
                )}
              </div>
            </div>
          ) : error ? (
            <div className="text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </div>

        {/* Navigation */}
        <div className="p-6 flex-1">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Logout Section */}
        <div className="p-6 border-t mt-auto">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span>Cerrar sesión</span>
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;