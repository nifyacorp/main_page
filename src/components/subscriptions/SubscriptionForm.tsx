import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  FileTextIcon,
  BuildingIcon,
  InfoIcon,
  AlertTriangleIcon,
  XIcon,
  PlusIcon,
  X,
  Plus,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area";

import { useSubscriptions } from "@/hooks/use-subscriptions";
import { SubscriptionFormData } from "@/services/api/subscription-service";

// Define form schema with Zod for validation
const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }).max(50, { message: 'Name must be less than 50 characters' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }).max(200, { message: 'Description must be less than 200 characters' }),
  source: z.enum(['BOE', 'DOGA']),
  keywords: z.array(z.string()).min(1, { message: 'At least one keyword is required' }),
  frequency: z.enum(['Instant', 'Daily', 'Weekly']),
  notificationType: z.enum(['email', 'webapp', 'both']),
  emailNotifications: z.boolean().default(true),
  categories: z.array(z.string()).optional(),
  advancedFilters: z.object({
    includeRegions: z.array(z.string()).optional(),
    excludeSections: z.array(z.string()).optional(),
    dateRange: z.object({
      enabled: z.boolean().default(false),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional(),
  }).optional(),
  filters: z.object({
    includePatterns: z.array(z.string()).optional(),
    excludePatterns: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SubscriptionFormProps {
  initialData?: SubscriptionFormData;
  isEditing?: boolean;
}

export function SubscriptionForm({ initialData, isEditing = false }: SubscriptionFormProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newIncludePattern, setNewIncludePattern] = useState('');
  const [newExcludePattern, setNewExcludePattern] = useState('');
  
  const { createSubscription, updateSubscription } = useSubscriptions();
  const isSubmitting = createSubscription.isLoading || updateSubscription.isLoading;

  // Initialize the form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      source: 'BOE',
      keywords: [],
      frequency: 'Instant',
      notificationType: 'both',
      emailNotifications: true,
      categories: [],
      advancedFilters: {
        includeRegions: [],
        excludeSections: [],
        dateRange: {
          enabled: false,
          startDate: '',
          endDate: '',
        },
      },
      filters: {
        includePatterns: [],
        excludePatterns: [],
        dateRange: {
          start: '',
          end: '',
        },
      },
    },
  });
  
  // Set keywords from form values
  useEffect(() => {
    if (form.getValues('keywords')) {
      setKeywords(form.getValues('keywords'));
    }
  }, [form]);
  
  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      const newKeywords = [...keywords, keywordInput.trim()];
      setKeywords(newKeywords);
      form.setValue('keywords', newKeywords, { shouldValidate: true });
      setKeywordInput('');
    }
  };
  
  const handleRemoveKeyword = (keyword: string) => {
    const newKeywords = keywords.filter(k => k !== keyword);
    setKeywords(newKeywords);
    form.setValue('keywords', newKeywords, { shouldValidate: true });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const handleAddIncludePattern = () => {
    if (newIncludePattern.trim() !== "") {
      const currentPatterns = form.getValues("filters.includePatterns") || [];
      if (!currentPatterns.includes(newIncludePattern.trim())) {
        form.setValue("filters.includePatterns", [...currentPatterns, newIncludePattern.trim()]);
      }
      setNewIncludePattern("");
    }
  };

  const handleAddExcludePattern = () => {
    if (newExcludePattern.trim() !== "") {
      const currentPatterns = form.getValues("filters.excludePatterns") || [];
      if (!currentPatterns.includes(newExcludePattern.trim())) {
        form.setValue("filters.excludePatterns", [...currentPatterns, newExcludePattern.trim()]);
      }
      setNewExcludePattern("");
    }
  };

  const handleRemovePattern = (pattern: string, type: 'include' | 'exclude') => {
    const field = type === 'include' ? 'filters.includePatterns' : 'filters.excludePatterns';
    const currentPatterns = form.getValues(field) || [];
    form.setValue(
      field,
      currentPatterns.filter((p) => p !== pattern)
    );
  };

  const onSubmit = (data: FormValues) => {
    if (isEditing && initialData) {
      updateSubscription.mutate({ 
        id: (initialData as any).id, 
        data 
      });
    } else {
      createSubscription.mutate(data);
    }
  };

  // Sources list - would come from API in production
  const sources = [
    { value: "BOE", label: "BOE (Boletín Oficial del Estado)" },
    { value: "DOGA", label: "DOGA (Diario Oficial de Galicia)" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Tabs defaultValue="basic" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="notification">Notification Preferences</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
            <TabsContent value="basic" className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subscription Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a name for this subscription" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for your subscription
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a source" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sources.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the official publication source
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="notification" className="space-y-4">
              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notification Frequency</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Instant">Instant (As soon as published)</SelectItem>
                        <SelectItem value="Daily">Daily Digest</SelectItem>
                        <SelectItem value="Weekly">Weekly Digest</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose how often you want to receive notifications
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notificationType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Notification Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="email" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Email only
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="webapp" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Web app only
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="both" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Both email and web app
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Include full publication text in emails
                      </FormLabel>
                      <FormDescription>
                        If unchecked, only a summary with a link will be sent
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>
                      Fine-tune your subscription with advanced filters
                    </CardDescription>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="icon">
                          <InfoIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Advanced settings allow you to filter notifications more precisely. These are optional.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
                    <p className="text-sm text-muted-foreground">These settings are optional and can be configured later</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <FormLabel>Include Patterns</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add pattern to include"
                          value={newIncludePattern}
                          onChange={(e) => setNewIncludePattern(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddIncludePattern())}
                        />
                        <Button type="button" onClick={handleAddIncludePattern} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <ScrollArea className="h-20 mt-2">
                        <div className="flex flex-wrap gap-2">
                          {form.getValues("filters.includePatterns")?.map((pattern) => (
                            <Badge key={pattern} variant="outline" className="p-2">
                              {pattern}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-2"
                                onClick={() => handleRemovePattern(pattern, 'include')}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                    
                    <div>
                      <FormLabel>Exclude Patterns</FormLabel>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add pattern to exclude"
                          value={newExcludePattern}
                          onChange={(e) => setNewExcludePattern(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddExcludePattern())}
                        />
                        <Button type="button" onClick={handleAddExcludePattern} size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <ScrollArea className="h-20 mt-2">
                        <div className="flex flex-wrap gap-2">
                          {form.getValues("filters.excludePatterns")?.map((pattern) => (
                            <Badge key={pattern} variant="outline" className="p-2">
                              {pattern}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 ml-2"
                                onClick={() => handleRemovePattern(pattern, 'exclude')}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  );
} 