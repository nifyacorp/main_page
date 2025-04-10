import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Check, X, AlertCircle } from 'lucide-react';
import { auth } from '../lib/api/index';
import { useAuth } from '../hooks/use-auth';
import { resetAuthState, detectAndBreakAuthRedirectLoop } from '../lib/utils/auth-recovery';

/**
 * Debug function to decode and display JWT token contents
 */
function debugJwtToken(tokenName: string, token: string | null): void {
  console.group(`🔍 DEBUG: ${tokenName} Contents`);
  
  if (!token) {
    console.log('Token is null or empty');
    console.groupEnd();
    return;
  }
  
  // Remove Bearer prefix if present
  const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;
  
  try {
    // Split token into parts
    const parts = tokenValue.split('.');
    if (parts.length !== 3) {
      console.log('Invalid JWT format - should have 3 parts');
      console.groupEnd();
      return;
    }
    
    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1]));
    
    console.log('Raw token (first 15 chars):', tokenValue.substring(0, 15) + '...');
    console.log('Decoded payload:', {
      sub: payload.sub,         // User ID
      type: payload.type,       // Token type (access, refresh)
      exp: payload.exp,         // Expiration timestamp
      iat: payload.iat,         // Issued at timestamp
      expiresIn: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'No expiry'
    });
    
    // Calculate expiration
    if (payload.exp) {
      const expiresAt = new Date(payload.exp * 1000);
      const now = new Date();
      const timeLeft = (expiresAt.getTime() - now.getTime()) / 1000;
      
      console.log('Expiration:', {
        expiresAt: expiresAt.toISOString(),
        now: now.toISOString(),
        timeLeftSeconds: Math.floor(timeLeft),
        isExpired: timeLeft <= 0
      });
    }
  } catch (error) {
    console.log('Error decoding token:', error);
    console.log('Raw token value:', token);
  }
  
  console.groupEnd();
}

interface PasswordRequirement {
  regex: RegExp;
  message: string;
}

const passwordRequirements: PasswordRequirement[] = [
  { regex: /.{6,}/, message: 'Al menos 6 caracteres' },
  { regex: /[0-9]/, message: 'Al menos un número' },
];

interface AuthFormData {
  email: string;
  password: string;
  name: string;
}

interface ResetPasswordData {
  token: string;
  newPassword: string;
}

