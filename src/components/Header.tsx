import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { NotificationBadge } from './notifications/NotificationBadge';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authState, setAuthState] = useState({ isAuthenticated: false, user: null });
  
  // Use effect to update auth state from context
  useEffect(() => {
    setAuthState({ isAuthenticated, user });
    console.log('Auth state in header updated:', { isAuthenticated, user });
  }, [isAuthenticated, user]);
  
  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (authState.isAuthenticated) {
      e.preventDefault();
      navigate('/dashboard');
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by auth context
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Only show one logout button to prevent duplication
  // We'll use the dropdown menu only, and remove the absolute positioned button
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link 
            to={authState.isAuthenticated ? "/dashboard" : "/"} 
            className="mr-6 flex items-center space-x-2"
            onClick={handleLogoClick}
          >
            <img src="https://ik.imagekit.io/appraisily/NYFIA/logo.png" alt="NIFYA" className="h-7 w-7" />
            <span className="font-medium text-lg tracking-tight">NIFYA</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-5">
            {authState.isAuthenticated && (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-primary">
                  Dashboard
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right side nav items */}
        <div className="flex items-center gap-4">
          {authState.isAuthenticated ? (
            <>
              <div className="p-1.5 hover:bg-accent/30 rounded-full">
                <NotificationBadge />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                    <div className="h-7 w-7 bg-primary/5 text-primary rounded-full flex items-center justify-center">
                      {authState.user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    id="dropdown-logout-button"
                    data-testid="dropdown-logout-button"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/auth?mode=login" className="text-sm font-medium px-3 py-1.5 hover:bg-accent/40 rounded-md">
                Log in
              </Link>
              <Link to="/auth?mode=signup" className="text-sm font-medium px-3 py-1.5 bg-primary/90 text-white rounded-md hover:bg-primary">
                Sign up
              </Link>
            </div>
          )}
          
          {/* Mobile menu button - only show for non-authenticated or on landing page */}
          {(!authState.isAuthenticated || location.pathname === '/') && (
            <button 
              className="md:hidden p-1.5 hover:bg-accent/30 rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Mobile menu - only for non-authenticated */}
      {mobileMenuOpen && !authState.isAuthenticated && (
        <div className="md:hidden p-4 bg-background border-t border-border/40">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="text-sm font-medium text-foreground/80" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/auth?mode=login" className="text-sm font-medium text-foreground/80" onClick={() => setMobileMenuOpen(false)}>
              Log in
            </Link>
            <Link to="/auth?mode=signup" className="text-sm font-medium text-foreground/80" onClick={() => setMobileMenuOpen(false)}>
              Sign up
            </Link>
          </div>
        </div>
      )}
      
      {/* Mobile menu - for authenticated users */}
      {mobileMenuOpen && authState.isAuthenticated && (
        <div className="md:hidden p-4 bg-background border-t border-border/40">
          <div className="flex flex-col space-y-4">
            <Link to="/dashboard" className="text-sm font-medium text-foreground/80" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </Link>
            <Link to="/settings" className="text-sm font-medium text-foreground/80" onClick={() => setMobileMenuOpen(false)}>
              Settings
            </Link>
            <button 
              className="text-sm font-medium text-left text-destructive/80 flex items-center"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              id="mobile-logout-button"
              data-testid="mobile-logout-button"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}