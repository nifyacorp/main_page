import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';

/**
 * A debug component for testing subscription API functionality
 * Displays API request/response details and provides tools for diagnostics
 */
export function SubscriptionApiDebug() {
  const { user, getAccessToken } = useAuth();
  const { toast } = useToast();
  const [apiUrl, setApiUrl] = useState<string>('');
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [requestDetails, setRequestDetails] = useState<{
    url: string;
    method: string;
    headers: Record<string, string>;
    data?: any;
  } | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string>>({});
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [requestOptions, setRequestOptions] = useState<{
    withCredentials: boolean;
    timeout: number;
  }>({
    withCredentials: true,
    timeout: 10000,
  });

  // Discover the API URL
  useEffect(() => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || window.location.origin;
    setApiUrl(`${apiBaseUrl}/api/v1/subscriptions`);
  }, []);

  // Make an API call to test connectivity
  const testConnection = async (endpoint = '', method = 'GET', data = null) => {
    setLoadingState('loading');
    setApiResponse(null);
    setErrorMessage('');
    
    try {
      const token = await getAccessToken();
      const url = `${apiUrl}${endpoint}`;
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Request-Id': `debug-${Date.now()}`,
      };
      
      setRequestDetails({
        url,
        method,
        headers,
        data: data ? JSON.stringify(data, null, 2) : undefined,
      });
      
      const startTime = Date.now();
      
      const response = await axios({
        url,
        method,
        headers,
        data,
        withCredentials: requestOptions.withCredentials,
        timeout: requestOptions.timeout,
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      setResponseStatus(response.status);
      setResponseHeaders(response.headers as Record<string, string>);
      setApiResponse(response.data);
      setLoadingState('success');
      
      toast({
        title: 'API Request Successful',
        description: `Received ${response.status} response in ${responseTime}ms`,
        variant: 'default',
      });
    } catch (error) {
      setLoadingState('error');
      
      if (axios.isAxiosError(error)) {
        setResponseStatus(error.response?.status || 0);
        setResponseHeaders(error.response?.headers as Record<string, string> || {});
        setErrorMessage(error.message);
        
        if (error.response) {
          setApiResponse(error.response.data);
        }
        
        toast({
          title: `API Error: ${error.response?.status || 'Network Error'}`,
          description: error.message,
          variant: 'destructive',
        });
      } else {
        setErrorMessage(String(error));
        toast({
          title: 'API Error',
          description: String(error),
          variant: 'destructive',
        });
      }
    }
  };

  const renderJsonWithHighlighting = (data: any) => {
    if (!data) return 'No data';
    
    try {
      const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      return (
        <pre className="text-xs overflow-auto max-h-96 p-4 bg-slate-100 dark:bg-slate-900 rounded-md">
          {jsonString}
        </pre>
      );
    } catch (e) {
      return <pre>Error parsing JSON: {String(e)}</pre>;
    }
  };

  const getStatusBadge = (status: number | null) => {
    if (!status) return null;
    
    let variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' = 'default';
    
    if (status >= 200 && status < 300) variant = 'success';
    else if (status >= 400 && status < 500) variant = 'secondary';
    else if (status >= 500) variant = 'destructive';
    
    return (
      <Badge 
        variant={variant} 
        className="ml-2"
      >
        Status: {status}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          Subscription API Diagnostics
          {responseStatus && getStatusBadge(responseStatus)}
        </CardTitle>
        <CardDescription>
          Test and debug subscription API connectivity
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">API Endpoint:</label>
              <div className="flex">
                <input
                  type="text"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Timeout (ms):</label>
                <input
                  type="number"
                  value={requestOptions.timeout}
                  onChange={(e) => setRequestOptions({
                    ...requestOptions,
                    timeout: parseInt(e.target.value),
                  })}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
              <div className="flex items-center mt-6">
                <input
                  type="checkbox"
                  id="withCredentials"
                  checked={requestOptions.withCredentials}
                  onChange={(e) => setRequestOptions({
                    ...requestOptions,
                    withCredentials: e.target.checked,
                  })}
                  className="mr-2"
                />
                <label htmlFor="withCredentials" className="text-sm">
                  Include Credentials
                </label>
              </div>
            </div>
          </div>
          
          {/* User info */}
          {user && (
            <Alert>
              <AlertTitle>Logged in as {user.email}</AlertTitle>
              <AlertDescription>
                User ID: {user.id}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Test buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => testConnection()} 
              disabled={loadingState === 'loading'}
              variant="default"
            >
              Test GET Subscriptions
            </Button>
            
            <Button 
              onClick={() => testConnection('/stats', 'GET')} 
              disabled={loadingState === 'loading'}
              variant="outline"
            >
              Test GET Stats
            </Button>
            
            <Button 
              onClick={() => testConnection('', 'POST', {
                name: 'Debug Test Subscription',
                type: 'boe',
                prompts: ['test', 'debug'],
                frequency: 'daily',
                description: 'Created through debug tool'
              })} 
              disabled={loadingState === 'loading'}
              variant="secondary"
            >
              Test Create Subscription
            </Button>
          </div>
          
          {/* Loading state */}
          {loadingState === 'loading' && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm">Loading...</p>
            </div>
          )}
          
          {/* Error message */}
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}
          
          {/* Results */}
          {(apiResponse || requestDetails) && (
            <Tabs defaultValue="response" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="response">Response</TabsTrigger>
                <TabsTrigger value="request">Request Details</TabsTrigger>
                <TabsTrigger value="headers">Response Headers</TabsTrigger>
              </TabsList>
              
              <TabsContent value="response" className="p-4 border rounded-md mt-2">
                <h3 className="text-sm font-medium mb-2">Response Data:</h3>
                {renderJsonWithHighlighting(apiResponse)}
              </TabsContent>
              
              <TabsContent value="request" className="p-4 border rounded-md mt-2">
                <h3 className="text-sm font-medium mb-2">Request Details:</h3>
                {requestDetails && (
                  <div className="space-y-2">
                    <p><strong>URL:</strong> {requestDetails.url}</p>
                    <p><strong>Method:</strong> {requestDetails.method}</p>
                    <div>
                      <p><strong>Headers:</strong></p>
                      {renderJsonWithHighlighting(requestDetails.headers)}
                    </div>
                    {requestDetails.data && (
                      <div>
                        <p><strong>Body:</strong></p>
                        {renderJsonWithHighlighting(requestDetails.data)}
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="headers" className="p-4 border rounded-md mt-2">
                <h3 className="text-sm font-medium mb-2">Response Headers:</h3>
                {renderJsonWithHighlighting(responseHeaders)}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-xs text-gray-500">
          API Endpoint: {apiUrl}
        </p>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            setApiResponse(null);
            setErrorMessage('');
            setRequestDetails(null);
            setResponseHeaders({});
            setResponseStatus(null);
            setLoadingState('idle');
          }}
        >
          Clear Results
        </Button>
      </CardFooter>
    </Card>
  );
}