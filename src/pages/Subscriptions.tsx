import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  PlusIcon, 
  MoreHorizontalIcon, 
  PencilIcon, 
  TrashIcon, 
  ShareIcon, 
  BellIcon, 
  EyeIcon, 
  ClockIcon, 
  FileTextIcon,
  BuildingIcon,
  FolderIcon,
  ListFilterIcon
} from 'lucide-react';

// Sample data - would be fetched from API in real app
const subscriptionData = [
  { 
    id: 1, 
    name: "BOE Legal Updates", 
    description: "Updates on legal regulations published in BOE",
    source: "BOE", 
    frequency: "Instant", 
    keywords: ["law", "regulation", "legal"], 
    lastNotification: "2 hours ago", 
    status: "active", 
    notifications: 24,
    created: "10/02/2024"
  },
  { 
    id: 2, 
    name: "DOGA Regulatory Changes", 
    description: "Changes to regional regulations in Galicia",
    source: "DOGA", 
    frequency: "Daily", 
    keywords: ["regulation", "Galicia", "policy"], 
    lastNotification: "1 day ago", 
    status: "active", 
    notifications: 16,
    created: "15/01/2024"
  },
  { 
    id: 3, 
    name: "Tax Law Updates", 
    description: "Updates on tax legislation and regulations",
    source: "BOE", 
    frequency: "Weekly", 
    keywords: ["tax", "fiscal", "budget"], 
    lastNotification: "3 days ago", 
    status: "active", 
    notifications: 8,
    created: "05/12/2023"
  },
  { 
    id: 4, 
    name: "Environmental Regulations", 
    description: "Environmental policy updates and regulations",
    source: "DOGA", 
    frequency: "Instant", 
    keywords: ["environment", "ecological", "sustainability"], 
    lastNotification: "1 week ago", 
    status: "active", 
    notifications: 5,
    created: "22/11/2023"
  },
];

