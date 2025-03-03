import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Building2, Bell, ChevronRight } from 'lucide-react';
import { user, subscriptions } from '../lib/api';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  PlusIcon, 
  AlertTriangleIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({
    activeSubscriptions: 4,
    notificationsToday: 3,
    totalNotifications: 57,
    unreadNotifications: 2
  });

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
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || 'User'}! Here's what's happening with your subscriptions.
        </p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                12%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications Today</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notificationsToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-red-500 inline-flex items-center">
                <ArrowDownIcon className="h-3 w-3 mr-1" />
                5%
              </span>{" "}
              from yesterday
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotifications}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUpIcon className="h-3 w-3 mr-1" />
                7%
              </span>{" "}
              from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadNotifications}</div>
            <div className="text-xs text-muted-foreground mt-1">
              <Link to="/notifications" className="text-primary hover:underline">View all notifications</Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Activity Chart */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
                <CardDescription>
                  Your notification volume over the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip 
                      formatter={(value) => [`${value} notifications`, 'Volume']}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        borderColor: 'hsl(var(--border))' 
                      }}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="notifications" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Your latest notifications and updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notificationData.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="flex items-start gap-3 border-b pb-3 last:border-0">
                      <div className="mt-1">
                        {notification.read ? (
                          <CheckCircleIcon className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Bell className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {notification.source}
                          </Badge>
                          <p className="text-xs text-muted-foreground flex items-center">
                            <ClockIcon className="h-3 w-3 mr-1" />
                            {notification.date}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link to="/notifications">View All Notifications</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Quick Links */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Create Subscription</CardTitle>
                <CardDescription>
                  Set up a new notification subscription
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Define new keywords, categories, or sources to monitor for relevant publications.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link to="/subscriptions/new">
                    <PlusIcon className="mr-2 h-4 w-4" />
                    New Subscription
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Manage Subscriptions</CardTitle>
                <CardDescription>
                  Review and modify your existing subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Update your settings, keywords, or notification frequency for your subscriptions.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/subscriptions">
                    <FileText className="mr-2 h-4 w-4" />
                    View Subscriptions
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="flex flex-col justify-between">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Update notification settings, contact information, or subscription details.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/settings">Settings</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Subscriptions</h2>
            <Button asChild>
              <Link to="/subscriptions/new">
                <PlusIcon className="mr-2 h-4 w-4" />
                New Subscription
              </Link>
            </Button>
          </div>
          
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Notification</TableHead>
                  <TableHead className="text-right">Notifications</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptionData.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">
                      <Link to={`/subscriptions/${subscription.id}`} className="hover:underline">
                        {subscription.name}
                      </Link>
                    </TableCell>
                    <TableCell>{subscription.source}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>{subscription.lastNotification}</TableCell>
                    <TableCell className="text-right">{subscription.notifications}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Notifications</h2>
            <Link to="/notifications" className="text-primary hover:underline text-sm">
              View all notifications
            </Link>
          </div>
          
          <Card>
            <ScrollArea className="h-[400px] rounded-md">
              <div className="p-4 space-y-4">
                {notificationData.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 border rounded-lg flex items-start gap-4 ${
                      !notification.read ? 'bg-muted/30' : ''
                    }`}
                  >
                    <div className="mt-1">
                      {notification.important ? (
                        <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
                      ) : (
                        <Bell className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <Badge variant="secondary" className="ml-2">New</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <Badge variant="outline">
                          {notification.source}
                        </Badge>
                        <span className="text-muted-foreground flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {notification.date}
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        {!notification.read && (
                          <Button variant="ghost" size="sm">Mark as Read</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;