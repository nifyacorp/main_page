import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangleIcon,
  BellIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  EyeIcon,
  FileTextIcon,
  MailIcon,
  MoreHorizontalIcon,
  BuildingIcon,
  CalendarIcon,
  ClockIcon,
} from 'lucide-react';
import { format, subDays, subHours } from 'date-fns';

// Sample data - would be fetched from API in real app
const generateNotifications = () => {
  const now = new Date();
  
  return [
    { 
      id: '1', 
      title: 'New Tax Law Amendment', 
      summary: 'Amendments to the tax law regulations affecting corporate taxation rates.',
      source: 'BOE',
      sourceIcon: <FileTextIcon className="h-4 w-4" />,
      subscriptionId: '1',
      subscriptionName: 'BOE Legal Updates',
      date: format(subHours(now, 2), 'PPpp'),
      read: false, 
      important: true,
      url: 'https://www.boe.es/example/12345'
    },
    { 
      id: '2', 
      title: 'Public Tender Announcement', 
      summary: 'New public tender for infrastructure development in Galicia region.',
      source: 'DOGA',
      sourceIcon: <BuildingIcon className="h-4 w-4" />,
      subscriptionId: '2',
      subscriptionName: 'DOGA Regulatory Changes',
      date: format(subHours(now, 6), 'PPpp'),
      read: false, 
      important: false,
      url: 'https://www.xunta.gal/dog/example/67890'
    },
    { 
      id: '3', 
      title: 'Corporate Compliance Update', 
      summary: 'Updated requirements for corporate compliance reporting in financial sector.',
      source: 'BOE',
      sourceIcon: <FileTextIcon className="h-4 w-4" />,
      subscriptionId: '1',
      subscriptionName: 'BOE Legal Updates',
      date: format(subDays(now, 1), 'PPpp'),
      read: true, 
      important: true,
      url: 'https://www.boe.es/example/23456'
    },
    { 
      id: '4', 
      title: 'Environmental Permit Changes', 
      summary: 'Changes to environmental permit requirements for industrial facilities.',
      source: 'DOGA',
      sourceIcon: <BuildingIcon className="h-4 w-4" />,
      subscriptionId: '4',
      subscriptionName: 'Environmental Regulations',
      date: format(subDays(now, 1), 'PPpp'),
      read: true, 
      important: false,
      url: 'https://www.xunta.gal/dog/example/78901'
    },
    { 
      id: '5', 
      title: 'New Court Ruling on Data Protection', 
      summary: 'Supreme Court ruling on data protection regulations and compliance requirements.',
      source: 'BOE',
      sourceIcon: <FileTextIcon className="h-4 w-4" />,
      subscriptionId: '1',
      subscriptionName: 'BOE Legal Updates',
      date: format(subDays(now, 2), 'PPpp'),
      read: true, 
      important: true,
      url: 'https://www.boe.es/example/34567'
    },
    { 
      id: '6', 
      title: 'Regional Development Grants', 
      summary: 'Announcement of new grants for business development in rural areas.',
      source: 'DOGA',
      sourceIcon: <BuildingIcon className="h-4 w-4" />,
      subscriptionId: '2',
      subscriptionName: 'DOGA Regulatory Changes',
      date: format(subDays(now, 3), 'PPpp'),
      read: true, 
      important: false,
      url: 'https://www.xunta.gal/dog/example/89012'
    },
    { 
      id: '7', 
      title: 'Tax Filing Deadline Extension', 
      summary: 'Extension of tax filing deadlines for quarterly returns.',
      source: 'BOE',
      sourceIcon: <FileTextIcon className="h-4 w-4" />,
      subscriptionId: '3',
      subscriptionName: 'Tax Law Updates',
      date: format(subDays(now, 4), 'PPpp'),
      read: true, 
      important: true,
      url: 'https://www.boe.es/example/45678'
    }
  ];
};

