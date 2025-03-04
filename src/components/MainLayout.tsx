import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bell, Settings, Users, FileText, PlusCircle, Package, LogOut, Menu, X } from 'lucide-react';
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { useAuth } from '../contexts/AuthContext';

interface MainLayoutProps {
  hideNav?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ hideNav = false }) => {
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
    <div className="min-h-screen w-full bg-white">
      <Header />
      
      <main className="flex min-h-[calc(100vh-4rem)]">
        {isAuthenticated && !hideNav && (
          <>
            {/* Sidebar for desktop */}
            <div className="hidden md:flex h-[calc(100vh-4rem)] w-[240px] flex-col fixed left-0 top-16 border-r bg-background">
              <ScrollArea className="flex-1 py-2">
                <nav className="grid gap-1 px-2">
                  <Link
                    to="/dashboard"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      location.pathname === "/dashboard" 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Home className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/notifications"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      location.pathname === "/notifications" 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Bell className="h-4 w-4" />
                    Notifications
                  </Link>
                  <Link
                    to="/subscriptions"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      location.pathname.includes("/subscriptions") 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Package className="h-4 w-4" />
                    Subscriptions
                  </Link>
                  <Link
                    to="/subscriptions/new"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      location.pathname === "/subscriptions/new" 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground",
                      "ml-6"
                    )}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add New
                  </Link>
                  <Link
                    to="/sources"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      location.pathname.includes("/sources") 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <FileText className="h-4 w-4" />
                    Sources
                  </Link>
                  <Link
                    to="/contacts"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      location.pathname.includes("/contacts") 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    Contacts
                  </Link>
                  <Link
                    to="/settings"
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      location.pathname === "/settings" 
                        ? "bg-accent text-accent-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </nav>
              </ScrollArea>
              <div className="border-t p-2">
                <Button 
                  variant="ghost" 
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
                <div className="bg-background h-full w-[240px]" onClick={e => e.stopPropagation()}>
                  <ScrollArea className="h-full py-2">
                    <nav className="grid gap-1 px-2">
                      <Link
                        to="/dashboard"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                          location.pathname === "/dashboard" 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Home className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        to="/notifications"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                          location.pathname === "/notifications" 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Bell className="h-4 w-4" />
                        Notifications
                      </Link>
                      <Link
                        to="/subscriptions"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                          location.pathname.includes("/subscriptions") 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Package className="h-4 w-4" />
                        Subscriptions
                      </Link>
                      <Link
                        to="/subscriptions/new"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                          location.pathname === "/subscriptions/new" 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-accent hover:text-accent-foreground",
                          "ml-6"
                        )}
                      >
                        <PlusCircle className="h-4 w-4" />
                        Add New
                      </Link>
                      <Link
                        to="/sources"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                          location.pathname.includes("/sources") 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <FileText className="h-4 w-4" />
                        Sources
                      </Link>
                      <Link
                        to="/contacts"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                          location.pathname.includes("/contacts") 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Users className="h-4 w-4" />
                        Contacts
                      </Link>
                      <Link
                        to="/settings"
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                          location.pathname === "/settings" 
                            ? "bg-accent text-accent-foreground" 
                            : "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </nav>
                    <div className="border-t p-2 mt-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        onClick={() => logout()}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
            
            {/* Content padding for desktop */}
            <div className="hidden md:block w-[240px]"></div>
          </>
        )}
        
        <div className={`flex-1 ${isAuthenticated && !hideNav ? 'md:pl-0' : ''}`}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout; 