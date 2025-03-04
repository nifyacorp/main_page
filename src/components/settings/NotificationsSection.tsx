import React from 'react';
import { Bell, Mail, Zap } from 'lucide-react';
import type { UserProfile } from '../../lib/api/types';

interface NotificationsSectionProps {
  profile: UserProfile | null;
  unsavedChanges: Partial<UserProfile>;
  saving: boolean;
  onFieldChange: (updates: Partial<UserProfile>) => void;
  onSave: () => void;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  profile,
  unsavedChanges,
  saving,
  onFieldChange,
  onSave
}) => {
  // Hardcoded for testing
  const isTestUser = profile?.email === 'nifyacorp@gmail.com';

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Bell className="h-5 w-5" />
        Notificaciones
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div>
            <p className="font-medium">Notificaciones por email</p>
            <p className="text-sm text-muted-foreground">
              Recibe alertas en tu correo electrónico
            </p>
          </div>
          <button
            onClick={() => onFieldChange({ 
              notification_settings: {
                ...profile?.notification_settings,
                emailNotifications: !(profile?.notification_settings?.emailNotifications ?? false)
              }
            })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              profile?.notification_settings?.emailNotifications ? 'bg-primary' : 'bg-muted'
            }`}
            disabled={saving}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                profile?.notification_settings?.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Email de notificaciones</p>
              <p className="text-sm text-muted-foreground">
                Dirección donde recibirás las alertas
              </p>
            </div>
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <input
              type="email"
              value={profile?.notification_settings?.notificationEmail || ''}
              onChange={(e) => onFieldChange({ 
                notification_settings: {
                  ...profile?.notification_settings,
                  notificationEmail: e.target.value
                }
              })}
              placeholder="tu@email.com"
              className="w-full pl-10 pr-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={saving}
            />
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Frecuencia de notificaciones</p>
              <p className="text-sm text-muted-foreground">
                Elige cuándo quieres recibir tus notificaciones
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                checked={(profile?.notification_settings?.emailFrequency || 'daily') === 'daily'}
                onChange={() => onFieldChange({ 
                  notification_settings: {
                    ...profile?.notification_settings,
                    emailFrequency: 'daily'
                  }
                })}
                className="rounded-full"
                disabled={saving}
              />
              <span>Resumen diario (recomendado)</span>
            </label>
          </div>
        </div>

        {isTestUser && (
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div>
              <p className="font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                Notificaciones instantáneas
              </p>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones inmediatamente (solo para pruebas)
              </p>
            </div>
            <button
              onClick={() => onFieldChange({ 
                notification_settings: {
                  ...profile?.notification_settings,
                  instantNotifications: !(profile?.notification_settings?.instantNotifications ?? false)
                }
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                profile?.notification_settings?.instantNotifications ? 'bg-yellow-500' : 'bg-muted'
              }`}
              disabled={saving}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                  profile?.notification_settings?.instantNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {(unsavedChanges.notification_settings !== undefined) && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};