export default function Subscriptions() {
  const { user } = useAuth();
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [filterFrequency, setFilterFrequency] = useState('all');

  // Filter subscriptions based on search and filters
  const filteredSubscriptions = subscriptionData.filter(sub => {
    const matchesSearch = 
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      sub.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSource = filterSource === 'all' || sub.source === filterSource;
    const matchesFrequency = filterFrequency === 'all' || sub.frequency === filterFrequency;
    
    return matchesSearch && matchesSource && matchesFrequency;
  });

  // Simulate delete functionality
  const handleDelete = () => {
    // In a real app, this would call an API to delete the subscription
    console.log(`Deleting subscription with ID: ${selectedSubscription?.id}`);
    setIsDeleteDialogOpen(false);
    setSelectedSubscription(null);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage your notification subscriptions from official publication sources.
        </p>
      </div>

      <Tabs defaultValue="list" className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
          </TabsList>
          <Button asChild>
            <Link to="/subscriptions/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Subscription
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <Label htmlFor="search" className="text-sm text-muted-foreground mb-2 block">
              Search
            </Label>
            <div className="relative">
              <Input
                id="search"
                placeholder="Search by name, description or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="source-filter" className="text-sm text-muted-foreground mb-2 block">
              Source
            </Label>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger id="source-filter">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="BOE">BOE</SelectItem>
                <SelectItem value="DOGA">DOGA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="frequency-filter" className="text-sm text-muted-foreground mb-2 block">
              Frequency
            </Label>
            <Select value={filterFrequency} onValueChange={setFilterFrequency}>
              <SelectTrigger id="frequency-filter">
                <SelectValue placeholder="Filter by frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Frequencies</SelectItem>
                <SelectItem value="Instant">Instant</SelectItem>
                <SelectItem value="Daily">Daily</SelectItem>
                <SelectItem value="Weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List View */}
        <TabsContent value="list">
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Keywords</TableHead>
                  <TableHead>Last Update</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.length > 0 ? (
                  filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell className="font-medium">
                        <Link to={`/subscriptions/${subscription.id}`} className="hover:underline">
                          {subscription.name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-1">{subscription.description}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={subscription.source === 'BOE' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}>
                          {subscription.source}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <ClockIcon className="h-3 w-3 text-muted-foreground" />
                          <span>{subscription.frequency}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {subscription.keywords.slice(0, 2).map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {subscription.keywords.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{subscription.keywords.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{subscription.lastNotification}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontalIcon className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link to={`/subscriptions/${subscription.id}`}>
                                <EyeIcon className="h-4 w-4 mr-2" /> View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/subscriptions/${subscription.id}/edit`}>
                                <PencilIcon className="h-4 w-4 mr-2" /> Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/notifications?subscription=${subscription.id}`}>
                                <BellIcon className="h-4 w-4 mr-2" /> Notifications
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to={`/subscriptions/${subscription.id}/share`}>
                                <ShareIcon className="h-4 w-4 mr-2" /> Share
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                setSelectedSubscription(subscription);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <TrashIcon className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No subscriptions found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Grid View */}
        <TabsContent value="grid">
          {filteredSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubscriptions.map((subscription) => (
                <Card key={subscription.id} className="flex flex-col">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-xl font-bold">
                        <Link to={`/subscriptions/${subscription.id}`} className="hover:underline">
                          {subscription.name}
                        </Link>
                      </CardTitle>
                      <CardDescription>{subscription.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontalIcon className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link to={`/subscriptions/${subscription.id}`}>
                            <EyeIcon className="h-4 w-4 mr-2" /> View
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/subscriptions/${subscription.id}/edit`}>
                            <PencilIcon className="h-4 w-4 mr-2" /> Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/notifications?subscription=${subscription.id}`}>
                            <BellIcon className="h-4 w-4 mr-2" /> Notifications
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to={`/subscriptions/${subscription.id}/share`}>
                            <ShareIcon className="h-4 w-4 mr-2" /> Share
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <TrashIcon className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className={subscription.source === 'BOE' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-green-50 text-green-700 border-green-200'}>
                          {subscription.source}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {subscription.frequency}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium">Keywords</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {subscription.keywords.map((keyword, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2 border-t flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                          Last update: {subscription.lastNotification}
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/subscriptions/${subscription.id}/edit`}>
                        <PencilIcon className="h-3 w-3 mr-1" /> Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/notifications?subscription=${subscription.id}`}>
                        <BellIcon className="h-3 w-3 mr-1" /> Notifications ({subscription.notifications})
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 border rounded-lg bg-muted/20">
              <ListFilterIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-xl font-medium mb-2">No subscriptions found</p>
              <p className="text-muted-foreground mb-6">
                We couldn't find any subscriptions matching your filters.
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setFilterSource('all');
                setFilterFrequency('all');
              }}>
                Clear filters
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Subscription CTA */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle>Need to monitor more official publications?</CardTitle>
          <CardDescription>
            Create a new subscription to track different topics or sources
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-6 flex-col md:flex-row">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-blue-100">
                <FileTextIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="font-medium">BOE Monitoring</div>
            </div>
            <p className="text-sm text-muted-foreground pl-9">
              Track official state bulletins for legal updates, regulatory changes, and official announcements.
            </p>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-green-100">
                <BuildingIcon className="h-5 w-5 text-green-600" />
              </div>
              <div className="font-medium">DOGA Monitoring</div>
            </div>
            <p className="text-sm text-muted-foreground pl-9">
              Stay informed about regional publications, local regulations, and administrative decisions.
            </p>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-purple-100">
                <FolderIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div className="font-medium">Custom Categories</div>
            </div>
            <p className="text-sm text-muted-foreground pl-9">
              Create categorized subscriptions based on specific topics, keywords, or areas of interest.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full sm:w-auto">
            <Link to="/subscriptions/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New Subscription
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-md bg-muted/20 my-4">
            <p className="font-medium">{selectedSubscription?.name}</p>
            <p className="text-sm text-muted-foreground">{selectedSubscription?.description}</p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}