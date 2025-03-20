import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { backendClientWithMethods as api } from '../lib/api/clients/backend';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { useSubscriptionsEnhanced } from '../hooks/use-subscriptions-enhanced';
import { FALLBACK_SUBSCRIPTIONS } from '../lib/utils/fallback';

/**
 * Debug component specifically for subscription API issues
 */
export default function SubscriptionApiDebug() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [fixApplied, setFixApplied] = useState(false);
  
  // Enhanced subscription hook with fallbacks
  const { 
    subscriptions, 
    isUsingFallback,
    refetchSubscriptions,
    isLoadingSubscriptions 
  } = useSubscriptionsEnhanced();

  // Raw API test to diagnose the issue
  const testSubscriptionsApi = async () => {
    setIsLoading(true);
    try {
      console.group('Testing Subscriptions API');
      console.log('Sending direct request to /v1/subscriptions');
      
      // Direct API call without any wrapper
      const response = await api.get('/v1/subscriptions');
      
      setTestResults({
        status: response.status,
        ok: response.ok,
        error: response.error,
        data: response.data,
        timestamp: new Date().toISOString()
      });
      
      console.log('Response:', response);
      console.groupEnd();
    } catch (error: any) {
      console.error('Error testing subscriptions API:', error);
      
      setTestResults({
        status: 'exception',
        ok: false,
        error: error.message || 'Unknown error',
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Apply fallback solution to make the app functional
  const applyFallbackFix = () => {
    setFixApplied(true);
    
    // Force a refetch which will use our enhanced hook with fallbacks
    refetchSubscriptions();
  };

  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle>Subscription API Diagnostic</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isUsingFallback && (
            <Alert className="bg-amber-100 border-amber-300">
              <AlertTitle>Using Fallback Data</AlertTitle>
              <AlertDescription>
                The application is currently using fallback subscription data because the API returned an error.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col md:flex-row gap-4">
            <Button 
              onClick={testSubscriptionsApi} 
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              {isLoading ? 'Testing API...' : 'Test Subscriptions API'}
            </Button>
            
            <Button 
              onClick={applyFallbackFix}
              disabled={fixApplied || isLoadingSubscriptions}
              variant="default"
              className="flex-1"
            >
              {fixApplied ? 'Fallback Applied' : 'Apply Fallback Solution'}
            </Button>
          </div>
          
          {/* Current subscriptions state */}
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Current Subscriptions ({subscriptions.length})</h3>
            
            {subscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subscriptions found</p>
            ) : (
              <ul className="space-y-2">
                {subscriptions.map((sub: any) => (
                  <li key={sub.id} className="text-sm border p-2 rounded">
                    <strong>{sub.name}</strong> - {sub.description || 'No description'}
                    {sub.id.startsWith('fallback') && (
                      <span className="ml-2 text-amber-600 text-xs">(Fallback data)</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Test results */}
          {testResults && (
            <div className="mt-4 border rounded-md p-4">
              <h3 className="text-md font-medium mb-2">API Test Results</h3>
              <div className={`p-2 rounded ${testResults.ok ? 'bg-green-100' : 'bg-red-100'}`}>
                <p><strong>Status:</strong> {testResults.status}</p>
                <p><strong>Success:</strong> {testResults.ok ? 'Yes' : 'No'}</p>
                {testResults.error && <p><strong>Error:</strong> {testResults.error}</p>}
                <p><strong>Timestamp:</strong> {testResults.timestamp}</p>
                
                <details>
                  <summary className="cursor-pointer mt-2">Response Data</summary>
                  <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-[300px]">
                    {JSON.stringify(testResults.data || 'No data', null, 2)}
                  </pre>
                </details>
                
                {testResults.stack && (
                  <details>
                    <summary className="cursor-pointer mt-2">Stack Trace</summary>
                    <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-[300px]">
                      {testResults.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}
          
          {/* Fallback data information */}
          <div className="mt-4 border rounded-md p-4 bg-gray-50">
            <h3 className="text-md font-medium mb-2">Fallback Solution Information</h3>
            <p className="text-sm">
              This component implements a temporary workaround for the subscription API error by using 
              local fallback data when the API returns a 500 error. This allows the application to 
              remain functional while the backend issue is being resolved.
            </p>
            
            <details className="mt-2">
              <summary className="cursor-pointer">View Fallback Data</summary>
              <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-[300px]">
                {JSON.stringify(FALLBACK_SUBSCRIPTIONS, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}