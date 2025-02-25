import React from 'react';
import { Bell, Mail } from 'lucide-react';
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
            onClick={() => onFieldChange({ emailNotifications: !profile?.emailNotifications })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              profile?.emailNotifications ? 'bg-primary' : 'bg-muted'
            }`}
            disabled={saving}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                profile?.emailNotifications ? 'translate-x-6' : 'translate-x-1'
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
              value={profile?.notificationEmail || ''}
              onChange={(e) => onFieldChange({ notificationEmail: e.target.value })}
              placeholder="tu@email.com"
              className="w-full pl-10 pr-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={saving}
            />
          </div>
          {(unsavedChanges.emailNotifications !== undefined || unsavedChanges.notificationEmail !== undefined) && (
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
    </div>
  );
};