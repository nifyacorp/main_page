import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Bell, User } from 'lucide-react';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold text-xl">NIFYA</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link to="/pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary">
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Right side nav items */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to="/notifications" className="p-2 hover:bg-slate-100 rounded-full">
                <Bell className="h-5 w-5" />
              </Link>
              
              <div className="relative">
                <button 
                  className="flex items-center space-x-1 rounded-full p-1 hover:bg-slate-100"
                  onClick={() => logout()}
                >
                  <div className="h-8 w-8 bg-slate-300 rounded-full flex items-center justify-center">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </button>
              </div>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/auth" state={{ isLogin: true }} className="text-sm font-medium px-4 py-2 hover:bg-slate-100 rounded-md">
                Log in
              </Link>
              <Link to="/auth" state={{ isLogin: false }} className="text-sm font-medium px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
                Sign up
              </Link>
            </div>
          )}
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 hover:bg-slate-100 rounded-full"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden p-4 bg-white border-t">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/features" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link to="/pricing" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/subscriptions" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Subscriptions
                </Link>
                <Link to="/settings" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Settings
                </Link>
                <button 
                  className="text-sm font-medium text-left"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/auth" state={{ isLogin: true }} className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Log in
                </Link>
                <Link to="/auth" state={{ isLogin: false }} className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 