export default function Notifications() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const subscriptionFilter = searchParams.get('subscription');
  
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [importanceFilter, setImportanceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, fetch notifications from API
    const notificationData = generateNotifications();
    
    // Apply subscription filter from URL if present
    if (subscriptionFilter) {
      setNotifications(notificationData.filter(n => n.subscriptionId === subscriptionFilter));
    } else {
      setNotifications(notificationData);
    }
  }, [subscriptionFilter]);

  // Apply filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = 
      filter === 'all' || 
      (filter === 'unread' && !notification.read) || 
      (filter === 'read' && notification.read);
      
    const matchesSourceFilter = 
      sourceFilter === 'all' || 
      notification.source === sourceFilter;
      
    const matchesImportanceFilter = 
      importanceFilter === 'all' || 
      (importanceFilter === 'important' && notification.important) || 
      (importanceFilter === 'regular' && !notification.important);
      
    const matchesSearch = 
      searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.summary.toLowerCase().includes(searchTerm.toLowerCase());
      
    return matchesReadFilter && matchesSourceFilter && matchesImportanceFilter && matchesSearch;
  });

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Get notification counts for filtering
  const unreadCount = notifications.filter(n => !n.read).length;
  const readCount = notifications.filter(n => n.read).length;
  const boeCount = notifications.filter(n => n.source === 'BOE').length;
  const dogaCount = notifications.filter(n => n.source === 'DOGA').length;
  const importantCount = notifications.filter(n => n.important).length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">
          {subscriptionFilter 
            ? `Viewing notifications for a specific subscription` 
            : `Stay updated with notifications from your subscriptions`}
        </p>
      </div>

      {/* Filters section */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Tabs 
            defaultValue={filter} 
            value={filter} 
            onValueChange={setFilter} 
            className="w-full md:w-auto"
          >
            <TabsList>
              <TabsTrigger value="all">
                All <Badge variant="secondary" className="ml-1">{notifications.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>
              </TabsTrigger>
              <TabsTrigger value="read">
                Read <Badge variant="secondary" className="ml-1">{readCount}</Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead} 
              disabled={unreadCount === 0}
            >
              <CheckCircleIcon className="mr-2 h-4 w-4" />
              Mark all as read
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search" className="text-sm text-muted-foreground mb-2 block">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="source-filter" className="text-sm text-muted-foreground mb-2 block">
              Source
            </Label>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger id="source-filter">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="BOE">BOE ({boeCount})</SelectItem>
                <SelectItem value="DOGA">DOGA ({dogaCount})</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="importance-filter" className="text-sm text-muted-foreground mb-2 block">
              Importance
            </Label>
            <Select value={importanceFilter} onValueChange={setImportanceFilter}>
              <SelectTrigger id="importance-filter">
                <SelectValue placeholder="Filter by importance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="important">Important ({importantCount})</SelectItem>
                <SelectItem value="regular">Regular ({notifications.length - importantCount})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table view for larger screens */}
      <div className="hidden md:block">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[350px]">Notification</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <TableRow key={notification.id} className={!notification.read ? "bg-muted/40" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-start gap-3">
                        {notification.important ? (
                          <AlertTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <BellIcon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className={`font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                            {notification.title}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                            {notification.summary}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={notification.source === 'BOE' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}>
                        <span className="flex items-center">
                          {notification.sourceIcon}
                          <span className="ml-1">{notification.source}</span>
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link to={`/subscriptions/${notification.subscriptionId}`} className="text-sm text-primary hover:underline">
                        {notification.subscriptionName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {notification.date}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                            <span className="sr-only">Mark as read</span>
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                        >
                          <a href={notification.url} target="_blank" rel="noopener noreferrer">
                            <EyeIcon className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </a>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontalIcon className="h-4 w-4" />
                              <span className="sr-only">More</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <a href={notification.url} target="_blank" rel="noopener noreferrer">
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View Original
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/subscriptions/${notification.subscriptionId}`}>
                                <FileTextIcon className="mr-2 h-4 w-4" />
                                View Subscription
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => markAsRead(notification.id)} disabled={notification.read}>
                              <CheckCircleIcon className="mr-2 h-4 w-4" />
                              Mark as Read
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <MailIcon className="mr-2 h-4 w-4" />
                              Forward via Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No notifications found matching your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Card view for mobile */}
      <div className="md:hidden space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <Card key={notification.id} className={!notification.read ? "bg-muted/40" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    {notification.important ? (
                      <AlertTriangleIcon className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <BellIcon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <CardTitle className={`text-base ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {notification.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {notification.summary}
                      </CardDescription>
                    </div>
                  </div>
                  {!notification.read && (
                    <Badge variant="secondary">New</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <Badge variant="outline" className={notification.source === 'BOE' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}>
                      <span className="flex items-center">
                        {notification.sourceIcon}
                        <span className="ml-1">{notification.source}</span>
                      </span>
                    </Badge>
                    <div className="flex items-center text-muted-foreground">
                      <ClockIcon className="mr-1 h-3 w-3" />
                      {notification.date}
                    </div>
                  </div>
                  <div className="pt-1">
                    <Link to={`/subscriptions/${notification.subscriptionId}`} className="text-sm text-primary hover:underline flex items-center">
                      <FileTextIcon className="mr-1 h-3.5 w-3.5" />
                      {notification.subscriptionName}
                    </Link>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckCircleIcon className="mr-2 h-3.5 w-3.5" />
                        Mark as read
                      </Button>
                    )}
                    <Button 
                      variant={notification.read ? "default" : "outline"}
                      size="sm" 
                      asChild
                      className="ml-auto"
                    >
                      <a href={notification.url} target="_blank" rel="noopener noreferrer">
                        <EyeIcon className="mr-2 h-3.5 w-3.5" />
                        View Original
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <BellIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No notifications found</p>
              <p className="text-muted-foreground mb-6">
                We couldn't find any notifications matching your filters.
              </p>
              <Button variant="outline" onClick={() => {
                setFilter('all');
                setSourceFilter('all');
                setImportanceFilter('all');
                setSearchTerm('');
              }}>
                Clear filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 