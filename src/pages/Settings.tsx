import React, { useState, useEffect } from 'react';
import { user } from '../lib/api';
import type { UserProfile } from '../lib/api/types';
import { ProfileSection } from '../components/settings/ProfileSection';
import { AppearanceSection } from '../components/settings/AppearanceSection';
import { NotificationsSection } from '../components/settings/NotificationsSection';
import { PreferencesSection } from '../components/settings/PreferencesSection';
import { SecuritySection } from '../components/settings/SecuritySection';

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState<Partial<UserProfile>>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingSections, setSavingSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.group('⚙️ Settings - Profile Fetch');
        console.log('Fetching user profile data');
        
        const { data, error } = await user.getProfile();
        
        if (error) {
          console.error('Profile fetch failed:', error);
          throw new Error(error);
        }

        if (data?.profile) {
          console.log('Profile data received:', {
            ...data.profile,
            email: '***@***.***' // Mask sensitive data
          });
          setProfile(data.profile);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    };

    fetchProfile();
  }, []);

  const handleFieldChange = (updates: Partial<UserProfile>) => {
    setUnsavedChanges(prev => ({ ...prev, ...updates }));
  };

  const handleSectionUpdate = async (section: string, updates: Partial<UserProfile>) => {
    try {
      console.group(`🔄 ${section} Update Flow`);
      console.log('Starting section update:', section);
      console.log('Update payload:', updates);

      setSavingSections(prev => ({ ...prev, [section]: true }));
      setError(null);
      
      const { data, error } = await user.updateProfile(updates);
      
      if (error) {
        console.error('Section update failed:', error);
        throw new Error(error);
      }

      if (data?.profile) {
        console.log('Section updated successfully');
        setProfile(data.profile);
        setUnsavedChanges(prev => {
          const newChanges = { ...prev };
          Object.keys(updates).forEach(key => delete newChanges[key]);
          return newChanges;
        });
        setSuccessMessage(`${section} actualizado correctamente`);
      }
    } catch (err) {
      console.error('Section update failed:', err);
      setError(err instanceof Error ? err.message : `Error al actualizar ${section.toLowerCase()}`);
    } finally {
      setSavingSections(prev => ({ ...prev, [section]: false }));
      console.groupEnd();
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      console.group('🖼️ Avatar Upload Process');
      console.log('Step 1: Validating file');
      
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('La imagen no puede superar los 2MB');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('El archivo debe ser una imagen');
      }

      setUploadingAvatar(true);
      setError(null);

      console.log('Step 2: Converting file to base64');
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Error al leer el archivo'));
        reader.readAsDataURL(file);
      });

      const base64Data = await base64Promise;
      
      console.log('Step 3: Updating profile with new avatar');
      const { data, error: updateError } = await user.updateProfile({
        avatar: base64Data
      });

      if (updateError) {
        throw new Error(updateError);
      }

      if (data?.profile) {
        console.log('Step 4: Profile updated successfully');
        setProfile(data.profile);
        setSuccessMessage('Foto de perfil actualizada correctamente');
      }

      console.log('✅ Avatar upload completed successfully');
    } catch (err) {
      console.error('❌ Avatar upload failed:', err);
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setUploadingAvatar(false);
      console.groupEnd();
    }
  };

  const handleSaveChanges = async () => {
    if (Object.keys(unsavedChanges).length === 0) {
      return;
    }

    try {
      console.group('🔄 Profile Update Flow');
      console.log('Step 1: Starting profile update');
      console.log('Current profile state:', {
        ...profile,
        email: profile?.email ? '***@***.***' : null
      });
      console.log('Update payload:', unsavedChanges);

      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      console.log('Step 2: Making API request to /api/users/me');
      console.log('Request details:', {
        method: 'PATCH',
        endpoint: '/api/users/me',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ***'
        },
        body: unsavedChanges
      });
      
      const { data, error } = await user.updateProfile(unsavedChanges);
      
      if (error) {
        console.error('Step 3 Failed: API request error');
        console.error('Error details:', error);
        throw new Error(error);
      }

      if (data?.profile) {
        console.log('Step 3 Success: Profile updated');
        console.log('Response data:', {
          ...data.profile,
          email: '***@***.***'
        });

        console.log('Step 4: Updating local state');
        setProfile(data.profile);
        setUnsavedChanges({});
        setSuccessMessage('Cambios guardados correctamente');
        
        console.log('✅ Profile update completed successfully');
      }
    } catch (err) {
      console.error('❌ Profile update failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
      console.groupEnd();
    }
  };

  const hasUnsavedChanges = Object.keys(unsavedChanges).length > 0;

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-muted rounded" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <div className="h-6 w-32 bg-muted rounded" />
                <div className="h-24 w-full bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Ajustes</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="mb-4 p-4 bg-green-500/10 text-green-600 rounded-lg">
            {successMessage}
          </div>
        )}

        <ProfileSection
          profile={profile}
          unsavedChanges={unsavedChanges}
          saving={savingSections['Perfil']}
          uploadingAvatar={uploadingAvatar}
          onFieldChange={handleFieldChange}
          onAvatarUpload={handleAvatarUpload}
          onSave={() => handleSectionUpdate('Perfil', {
            bio: unsavedChanges.bio
          })}
        />

        <AppearanceSection
          profile={profile}
          unsavedChanges={unsavedChanges}
          saving={savingSections['Apariencia']}
          onFieldChange={handleFieldChange}
          onSave={() => handleSectionUpdate('Apariencia', {
            theme: unsavedChanges.theme
          })}
        />

        <NotificationsSection
          profile={profile}
          unsavedChanges={unsavedChanges}
          saving={savingSections['Notificaciones']}
          onFieldChange={handleFieldChange}
          onSave={() => handleSectionUpdate('Notificaciones', {
            emailNotifications: unsavedChanges.emailNotifications,
            notificationEmail: unsavedChanges.notificationEmail
          })}
        />

        <PreferencesSection
          profile={profile}
          unsavedChanges={unsavedChanges}
          saving={savingSections['Preferencias']}
          onFieldChange={handleFieldChange}
          onSave={() => handleSectionUpdate('Preferencias', {
            language: unsavedChanges.language
          })}
        />

        <SecuritySection />

        {/* Save Changes Button */}
        <div className="mt-12 border-t pt-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {hasUnsavedChanges ? 'Tienes cambios sin guardar' : 'No hay cambios pendientes'}
            </p>
            <button
              onClick={handleSaveChanges}
              disabled={saving || !hasUnsavedChanges}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;