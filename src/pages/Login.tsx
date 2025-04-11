import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { authService } from '../api';
import { useAuth } from '../hooks/use-auth';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();
  
  const [signingIn, setSigningIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: localStorage.getItem('email') || '',
    password: '',
  });
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User is authenticated in Login component, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Set autocomplete attributes for inputs
  useEffect(() => {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      passwordInput.setAttribute('autocomplete', 'current-password');
    }
    
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.setAttribute('autocomplete', 'email');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError('Por favor, introduce tu email para recuperar tu contraseña');
      return;
    }
    
    setError(null);
    setSigningIn(true);
    
    try {
      // Here you would normally call the forgot password API
      // For now, just show a message
      alert('Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.');
      setIsForgotPassword(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error');
    } finally {
      setSigningIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSigningIn(true);

    try {
      console.log('Processing login');
      
      const { error, data, errorCode } = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      if (error) {
        // Handle specific error codes
        if (errorCode === 'USER_NOT_FOUND') {
          throw new Error('No account exists with this email address. Please sign up first.');
        } else if (errorCode === 'INVALID_CREDENTIALS') {
          throw new Error('Invalid email or password. Please try again.');
        } else if (errorCode === 'ACCOUNT_LOCKED') {
          throw new Error('Your account has been temporarily locked due to too many failed login attempts. Please try again later.');
        } else if (errorCode === 'SERVER_ERROR' && error.includes('404')) {
          throw new Error('Cannot connect to the authentication service. Please try again later.');
        } else {
          throw new Error(error);
        }
      }
      
      if (data?.accessToken) {
        // Reset any loop detection counters before login
        localStorage.removeItem('auth_redirect_timestamp');
        localStorage.removeItem('auth_redirect_count');
        localStorage.removeItem('auth_redirect_in_progress');
        
        // Store refresh token separately
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        // CRITICAL: Verify user ID extraction and storage
        const userId = localStorage.getItem('userId');
        console.log('Verifying user ID after login:', { 
          userId, 
          extractedFromToken: !!userId,
          tokenPreview: data.accessToken.substring(0, 15) + '...'
        });
        
        if (!userId) {
          console.error('⚠️ No user ID extracted from token! Authentication with backend will fail.');
          
          // Try to extract it manually one more time
          try {
            const tokenParts = data.accessToken.replace(/^Bearer\s+/i, '').split('.');
            if (tokenParts.length >= 2) {
              const payload = JSON.parse(atob(tokenParts[1]));
              if (payload.sub) {
                localStorage.setItem('userId', payload.sub);
                console.log('Successfully extracted and saved user ID from token:', payload.sub);
              } else {
                console.error('Token does not contain sub claim:', { payload });
              }
            }
          } catch (tokenError) {
            console.error('Failed to extract user ID from token:', tokenError);
          }
        }

        // Call the context login function which will update state and localStorage
        await authLogin(data.accessToken);
        
        // Store email for future convenience
        localStorage.setItem('email', formData.email);

        // Redirect to dashboard after successful login
        navigate('/dashboard', { replace: true });
      } else {
        throw new Error('No access token received from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setSigningIn(false);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="absolute top-4 left-4">
          <button
            onClick={() => setIsForgotPassword(false)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>
        </div>

        <div className="w-full max-w-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Recuperar Contraseña</h1>
            <p className="text-muted-foreground">
              Introduce tu email para recibir instrucciones
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <label 
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="tu@email.com"
                  autoComplete="email"
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            <button
              type="submit"
              disabled={signingIn}
              className="w-full h-10 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center"
            >
              {signingIn ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                'Enviar Instrucciones'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="absolute top-4 left-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver</span>
        </Link>
      </div>

      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Iniciar Sesión</h1>
          <p className="text-muted-foreground">
            Accede a tu cuenta de NIFYA
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label 
              htmlFor="email"
              className="text-sm font-medium text-foreground"
            >
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="tu@email.com"
                autoComplete="email"
              />
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <label 
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute right-3 top-2.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border rounded-lg pl-10 pr-20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={signingIn}
            className="w-full h-10 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center"
          >
            {signingIn ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/signup"
                className="text-primary hover:underline"
              >
                Crear Cuenta
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 