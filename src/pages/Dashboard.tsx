import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Building2, Bell, ChevronRight } from 'lucide-react';
import { user, subscriptions } from '../lib/api';

interface Subscription {
  id: string;
  type: 'boe' | 'real-estate' | 'custom';
  name: string;
  description: string;
  prompts: string[];
  frequency: 'immediate' | 'daily';
  active: boolean;
  created_at: string;
  updated_at: string;
  config?: {
    notificationFrequency: 'immediate' | 'daily';
    emailNotifications: boolean;
    customFields: Record<string, any>;
  };
}

interface NotificationCount {
  boe: number;
  realEstate: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const fetchActiveSubscriptions = async () => {
      try {
        console.group('📊 Active Subscriptions Fetch');
        console.log('Step 1: Checking authentication');
        
        const token = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');
        
        if (!token || !userId) {
          console.error('Missing authentication credentials');
          navigate('/auth');
          return;
        }

        console.log('Step 2: Fetching active subscriptions');
        const { data: subscriptionsData, error: subscriptionsError } = await subscriptions.list();

        if (subscriptionsError) {
          throw new Error(subscriptionsError);
        }

        console.log('Step 3: Fetching user profile for subscription configs');
        const { data: userData, error: userError } = await user.getProfile();
        
        if (userError) {
          throw new Error(userError);
        }

        console.log('User profile data:', {
          ...userData,
          profile: userData?.profile ? {
            ...userData.profile,
            email: '***@***.***' // Mask sensitive data
          } : null
        });

        console.log('Step 4: Combining subscriptions with configurations');
        const activeSubscriptionsWithConfig = subscriptionsData?.subscriptions
          .filter((sub: Subscription) => sub.active)
          .map((subscription: Subscription) => ({
            ...subscription,
            config: userData?.profile?.preferences?.activeSubscriptions?.[subscription.id] || {
              notificationFrequency: subscription.frequency,
              emailNotifications: true,
              customFields: {}
            }
          }));

        console.log('Final processed subscriptions:', activeSubscriptionsWithConfig);
        setActiveSubscriptions(activeSubscriptionsWithConfig);
        
        console.log('✅ Active subscriptions fetch completed successfully');
      } catch (err) {
        console.error('Failed to fetch active subscriptions:', err);
        if (err instanceof Error && err.message.toLowerCase().includes('unauthorized')) {
          navigate('/auth');
        }
      } finally {
        setLoading(false);
        console.groupEnd();
      }
    };

    fetchActiveSubscriptions();
  }, [navigate]);

  return (
    <div className="p-8">
      <div className="mx-auto max-w-4xl">
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Panel de Control</h1>
            </div>
            {loading && (
              <div className="text-sm text-muted-foreground">
                Cargando datos...
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <>
                <div className="p-6 rounded-lg border bg-card animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <div className="h-6 w-6 bg-primary/20 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-6 w-16 bg-muted rounded" />
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-lg border bg-card animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <div className="h-6 w-6 bg-primary/20 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-6 w-16 bg-muted rounded" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-6 rounded-lg border bg-card hover:bg-muted/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <FileText className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Alertas BOE</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg border bg-card hover:bg-muted/50 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Building2 className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Alertas Inmobiliarias</p>
                      <p className="text-2xl font-bold">0</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg border bg-card animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <div className="h-4 w-4 bg-primary/20 rounded" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-muted rounded" />
                        <div className="h-3 w-48 bg-muted rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeSubscriptions.length > 0 ? (
              <div className="space-y-4">
                {activeSubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-all cursor-pointer"
                    onClick={() => navigate('/subscriptions')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10">
                          {subscription.type === 'boe' ? (
                            <FileText className="h-4 w-4 text-primary" />
                          ) : (
                            <Building2 className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{subscription.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {subscription.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg bg-card">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No hay suscripciones activas.{' '}
                  <Link
                    to="/subscriptions/catalog"
                    className="text-primary hover:underline"
                  >
                    Crear una nueva
                  </Link>
                </p>
              </div>
            )}
          </div>
        </>
      </div>
    </div>
  );
};

export default Dashboard;