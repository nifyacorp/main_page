import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Check, X } from 'lucide-react';
import { auth } from '../lib/api/index';
import { useAuth } from '../hooks/use-auth';

interface PasswordRequirement {
  regex: RegExp;
  message: string;
}

const passwordRequirements: PasswordRequirement[] = [
  { regex: /.{6,}/, message: 'Al menos 6 caracteres' },
  { regex: /[0-9]/, message: 'Al menos un número' },
];

interface SignupFormData {
  email: string;
  password: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login: authLogin } = useAuth();
  
  const [signingUp, setSigningUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
  });
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSigningUp(true);

    try {
      console.log('Processing signup');
      
      const response = await auth.signup(formData.email, formData.password, '');
      
      if (response && response.error) {
        setError(response.error);
      } else if (!response || !response.data) {
        setError('Could not connect to the authentication service. Please try again later.');
      } else {
        // If signup returns tokens (some implementations do auto-login)
        if (response.data.accessToken) {
          console.log('Auto-login after signup detected, processing tokens and user ID');
          
          // Ensure token has the Bearer prefix
          const accessToken = response.data.accessToken;
          const formattedToken = accessToken.startsWith('Bearer ') 
            ? accessToken 
            : `Bearer ${accessToken}`;
          
          const refreshToken = response.data.refreshToken;
          
          // Store tokens
          localStorage.setItem('accessToken', formattedToken);
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }
          
          // Extract and verify user ID
          let userId = localStorage.getItem('userId');
          if (!userId) {
            console.warn('No user ID found after signup, attempting to extract from token');
            
            try {
              const tokenValue = formattedToken.replace('Bearer ', '');
              const tokenParts = tokenValue.split('.');
              if (tokenParts.length >= 2) {
                const payload = JSON.parse(atob(tokenParts[1]));
                if (payload.sub) {
                  userId = payload.sub;
                  localStorage.setItem('userId', userId);
                  console.log('Successfully extracted user ID from token:', userId);
                }
              }
            } catch (tokenError) {
              console.error('Failed to extract user ID from token:', tokenError);
            }
          }
          
          // Show success message but redirect to dashboard instead of login
          setSuccessMessage('¡Cuenta creada correctamente! Redirigiendo al panel de control...');
          
          // Use AuthContext login if we have tokens
          try {
            await authLogin(formattedToken);
            setTimeout(() => {
              navigate('/dashboard', { replace: true });
            }, 2000);
            return;
          } catch (loginError) {
            console.error('Auto-login failed:', loginError);
          }
        }
        
        // Normal flow - show success and redirect to login
        setSuccessMessage('¡Cuenta creada correctamente! Por favor, verifica tu email para activar tu cuenta.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred during signup');
    } finally {
      setSigningUp(false);
    }
  };

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
          <h1 className="text-2xl font-bold mb-2">Crear Cuenta</h1>
          <p className="text-muted-foreground">
            Únete a NIFYA y no te pierdas nada importante
          </p>
        </div>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-500/10 text-green-600 rounded-lg flex items-start gap-2">
            <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{successMessage}</p>
          </div>
        )}

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
                placeholder="••••••"
                minLength={6}
                autoComplete="new-password"
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            
            <div className="mt-3 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                La contraseña debe contener:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {passwordRequirements.map((req, index) => {
                  const isValid = req.regex.test(formData.password);
                  return (
                    <div
                      key={index}
                      className={`flex items-center gap-2 text-sm ${
                        isValid ? 'text-green-600' : 'text-muted-foreground'
                      }`}
                    >
                      {isValid ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                      {req.message}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={signingUp}
            className="w-full h-10 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center"
          >
            {signingUp ? (
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            ) : (
              'Crear Cuenta'
            )}
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="text-primary hover:underline"
              >
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup; 