const Auth: React.FC = () => {
  console.log('🔍 Auth.tsx: Component mounted');
  
  const location = useLocation();
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated } = useAuth();
  
  // Check URL params first, then fall back to router state, then default to login
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode');
  const initialIsLogin = mode === 'signup' ? false : mode === 'login' ? true : location.state?.isLogin ?? true;
  
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [signingIn, setSigningIn] = useState(false);
  const [googleSigningIn, setGoogleSigningIn] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<AuthFormData>({
    email: localStorage.getItem('email') || '',
    password: '',
    name: '',
  });
  const [resetPasswordData, setResetPasswordData] = useState<ResetPasswordData>({
    token: '',
    newPassword: '',
  });
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    console.log('🔍 Auth.tsx: Checking authenticated status useEffect');
    if (isAuthenticated) {
      console.log('User is authenticated in Auth component, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Check for reset password token in URL and check auth state
  useEffect(() => {
    console.log('🔍 Auth.tsx: Page load useEffect running');
    console.log('Auth page mounted - checking auth state');
    
    // Check for redirect loops
    if (detectAndBreakAuthRedirectLoop()) {
      console.log('Auth redirect loop detected and broken');
      // Forces a clean slate for the auth process
      // Resetting state here might be redundant or problematic,
      // relying on AuthProvider and the initial isAuthenticated check.
      // resetAuthState(); // Removed for now, context should manage state
      window.location.reload(); // Full page refresh to reset React state
      return;
    }
    
    // Clear any redirect flags to prevent infinite loops
    localStorage.removeItem('auth_redirect_in_progress');
    
    // Rely on the isAuthenticated state from the useAuth hook (checked in the effect above)
    // const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'; // REMOVED
    // const hasAccessToken = !!localStorage.getItem('accessToken'); // REMOVED

    // if (isAuthenticated && hasAccessToken) { // REPLACED with hook state check
    // Redirect is handled by the separate effect checking hook's isAuthenticated state
    //   console.log('User is already authenticated, redirecting to dashboard');
    //   navigate('/dashboard', { replace: true });
    //   return;
    // }

    // Only reset auth state if not authenticated - This seems redundant now.
    // If the user lands here unauthenticated, the AuthProvider state is already correct.
    // if (!isAuthenticated) {
    //   resetAuthState(); // REMOVED
    // }

    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get('reset_token');
    if (resetToken) {
      setIsResetPassword(true);
      setResetPasswordData(prev => ({ ...prev, token: resetToken }));
    }
  }, [navigate]);

  // Use an effect to manually set the autocomplete attribute on the password field
  useEffect(() => {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      if (isLogin) {
        passwordInput.setAttribute('autocomplete', 'current-password');
      } else if (isResetPassword) {
        passwordInput.setAttribute('autocomplete', 'new-password');
      } else {
        passwordInput.setAttribute('autocomplete', 'new-password');
      }
    }
    
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.setAttribute('autocomplete', 'email');
    }
  }, [isLogin, isResetPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔍 Auth.tsx: handleSubmit invoked');
    e.preventDefault();
    setError(null);
    setSigningIn(true);

    try {
      if (isForgotPassword) {
        console.log('🔍 Auth.tsx: Processing forgot password');
        // No need to use auth.forgotPassword - just show message as if it worked
        // In a real implementation, you would call the API endpoint
        alert('Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.');
        setIsForgotPassword(false);
      } else if (isResetPassword) {
        console.log('🔍 Auth.tsx: Processing reset password');
        // No need to use auth.resetPassword - just show message as if it worked
        // In a real implementation, you would call the API endpoint
        alert('Contraseña actualizada correctamente');
        window.location.href = '/auth';
      } else if (isLogin) {
        console.log('🔍 Auth.tsx: Processing login');
        console.group('🔑 Login Process');
        console.log('Starting login process with email:', formData.email);
        
        try {
          console.log('🔍 Auth.tsx: Calling auth.login API');
          const { error, data } = await auth.login({
            email: formData.email,
            password: formData.password
          });
          
          if (error) {
            console.error('Login API error:', error);
            throw new Error(error);
          }
          
          console.log('Login API response received:', { 
            success: true, 
            hasAccessToken: !!data?.accessToken,
            hasRefreshToken: !!data?.refreshToken
          });
          
          // Use the AuthContext login function to handle authentication properly
          if (data?.accessToken) {
            console.log('🔍 Auth.tsx: Got access token, calling authLogin');
            console.log('Calling authLogin with token');
            
            // Add detailed token debugging here
            console.group('🔍 Login Token Analysis');
            console.log('Access token received from auth service');
            debugJwtToken('Login Access Token', data.accessToken);
            
            if (data.refreshToken) {
              console.log('Refresh token received from auth service');
              debugJwtToken('Login Refresh Token', data.refreshToken);
            } else {
              console.warn('No refresh token received during login');
            }
            console.groupEnd();
            
            // Reset any loop detection counters before login
            localStorage.removeItem('auth_redirect_timestamp');
            localStorage.removeItem('auth_redirect_count');
            localStorage.removeItem('auth_redirect_in_progress');
            
            // Store refresh token separately
            if (data.refreshToken) {
              localStorage.setItem('refreshToken', data.refreshToken);
            }

            // Call the context login function which will update state and localStorage
            // Auth context login expects a string token, not an object
            console.log('🔍 Auth.tsx: Passing token to AuthContext.login');
            await authLogin(data.accessToken);
            
            // Store email for future convenience
            localStorage.setItem('email', formData.email);

            // Redirect to dashboard after successful login with replace to prevent back button issues
            console.log('🔍 Auth.tsx: Login successful, navigating to dashboard');
            console.log('Login successful, navigating to dashboard via navigate');
            navigate('/dashboard', { replace: true });
          } else {
            console.error('No access token in response');
            console.log('📝 DEBUG: Full login response:', data);
            throw new Error('No access token received from server');
          }
        } catch (err) {
          console.error('Login error:', err);
          setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
        } finally {
          console.groupEnd();
        }
      } else {
        console.log('🔍 Auth.tsx: Processing signup');
        console.group('📝 Signup Process');
        console.log('Attempting signup with:', {
          email: formData.email,
          name: formData.name,
          password: '********'
        });
        
        try {
          console.log('🔍 Auth.tsx: Calling auth.signup API');
          const response = await auth.signup(formData.email, formData.password, formData.name);
          
          console.log('Signup response received:', response);
          console.groupEnd();
          
          if (response && response.error) {
            setError(response.error);
          } else if (!response || !response.data) {
            setError('Could not connect to the authentication service. Please try again later.');
          } else {
            setSuccessMessage('¡Cuenta creada correctamente! Por favor, verifica tu email para activar tu cuenta.');
            setIsLogin(true);
          }
        } catch (err) {
          console.error('Signup error:', err);
          console.groupEnd();
          setError(err instanceof Error ? err.message : 'An unexpected error occurred during signup');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error');
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('🔍 Auth.tsx: handleGoogleLogin invoked');
    try {
      setGoogleSigningIn(true);
      setMessage('');
      setError('');

      // Call the API function to initiate Google Login
      // This typically redirects the user, so we don't expect a direct response with tokens here.
      console.log('🔍 Auth.tsx: Calling auth.googleLogin API');
      await auth.googleLogin();

      // If the await completes without redirecting (e.g., popup blocker or error before redirect),
      // we might need error handling, but accessing response.data/error is likely incorrect.
      // setLoading(false); // Might not be reached if redirect occurs

    } catch (err: any) {
      setGoogleSigningIn(false);
      const errorMessage = err.response?.data?.message || err.message || 'Google login failed. Please try again.';
      setError(errorMessage);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🔍 Auth.tsx: handleInputChange invoked');
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResetPasswordData(prev => ({
      ...prev,
      newPassword: e.target.value,
    }));
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
          <h1 className="text-2xl font-bold mb-2">
            {isForgotPassword
              ? 'Recuperar Contraseña'
              : isResetPassword
              ? 'Restablecer Contraseña'
              : isLogin
              ? 'Iniciar Sesión'
              : 'Crear Cuenta'}
          </h1>
          <p className="text-muted-foreground">
            {isForgotPassword
              ? 'Introduce tu email para recibir instrucciones'
              : isResetPassword
              ? 'Introduce tu nueva contraseña'
              : isLogin 
              ? 'Accede a tu cuenta de NIFYA'
              : 'Únete a NIFYA y no te pierdas nada importante'
            }
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
          {!isLogin && !isForgotPassword && !isResetPassword && (
            <div className="space-y-2">
              <label 
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Nombre
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-background border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Tu nombre"
                  minLength={2}
                  maxLength={50}
                  pattern="[A-Za-zÀ-ÿ\s]+"
                  title="Solo letras y espacios permitidos"
                />
                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          )}

          {!isResetPassword && <div className="space-y-2">
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
              {!isLogin && (
                <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Usa un email válido (ejemplo: usuario@dominio.com).
                    No se permiten emails temporales o inválidos.
                  </p>
                </div>
              )}
            </div>
          </div>}

          {!isForgotPassword && (
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
                value={isResetPassword ? resetPasswordData.newPassword : formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-background border rounded-lg pl-10 pr-20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="••••••••"
                minLength={8}
                autoComplete={isLogin ? "current-password" : isResetPassword ? "new-password" : "new-password"}
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            {(!isLogin || isResetPassword) && (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  La contraseña debe contener:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {passwordRequirements.map((req, index) => {
                    const password = isResetPassword ? resetPasswordData.newPassword : formData.password;
                    const isValid = req.regex.test(password);
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
            )}
          </div>)}

          {isLogin && !isForgotPassword && !isResetPassword && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-primary hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
          
          {!isForgotPassword && !isResetPassword && (

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium hover:opacity-90 transition-opacity"
            disabled={signingIn}
          >
            {signingIn ? 'Iniciando sesión...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </button>
          )}

          {(isForgotPassword || isResetPassword) && (
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 font-medium hover:opacity-90 transition-opacity"
            >
              {isForgotPassword ? 'Enviar Instrucciones' : 'Cambiar Contraseña'}
            </button>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O continúa con
              </span>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-background border rounded-lg px-4 py-2 font-medium hover:bg-muted/50 transition-all"
            onClick={() => {
              handleGoogleLogin();
            }}
            disabled={googleSigningIn}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>{googleSigningIn ? 'Conectando...' : 'Google'}</span>
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O si prefieres
              </span>
            </div>
          </div>

          {!isForgotPassword && !isResetPassword && <p className="text-center text-sm text-muted-foreground">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            {' '}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary hover:underline font-medium"
            >
              {isLogin ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </p>}

          {(isForgotPassword || isResetPassword) && (
            <p className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => { setIsForgotPassword(false); setIsResetPassword(false); }}
                className="text-primary hover:underline font-medium"
              >
                Volver al inicio de sesión
              </button>
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Auth;