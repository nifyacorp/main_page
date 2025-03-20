import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsItem, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionApiDebug } from '@/components/SubscriptionApiDebug';
import { useSubscriptionsEnhanced } from '@/hooks/use-subscriptions-enhanced';
import { useSubscriptions } from '@/hooks/use-subscriptions';
import { Separator } from '@/components/ui/separator';

/**
 * Debug page for developers and administrators to test system functionality
 */
export default function DebugPage() {
  const regularHook = useSubscriptions();
  const enhancedHook = useSubscriptionsEnhanced();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">System Diagnostics</h1>
      
      <Tabs defaultValue="subscription-api">
        <TabsList className="mb-4">
          <TabsTrigger value="subscription-api">Subscription API</TabsTrigger>
          <TabsTrigger value="data-comparison">Data Comparison</TabsTrigger>
          <TabsTrigger value="system-info">System Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="subscription-api">
          <div className="space-y-6">
            <SubscriptionApiDebug />
          </div>
        </TabsContent>
        
        <TabsContent value="data-comparison">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Standard Hook Data</CardTitle>
                <CardDescription>
                  Using standard hook without fallback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Subscriptions:</h3>
                    <pre className="text-xs overflow-auto max-h-60 p-4 bg-slate-100 dark:bg-slate-900 rounded-md">
                      {JSON.stringify(regularHook.subscriptions, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Stats:</h3>
                    <pre className="text-xs overflow-auto max-h-40 p-4 bg-slate-100 dark:bg-slate-900 rounded-md">
                      {JSON.stringify(regularHook.stats, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Status:</h3>
                    <ul className="text-sm">
                      <li>Loading: {regularHook.isLoadingSubscriptions ? 'Yes' : 'No'}</li>
                      <li>Error: {regularHook.isErrorSubscriptions ? 'Yes' : 'No'}</li>
                      <li>Using Fallback: N/A</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Enhanced Hook Data</CardTitle>
                <CardDescription>
                  Using enhanced hook with fallback capability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Subscriptions:</h3>
                    <pre className="text-xs overflow-auto max-h-60 p-4 bg-slate-100 dark:bg-slate-900 rounded-md">
                      {JSON.stringify(enhancedHook.subscriptions, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Stats:</h3>
                    <pre className="text-xs overflow-auto max-h-40 p-4 bg-slate-100 dark:bg-slate-900 rounded-md">
                      {JSON.stringify(enhancedHook.stats, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Status:</h3>
                    <ul className="text-sm">
                      <li>Loading: {enhancedHook.isLoadingSubscriptions ? 'Yes' : 'No'}</li>
                      <li>Error: {enhancedHook.isErrorSubscriptions ? 'Yes' : 'No'}</li>
                      <li>Using Fallback: {enhancedHook.usingFallback ? 'Yes' : 'No'}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="system-info">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Runtime environment details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Environment Variables:</h3>
                  <pre className="text-xs overflow-auto max-h-60 p-4 bg-slate-100 dark:bg-slate-900 rounded-md">
                    {`VITE_API_URL: ${import.meta.env.VITE_API_URL || 'Not set (using default)'}\n`}
                    {`VITE_AUTH_URL: ${import.meta.env.VITE_AUTH_URL || 'Not set (using default)'}\n`}
                    {`VITE_ENV: ${import.meta.env.VITE_ENV || 'Not set'}\n`}
                    {`MODE: ${import.meta.env.MODE}`}
                  </pre>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Browser Information:</h3>
                  <ul className="text-sm space-y-1">
                    <li><strong>User Agent:</strong> {navigator.userAgent}</li>
                    <li><strong>Platform:</strong> {navigator.platform}</li>
                    <li><strong>Language:</strong> {navigator.language}</li>
                    <li><strong>Online Status:</strong> {navigator.onLine ? 'Online' : 'Offline'}</li>
                    <li><strong>Cookies Enabled:</strong> {navigator.cookieEnabled ? 'Yes' : 'No'}</li>
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Debug Actions:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
                      onClick={() => {
                        enhancedHook.refetchSubscriptions();
                        regularHook.refetchSubscriptions();
                      }}
                    >
                      Refetch All Data
                    </button>
                    
                    <button 
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md text-sm"
                      onClick={() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        alert('Local storage and session storage cleared');
                      }}
                    >
                      Clear Local Storage
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}