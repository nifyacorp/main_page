import React from 'react';
import { Globe } from 'lucide-react';
import type { UserProfile } from '../../lib/api/types';

interface PreferencesSectionProps {
  profile: UserProfile | null;
  unsavedChanges: Partial<UserProfile>;
  saving: boolean;
  onFieldChange: (updates: Partial<UserProfile>) => void;
  onSave: () => void;
}

export const PreferencesSection: React.FC<PreferencesSectionProps> = ({
  profile,
  unsavedChanges,
  saving,
  onFieldChange,
  onSave
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Globe className="h-5 w-5" />
        Preferencias
      </h2>
      <div className="space-y-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Idioma</p>
              <p className="text-sm text-muted-foreground">
                Selecciona el idioma de la aplicación
              </p>
            </div>
          </div>
          <select
            value={profile?.language || 'es'}
            onChange={(e) => onFieldChange({ language: e.target.value as 'es' | 'en' | 'ca' })}
            className="w-full px-4 py-2 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={saving}
          >
            <option value="es">Español</option>
            <option value="en">English</option>
            <option value="ca">Català</option>
          </select>
          {unsavedChanges.language !== undefined && (
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