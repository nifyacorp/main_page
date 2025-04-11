import React, { useState, useEffect } from 'react';
import { authService, UserProfile, ApiResponse } from '../api';
import { ProfileSection } from '../components/settings/ProfileSection';
import { EmailNotificationSettings } from '../components/settings/EmailNotificationSettings';
import { PreferencesSection } from '../components/settings/PreferencesSection';
import { SecuritySection } from '../components/settings/SecuritySection';

// Define interfaces for API responses
interface ProfileResponse {
  profile: UserProfile;
}

interface PreferencesResponse {
  preferences: Partial<UserProfile>;
}

const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [unsavedChanges, setUnsavedChanges] = useState<Partial<UserProfile>>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingSections, setSavingSections] = useState<Record<string, boolean>>({});
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [preferences, setPreferences] = useState<Partial<UserProfile> | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.group('⚙️ Settings - Profile Fetch');
        console.log('Fetching user profile data');
        
        const { data, error } = await authService.getProfile();
        
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

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        setLoadingPreferences(true);
        console.group('⚙️ Settings - Preferences Fetch');
        console.log('Fetching user preferences data');
        
        const { data, error } = await authService.getPreferences();
        
        if (error) {
          console.error('Preferences fetch failed:', error);
          // Don't throw error to prevent UI disruption - preferences are optional
          console.warn('Using profile data as fallback for preferences');
        } else if (data?.preferences) {
          console.log('Preferences data received');
          setPreferences(data.preferences);
        }
      } catch (err) {
        console.error('Error loading preferences:', err);
        // Don't set error state to prevent UI disruption
      } finally {
        setLoadingPreferences(false);
        console.groupEnd();
      }
    };

    if (profile) {
      fetchPreferences();
    }
  }, [profile]);

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
      
      if (section === 'Preferencias' && updates.language !== undefined) {
        const { data, error } = await authService.updatePreferences(updates);
        
        if (error) {
          console.error('Preferences update failed:', error);
          throw new Error(error);
        }

        if (data?.preferences) {
          console.log('Preferences updated successfully');
          setPreferences(data.preferences);
          setProfile(prev => prev ? { ...prev, ...updates } : null);
          setUnsavedChanges(prev => {
            const newChanges = { ...prev };
            Object.keys(updates).forEach(key => delete newChanges[key]);
            return newChanges;
          });
          setSuccessMessage(`${section} actualizado correctamente`);
        }
      } else {
        const { data, error } = await authService.updateProfile(updates);
        
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
      const { data, error: updateError } = await authService.updateProfile({
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
      
      const profileUpdates: Partial<UserProfile> = {};
      const preferencesUpdates: Partial<UserProfile> = {};
      
      Object.entries(unsavedChanges).forEach(([key, value]) => {
        if (key === 'language') {
          preferencesUpdates[key as 'language'] = value as any;
        } else {
          (profileUpdates as any)[key] = value;
        }
      });
      
      console.log('Profile updates:', profileUpdates);
      console.log('Preferences updates:', preferencesUpdates);
      
      const promises: Promise<ApiResponse<any>>[] = [];
      let profileResult: ApiResponse<ProfileResponse> | null = null;
      let preferencesResult: ApiResponse<PreferencesResponse> | null = null;
      
      if (Object.keys(profileUpdates).length > 0) {
        promises.push(
          authService.updateProfile(profileUpdates).then(result => {
            profileResult = result;
            return result;
          })
        );
      }
      
      if (Object.keys(preferencesUpdates).length > 0) {
        promises.push(
          authService.updatePreferences(preferencesUpdates).then(result => {
            preferencesResult = result;
            return result;
          })
        );
      }
      
      await Promise.all(promises);
      
      if (profileResult && profileResult.error) {
        throw new Error(profileResult.error);
      }
      
      if (preferencesResult && preferencesResult.error) {
        throw new Error(preferencesResult.error);
      }
      
      if (profileResult && profileResult.data?.profile) {
        setProfile(profileResult.data.profile);
      }
      
      if (preferencesResult && preferencesResult.data?.preferences) {
        setPreferences(preferencesResult.data.preferences);
        setProfile(prev => prev ? { 
          ...prev, 
          ...preferencesResult.data.preferences 
        } : null);
      }
      
      setUnsavedChanges({});
      setSuccessMessage('Cambios guardados correctamente');
      console.log('✅ Updates completed successfully');
    } catch (err) {
      console.error('❌ Updates failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
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

        <div className="mb-8">
          <EmailNotificationSettings />
        </div>

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