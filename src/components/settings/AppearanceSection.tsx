import React from 'react';
import { Sun } from 'lucide-react';
import type { UserProfile } from '../../lib/api/types';

interface AppearanceSectionProps {
  profile: UserProfile | null;
  unsavedChanges: Partial<UserProfile>;
  saving: boolean;
  onFieldChange: (updates: Partial<UserProfile>) => void;
  onSave: () => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  profile,
  unsavedChanges,
  onFieldChange,
  onSave,
  saving
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sun className="h-5 w-5" />
        Apariencia
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div>
            <p className="font-medium">Modo oscuro</p>
            <p className="text-sm text-muted-foreground">
              Cambia entre el tema claro y oscuro
            </p>
          </div>
          <button
            onClick={() => onFieldChange({ theme: profile?.theme === 'dark' ? 'light' : 'dark' })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              profile?.theme === 'dark' ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                profile?.theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          {unsavedChanges.theme !== undefined && (
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