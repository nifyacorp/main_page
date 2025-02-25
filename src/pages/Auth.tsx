import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Chrome, User, Check, X, AlertCircle } from 'lucide-react';
import { auth } from '../lib/api/index';

interface PasswordRequirement {
  regex: RegExp;
  message: string;
}

const passwordRequirements: PasswordRequirement[] = [
  { regex: /.{8,}/, message: 'Al menos 8 caracteres' },
  { regex: /[A-Z]/, message: 'Al menos una mayúscula' },
  { regex: /[0-9]/, message: 'Al menos un número' },
  { regex: /[!@#$%^&*(),.?":{}|<>]/, message: 'Al menos un carácter especial' },
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
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.state?.isLogin ?? true);
  const [signingIn, setSigningIn] = useState(false);
  const [googleSigningIn, setGoogleSigningIn] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: '',
  });
  const [resetPasswordData, setResetPasswordData] = useState<ResetPasswordData>({
    token: '',
    newPassword: '',
  });

  // Check for reset password token in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const resetToken = params.get('reset_token');
    if (resetToken) {
      setIsResetPassword(true);
      setResetPasswordData(prev => ({ ...prev, token: resetToken }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSigningIn(true);

    try {
      if (isForgotPassword) {
        const { error } = await auth.forgotPassword(formData.email);
        if (error) throw new Error(error);
        alert('Si tu email está registrado, recibirás instrucciones para restablecer tu contraseña.');
        setIsForgotPassword(false);
      } else if (isResetPassword) {
        const { error } = await auth.resetPassword(
          resetPasswordData.token,
          resetPasswordData.newPassword
        );
        if (error) throw new Error(error);
        alert('Contraseña actualizada correctamente');
        window.location.href = '/auth';
      } else if (isLogin) {
        const { error, data } = await auth.login({
          email: formData.email,
          password: formData.password
        });
        if (error) throw new Error(error);
        
        // Store auth state after successful login
        if (data?.accessToken) {
          localStorage.setItem('accessToken', data.accessToken);
        }
        if (data?.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        localStorage.setItem('isAuthenticated', 'true');
        
        window.location.href = '/dashboard';
      } else {
        console.group('📝 Signup Process');
        console.log('Attempting signup with:', {
          email: formData.email,
          name: formData.name,
          password: '********'
        });
        
        const { error } = await auth.signup(formData.email, formData.password, formData.name);
        
        console.log('Signup response received');
        console.groupEnd();
        
        if (error) throw new Error(error);
        setSuccessMessage('¡Cuenta creada correctamente! Por favor, verifica tu email para activar tu cuenta.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error');
    } finally {
      setSigningIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleSigningIn(true);
      const { data, error } = await auth.googleLogin();
      if (error) throw new Error(error);
      
      if (data?.state && data?.authUrl) {
        // Store state for verification
        sessionStorage.setItem('oauth_state', data.state);
        // Redirect to Google's authorization page
        window.location.href = data.authUrl;
      } else {
        throw new Error('Invalid response from Google login initialization');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ha ocurrido un error');
      setGoogleSigningIn(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            <Chrome className="h-5 w-5 text-[#4285F4]" />
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