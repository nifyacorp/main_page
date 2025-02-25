import React from 'react';
import { User } from 'lucide-react';
import type { UserProfile } from '../../lib/api/types';

interface ProfileSectionProps {
  profile: UserProfile | null;
  unsavedChanges: Partial<UserProfile>;
  saving: boolean;
  uploadingAvatar: boolean;
  onFieldChange: (updates: Partial<UserProfile>) => void;
  onSave: () => void;
  onAvatarUpload: (file: File) => Promise<void>;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  profile,
  unsavedChanges,
  saving,
  uploadingAvatar,
  onFieldChange,
  onAvatarUpload,
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <User className="h-5 w-5" />
        Perfil
      </h2>
      <div className="space-y-4">
        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Foto de perfil</p>
              <p className="text-sm text-muted-foreground">
                Personaliza tu imagen de perfil
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-primary/40" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  className={`px-4 py-2 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors text-sm font-medium flex items-center justify-center gap-2 ${
                    uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={uploadingAvatar || saving}
                >
                  {uploadingAvatar ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    'Subir nueva foto'
                  )}
                </button>
                {profile?.avatar && (
                  <button
                    onClick={() => onFieldChange({ avatar: null })}
                    className="px-4 py-2 bg-destructive/10 text-destructive rounded-md hover:bg-destructive/20 transition-colors text-sm font-medium"
                    disabled={uploadingAvatar || saving}
                  >
                    Eliminar foto
                  </button>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Formatos permitidos: JPG, PNG. Tamaño máximo: 2MB
              </p>
            </div>
            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/jpeg,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  onAvatarUpload(file);
                }
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-lg border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Sobre ti</p>
              <p className="text-sm text-muted-foreground">
                Cuéntanos un poco sobre ti y tus intereses
              </p>
            </div>
          </div>
          <textarea
            value={unsavedChanges.bio ?? profile?.bio ?? ''}
            onChange={(e) => onFieldChange({ bio: e.target.value })}
            placeholder="Ej: Soy un emprendedor interesado en tecnología y oportunidades de negocio..."
            className="w-full h-32 px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            disabled={saving}
          />
          <p className="mt-2 text-sm text-muted-foreground">
            {(profile?.bio?.length || 0)}/500 caracteres
          </p>
          {unsavedChanges.bio !== undefined && (
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