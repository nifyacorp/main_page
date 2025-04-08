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
import SubscriptionTypeSelector from './SubscriptionTypeSelector';
import { SubscriptionType } from '../../lib/api/services/subscription-types';

// Define form schema with Zod for validation
const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }).max(50, { message: 'Name must be less than 50 characters' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }).max(200, { message: 'Description must be less than 200 characters' }),
  source: z.enum(['BOE', 'DOGA']),
  keywords: z.array(z.string()).min(1, { message: 'At least one keyword is required' }),
  frequency: z.enum(['Instant', 'Daily', 'Weekly']),
  notificationType: z.enum(['email', 'webapp', 'both']).default('both'),
  emailNotifications: z.boolean().default(true),
  categories: z.array(z.string()).optional().default([]),
  advancedFilters: z.object({
    includeRegions: z.array(z.string()).optional().default([]),
    excludeSections: z.array(z.string()).optional().default([]),
    dateRange: z.object({
      enabled: z.boolean().default(false),
      startDate: z.string().optional().default(''),
      endDate: z.string().optional().default(''),
    }).optional().default({ enabled: false, startDate: '', endDate: '' }),
  }).optional().default({
    includeRegions: [],
    excludeSections: [],
    dateRange: { enabled: false, startDate: '', endDate: '' },
  }),
  filters: z.object({
    includePatterns: z.array(z.string()).optional().default([]),
    excludePatterns: z.array(z.string()).optional().default([]),
    dateRange: z.object({
      start: z.string().optional().default(''),
      end: z.string().optional().default(''),
    }).optional().default({ start: '', end: '' }),
  }).optional().default({
    includePatterns: [],
    excludePatterns: [],
    dateRange: { start: '', end: '' },
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface SubscriptionFormProps {
  initialData?: SubscriptionFormData;
  isEditing?: boolean;
}

const TemplateCard = ({ 
  title, 
  description, 
  icon: Icon, 
  defaultPrompts,
  frequency = "Real-time",
  onSelect 
}: { 
  title: string;
  description: string;
  icon: any;
  defaultPrompts: string[];
  frequency?: string;
  onSelect: () => void;
}) => (
  <Card className="relative overflow-hidden transition-all hover:shadow-md group">
    <CardHeader className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-primary/5 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <Badge variant="secondary" className="bg-secondary/30">
          {frequency}
        </Badge>
      </div>
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription className="text-sm text-muted-foreground">
        {description}
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Default Keywords:</h4>
        <div className="flex flex-wrap gap-2">
          {defaultPrompts.map((prompt, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {prompt}
            </Badge>
          ))}
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button 
        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" 
        variant="outline"
        onClick={onSelect}
      >
        Select Template
      </Button>
    </CardFooter>
    <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary rounded-lg transition-colors" />
  </Card>
);

export function SubscriptionForm({ initialData, isEditing = false }: SubscriptionFormProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('template');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newIncludePattern, setNewIncludePattern] = useState('');
  const [newExcludePattern, setNewExcludePattern] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(undefined);
  
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
    mode: 'onChange' // Validate fields on change for immediate feedback
  });
  
  // Set keywords from form values
  useEffect(() => {
    if (form.getValues('keywords')) {
      setKeywords(form.getValues('keywords'));
    }
  }, [form]);

  // Reset error message when form values change
  useEffect(() => {
    if (submitError) {
      setSubmitError(null);
    }
  }, [form.watch()]);
  
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
        const updatedPatterns = [...currentPatterns, newIncludePattern.trim()];
        form.setValue("filters.includePatterns", updatedPatterns, { shouldValidate: true });
      }
      setNewIncludePattern("");
    }
  };

  const handleAddExcludePattern = () => {
    if (newExcludePattern.trim() !== "") {
      const currentPatterns = form.getValues("filters.excludePatterns") || [];
      if (!currentPatterns.includes(newExcludePattern.trim())) {
        const updatedPatterns = [...currentPatterns, newExcludePattern.trim()];
        form.setValue("filters.excludePatterns", updatedPatterns, { shouldValidate: true });
      }
      setNewExcludePattern("");
    }
  };

  const handleRemovePattern = (pattern: string, type: 'include' | 'exclude') => {
    const field = type === 'include' ? 'filters.includePatterns' : 'filters.excludePatterns';
    const currentPatterns = form.getValues(field) || [];
    form.setValue(
      field,
      currentPatterns.filter((p) => p !== pattern),
      { shouldValidate: true }
    );
  };

  // Handle subscription type selection
  const handleSubscriptionTypeSelect = (type: SubscriptionType) => {
    setSelectedTypeId(type.id);
    
    // Update form with template values
    form.setValue('name', type.name, { shouldValidate: true });
    form.setValue('description', type.description, { shouldValidate: true });
    form.setValue('source', type.type.toUpperCase() as 'BOE' | 'DOGA', { shouldValidate: true });
    
    // Set keywords from template's default prompts
    if (type.defaultPrompts && type.defaultPrompts.length > 0) {
      setKeywords(type.defaultPrompts);
      form.setValue('keywords', type.defaultPrompts, { shouldValidate: true });
    }
    
    // Set frequency based on template metadata or default
    const frequencyMap: Record<string, 'Instant' | 'Daily' | 'Weekly'> = {
      'immediate': 'Instant',
      'daily': 'Daily',
      'weekly': 'Weekly'
    };
    
    const templateFrequency = (type.metadata?.frequency || 'immediate') as string;
    form.setValue('frequency', frequencyMap[templateFrequency] || 'Instant', { shouldValidate: true });
    
    // Move to the basic info tab after selecting a template
    setActiveTab('basic');
  };

  const onSubmit = (data: FormValues) => {
    setSubmitError(null);
    
    // Make sure we have at least one keyword
    if (!data.keywords || data.keywords.length === 0) {
      setSubmitError("At least one keyword is required");
      setActiveTab("basic");
      return;
    }
    
    try {
      // Create deep copy to avoid reference issues
      const formData = JSON.parse(JSON.stringify(data));
      
      // Ensure all required fields have default values if not provided
      if (!formData.notificationType) formData.notificationType = 'both';
      if (!formData.categories) formData.categories = [];
      
      // Ensure nested objects exist
      if (!formData.filters) {
        formData.filters = {
          includePatterns: [],
          excludePatterns: [],
          dateRange: { start: '', end: '' }
        };
      }
      
      if (!formData.advancedFilters) {
        formData.advancedFilters = {
          includeRegions: [],
          excludeSections: [],
          dateRange: { enabled: false, startDate: '', endDate: '' }
        };
      }
      
      // Add template ID if one was selected
      if (selectedTypeId) {
        formData.typeId = selectedTypeId;
      }
      
      if (isEditing && initialData) {
        updateSubscription.mutate({ 
          id: (initialData as any).id, 
          data: formData 
        }, {
          onError: (error) => {
            setSubmitError(error.message || "Failed to update subscription. Please try again.");
          },
          onSuccess: () => {
            navigate('/subscriptions');
          }
        });
      } else {
        createSubscription.mutate(formData, {
          onError: (error) => {
            setSubmitError(error.message || "Failed to create subscription. Please try again.");
          },
          onSuccess: () => {
            navigate('/subscriptions');
          }
        });
      }
    } catch (error) {
      console.error("Form submission error:", error);
      setSubmitError("An unexpected error occurred. Please try again.");
    }
  };

  // Sources list - would come from API in production
  const sources = [
    { value: "BOE", label: "BOE (Boletín Oficial del Estado)" },
    { value: "DOGA", label: "DOGA (Diario Oficial de Galicia)" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Tabs defaultValue={isEditing ? 'basic' : 'template'} value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          {!isEditing && <TabsTrigger value="template">Templates</TabsTrigger>}
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="notification">Notification Preferences</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6" data-testid="subscription-form">
            {/* Display form-wide error message if there is one */}
            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert" data-testid="form-error">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{submitError}</span>
              </div>
            )}
            
            {/* Template selection tab - only show for new subscriptions */}
            {!isEditing && (
              <TabsContent value="template" className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold">Choose a Template</h2>
                  <p className="text-gray-600">Select a pre-configured template or create a custom subscription</p>
                </div>
                
                <SubscriptionTypeSelector 
                  onSelect={handleSubscriptionTypeSelect}
                  selectedTypeId={selectedTypeId}
                />
                
                <div className="flex justify-center mt-4">
                  <Button 
                    onClick={() => setActiveTab('basic')}
                    variant="outline"
                    className="mx-2"
                  >
                    Skip and Create Custom
                  </Button>
                  
                  {selectedTypeId && (
                    <Button 
                      onClick={() => setActiveTab('basic')}
                      className="mx-2"
                    >
                      Continue with Selected Template
                    </Button>
                  )}
                </div>
              </TabsContent>
            )}
            
            <TabsContent value="basic" className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la suscripción</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Alertas de BOE" {...field} data-testid="name-input" />
                    </FormControl>
                    <FormDescription>
                      Un nombre descriptivo para identificar esta suscripción.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Breve descripción del propósito de esta suscripción" 
                        className="resize-none" 
                        {...field}
                        data-testid="description-input"
                      />
                    </FormControl>
                    <FormDescription>
                      Describe para qué sirve esta suscripción.
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
              
              <div>
                <FormLabel htmlFor="keywords">Keywords</FormLabel>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="keywords"
                    placeholder="Add a keyword"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button type="button" onClick={handleAddKeyword}>
                    Add
                  </Button>
                </div>
                <FormDescription>
                  Add keywords to track in publications
                </FormDescription>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="px-2 py-1">
                      {keyword}
                      <Button
                        type="button" 
                        variant="ghost" 
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="h-5 w-5 p-0 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                {form.formState.errors.keywords && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.keywords.message?.toString()}
                  </p>
                )}
              </div>
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
            
            <div className="flex justify-between mt-8">
              {activeTab !== 'basic' && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    const prevTab = activeTab === 'notification' ? 'basic' : 'notification';
                    setActiveTab(prevTab);
                  }}
                >
                  Previous
                </Button>
              )}
              
              {activeTab !== 'advanced' ? (
                <Button 
                  type="button" 
                  className="ml-auto"
                  onClick={() => {
                    const nextTab = activeTab === 'basic' ? 'notification' : 'advanced';
                    setActiveTab(nextTab);
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="ml-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? 'Update Subscription' : 'Create Subscription'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </Tabs>
    </div>
  );
} 