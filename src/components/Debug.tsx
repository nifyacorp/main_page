import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { collectDiagnosticInfo, formatDiagnosticInfo, testBackendConnectivity } from '../lib/utils/diagnostics';
import { backendClientWithMethods as api } from '../lib/api/clients/backend';
import { useToast } from './ui/use-toast';

export default function Debug() {
  const [info, setInfo] = useState(collectDiagnosticInfo());
  const [connectivityResult, setConnectivityResult] = useState<any>(null);
  const [testingApi, setTestingApi] = useState(false);
  const [testingBackend, setTestingBackend] = useState(false);
  const [apiResults, setApiResults] = useState<Record<string, any>>({});
  const { toast } = useToast();

  useEffect(() => {
    // Log diagnostic info to console
    console.group('🩺 Debug Component Mounted');
    console.log('Diagnostic info:', info);
    console.groupEnd();
  }, [info]);

  const refreshDiagnostics = () => {
    setInfo(collectDiagnosticInfo());
    toast({
      title: "Diagnostics Refreshed",
      description: "Diagnostic information has been updated",
    });
  };

  const testConnectivity = async () => {
    setTestingBackend(true);
    try {
      const result = await testBackendConnectivity();
      setConnectivityResult(result);
      toast({
        title: result.success ? "Connection Test Successful" : "Connection Test Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error: any) {
      setConnectivityResult({ success: false, message: error.message, details: error });
      toast({
        title: "Connection Test Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTestingBackend(false);
    }
  };

  const testSubscriptionsApi = async () => {
    setTestingApi(true);
    const results: Record<string, any> = {};

    try {
      // Test subscriptions endpoint - the one that's failing
      console.group('Testing Subscriptions API');
      console.log('Sending request to /v1/subscriptions');
      const subscriptionsResult = await api.get('/v1/subscriptions');
      results.subscriptions = {
        status: subscriptionsResult.status,
        ok: subscriptionsResult.ok,
        error: subscriptionsResult.error,
        data: subscriptionsResult.data,
      };
      console.log('Subscriptions API Response:', subscriptionsResult);
      console.groupEnd();

      toast({
        title: subscriptionsResult.ok ? "Subscriptions API Test Successful" : "Subscriptions API Test Failed",
        description: subscriptionsResult.ok ? 
          `Received ${subscriptionsResult.data?.subscriptions?.length || 0} subscriptions` : 
          subscriptionsResult.error,
        variant: subscriptionsResult.ok ? "default" : "destructive",
      });
    } catch (error: any) {
      console.error('Error testing subscriptions API:', error);
      results.subscriptions = {
        status: 0,
        ok: false,
        error: error.message,
      };
      
      toast({
        title: "Subscriptions API Test Error",
        description: error.message,
        variant: "destructive",
      });
    }

    // Update results state
    setApiResults(results);
    setTestingApi(false);
  };

  const testNotificationsApi = async () => {
    setTestingApi(true);
    const results: Record<string, any> = apiResults;

    try {
      // Test notifications endpoint - which seems to be working
      console.group('Testing Notifications API');
      console.log('Sending request to /v1/notifications');
      const notificationsResult = await api.get('/v1/notifications');
      results.notifications = {
        status: notificationsResult.status,
        ok: notificationsResult.ok,
        error: notificationsResult.error,
        data: notificationsResult.data,
      };
      console.log('Notifications API Response:', notificationsResult);
      console.groupEnd();

      toast({
        title: notificationsResult.ok ? "Notifications API Test Successful" : "Notifications API Test Failed",
        description: notificationsResult.ok ? 
          `Received ${notificationsResult.data?.notifications?.length || 0} notifications` : 
          notificationsResult.error,
        variant: notificationsResult.ok ? "default" : "destructive",
      });
    } catch (error: any) {
      console.error('Error testing notifications API:', error);
      results.notifications = {
        status: 0,
        ok: false,
        error: error.message,
      };
      
      toast({
        title: "Notifications API Test Error",
        description: error.message,
        variant: "destructive",
      });
    }

    // Update results state
    setApiResults(results);
    setTestingApi(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">NIFYA Frontend Diagnostics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Environment Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-[400px]">
              {formatDiagnosticInfo(info)}
            </pre>
            <Button 
              onClick={refreshDiagnostics}
              className="mt-4"
            >
              Refresh Diagnostics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <Button 
                onClick={testConnectivity}
                disabled={testingBackend}
                className="w-full"
              >
                {testingBackend ? 'Testing Backend Connectivity...' : 'Test Backend Connectivity'}
              </Button>

              <Button 
                onClick={testSubscriptionsApi}
                disabled={testingApi}
                className="w-full"
              >
                {testingApi ? 'Testing Subscriptions API...' : 'Test Subscriptions API'}
              </Button>

              <Button 
                onClick={testNotificationsApi}
                disabled={testingApi}
                className="w-full"
              >
                {testingApi ? 'Testing Notifications API...' : 'Test Notifications API'}
              </Button>
              
              {connectivityResult && (
                <div className="mt-4">
                  <h3 className="font-bold mb-2">Backend Connectivity Test Result:</h3>
                  <div className={`p-2 rounded ${connectivityResult.success ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                    <p><strong>Status:</strong> {connectivityResult.success ? 'Success' : 'Failed'}</p>
                    <p><strong>Message:</strong> {connectivityResult.message}</p>
                    {connectivityResult.details && (
                      <details>
                        <summary className="cursor-pointer">Details</summary>
                        <pre className="text-xs mt-2 overflow-auto max-h-[200px]">
                          {JSON.stringify(connectivityResult.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              {Object.keys(apiResults).length > 0 && (
                <div className="mt-4">
                  <h3 className="font-bold mb-2">API Test Results:</h3>
                  {Object.entries(apiResults).map(([endpoint, result]) => (
                    <div key={endpoint} className={`p-2 rounded mb-2 ${result.ok ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                      <p><strong>Endpoint:</strong> {endpoint}</p>
                      <p><strong>Status:</strong> {result.status} ({result.ok ? 'Success' : 'Failed'})</p>
                      {result.error && <p><strong>Error:</strong> {result.error}</p>}
                      {result.data && (
                        <details>
                          <summary className="cursor-pointer">Response Data</summary>
                          <pre className="text-xs mt-2 overflow-auto max-h-[200px]">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}