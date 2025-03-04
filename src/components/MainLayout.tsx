import React, { useState, useEffect, ReactNode } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bell, Settings, Users, FileText, PlusCircle, Package, LogOut, Menu, X, ChevronLeft } from 'lucide-react';
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { useAuth } from '../contexts/AuthContext';

interface MainLayoutProps {
  hideNav?: boolean;
  children?: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ hideNav = false, children }) => {
  const handleDebugLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    window.location.href = '/dashboard';
  };
  
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full bg-background">
      <Header />
      
      <main className="flex min-h-[calc(100vh-4rem)]">
        {isAuthenticated && !hideNav && (
          <>
            {/* Sidebar for desktop */}
            <div className="hidden md:flex h-[calc(100vh-4rem)] w-[240px] flex-col fixed left-0 top-16 border-r bg-card">
              <div className="p-3 flex items-center mb-2 border-b">
                <img src="https://ik.imagekit.io/appraisily/NYFIA/logo.png" alt="NIFYA" className="h-6 w-6 mr-2" />
                <span className="font-semibold">NIFYA Dashboard</span>
              </div>
              <div className="px-3 py-2">
                <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">Overview</h2>
                <nav className="space-y-1">
                  <Link
                    to="/dashboard"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      location.pathname === "/dashboard" 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/notifications"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      location.pathname === "/notifications" 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                  </Link>
                </nav>
              </div>
              
              <div className="px-3 py-2">
                <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">Content Management</h2>
                <nav className="space-y-1">
                  <Link
                    to="/subscriptions"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      location.pathname.includes("/subscriptions") && location.pathname !== "/subscriptions/new"
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Package className="h-4 w-4" />
                    Subscriptions
                  </Link>
                  <Link
                    to="/subscriptions/new"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      location.pathname === "/subscriptions/new" 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      "ml-4"
                    )}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add New
                  </Link>
                  <Link
                    to="/sources"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      location.pathname.includes("/sources") 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    Sources
                  </Link>
                </nav>
              </div>
              
              <div className="px-3 py-2">
                <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">Administration</h2>
                <nav className="space-y-1">
                  <Link
                    to="/contacts"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      location.pathname.includes("/contacts") 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    Contacts
                  </Link>
                  <Link
                    to="/settings"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      location.pathname === "/settings" 
                        ? "bg-accent text-accent-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </nav>
              </div>
              <div className="mt-auto border-t p-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </Button>
              </div>
            </div>
            
            {/* Mobile sidebar toggle button */}
            <div className="md:hidden fixed z-40 bottom-4 right-4">
              <Button
                variant="default"
                size="icon"
                className="h-10 w-10 rounded-full shadow-lg"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
            
            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
              <div className="md:hidden fixed inset-0 z-30 bg-black/60" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="bg-card h-full w-[280px]" onClick={e => e.stopPropagation()}>
                  <div className="p-4 flex items-center border-b">
                    <img src="https://ik.imagekit.io/appraisily/NYFIA/logo.png" alt="NIFYA" className="h-6 w-6 mr-2" />
                    <span className="font-semibold">NIFYA Dashboard</span>
                  </div>
                  <div className="px-3 py-2">
                    <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">Overview</h2>
                    <nav className="space-y-1">
                      <Link
                        to="/dashboard"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          location.pathname === "/dashboard" 
                            ? "bg-accent text-accent-foreground" 
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Home className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        to="/notifications"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          location.pathname === "/notifications" 
                            ? "bg-accent text-accent-foreground" 
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Bell className="h-4 w-4" />
                        Notifications
                      </Link>
                    </nav>
                  </div>
                  
                  <div className="px-3 py-2">
                    <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">Content Management</h2>
                    <nav className="space-y-1">
                      <Link
                        to="/subscriptions"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          location.pathname.includes("/subscriptions") && location.pathname !== "/subscriptions/new"
                            ? "bg-accent text-accent-foreground" 
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Package className="h-4 w-4" />
                        Subscriptions
                      </Link>
                      <Link
                        to="/subscriptions/new"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          location.pathname === "/subscriptions/new" 
                            ? "bg-accent text-accent-foreground" 
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          "ml-4"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <PlusCircle className="h-4 w-4" />
                        Add New
                      </Link>
                      <Link
                        to="/sources"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          location.pathname.includes("/sources") 
                            ? "bg-accent text-accent-foreground" 
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FileText className="h-4 w-4" />
                        Sources
                      </Link>
                    </nav>
                  </div>
                  
                  <div className="px-3 py-2">
                    <h2 className="mb-2 px-2 text-xs font-semibold tracking-tight text-muted-foreground">Administration</h2>
                    <nav className="space-y-1">
                      <Link
                        to="/contacts"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          location.pathname.includes("/contacts") 
                            ? "bg-accent text-accent-foreground" 
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Users className="h-4 w-4" />
                        Contacts
                      </Link>
                      <Link
                        to="/settings"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          location.pathname === "/settings" 
                            ? "bg-accent text-accent-foreground" 
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </nav>
                  </div>
                  <div className="mt-auto border-t p-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Content padding for desktop */}
            <div className="hidden md:block w-[240px]"></div>
          </>
        )}
        
        <div className={`flex-1 ${isAuthenticated && !hideNav ? 'md:pl-0' : ''}`}>
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default MainLayout; 