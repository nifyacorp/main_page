import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth';
import apiClient from '@/api/clients/api-client';

const Debug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [apiUrl, setApiUrl] = useState('');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Environment info
  const envInfo = {
    NODE_ENV: import.meta.env.MODE,
    VITE_AUTH_URL: import.meta.env.VITE_AUTH_URL || 'Not set',
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'Not set',
    VITE_SUBSCRIPTION_WORKER: import.meta.env.VITE_SUBSCRIPTION_WORKER || 'Not set',
  };

  // Auth info
  const authInfo = {
    isAuthenticated,
    user,
    accessToken: localStorage.getItem('accessToken') || 'Not set',
    userId: localStorage.getItem('userId') || 'Not set',
  };

  // Handle API request
  const handleApiRequest = async () => {
    if (!apiUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.get(apiUrl);
      setApiResponse(response);
    } catch (err) {
      console.error('API request error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setApiResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Debug Panel</CardTitle>
          <CardDescription>Herramientas para diagnosticar problemas en la aplicación</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="env">
            <TabsList className="mb-4">
              <TabsTrigger value="env">Environment</TabsTrigger>
              <TabsTrigger value="auth">Authentication</TabsTrigger>
              <TabsTrigger value="api">API Tester</TabsTrigger>
            </TabsList>
            
            {/* Environment Information */}
            <TabsContent value="env">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Environment Variables</h3>
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm">
                    {JSON.stringify(envInfo, null, 2)}
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            {/* Authentication Information */}
            <TabsContent value="auth">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Authentication State</h3>
                <div className="rounded-md bg-muted p-4">
                  <pre className="text-sm">
                    {JSON.stringify(authInfo, null, 2)}
                  </pre>
                </div>
              </div>
            </TabsContent>
            
            {/* API Tester */}
            <TabsContent value="api">
              <div className="space-y-4">
                <div className="flex items-end gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="apiUrl">API Endpoint</Label>
                    <Input
                      id="apiUrl"
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                      placeholder="/api/endpoint"
                    />
                  </div>
                  <Button onClick={handleApiRequest} disabled={isLoading || !apiUrl}>
                    {isLoading ? 'Loading...' : 'Test'}
                  </Button>
                </div>
                
                {error && (
                  <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                    {error}
                  </div>
                )}
                
                {apiResponse && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Response</h4>
                    <div className="rounded-md bg-muted p-4 max-h-96 overflow-auto">
                      <pre className="text-sm">
                        {JSON.stringify(apiResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Debug;