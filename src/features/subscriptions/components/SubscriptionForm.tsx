import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  SubscriptionType, 
  CreateSubscriptionDto,
  UpdateSubscriptionDto
} from '../services/subscription-service';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface SubscriptionFormProps {
  subscriptionType: SubscriptionType;
  initialValues?: Partial<CreateSubscriptionDto | UpdateSubscriptionDto>;
  onSubmit: (values: any) => Promise<void>;
  isLoading?: boolean;
  isEdit?: boolean;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  subscriptionType,
  initialValues,
  onSubmit,
  isLoading = false,
  isEdit = false,
}) => {
  // Create dynamic schema based on subscription type fields
  const [formSchema, setFormSchema] = useState<z.ZodObject<any>>();
  
  // Create schema from subscription type fields
  useEffect(() => {
    if (!subscriptionType) return;
    
    const schemaFields: Record<string, any> = {
      name: z.string().min(1, 'Nombre de suscripción es requerido'),
    };
    
    // Define config schema based on subscription type fields
    const configFields: Record<string, any> = {};
    
    subscriptionType.fields.forEach(field => {
      let fieldSchema;
      
      // Create schema based on field type
      switch (field.type) {
        case 'text':
          fieldSchema = z.string();
          break;
        case 'number':
          fieldSchema = z.string().refine(val => !isNaN(Number(val)), {
            message: 'Debe ser un número válido',
          });
          break;
        case 'select':
          fieldSchema = z.string();
          break;
        case 'date':
          fieldSchema = z.date().optional();
          break;
        case 'boolean':
          fieldSchema = z.boolean();
          break;
        case 'textarea':
          fieldSchema = z.string();
          break;
        default:
          fieldSchema = z.string();
      }
      
      // Make field required if specified
      if (field.required) {
        fieldSchema = fieldSchema.refine(val => !!val, {
          message: `${field.label} es requerido`,
        });
      } else {
        fieldSchema = fieldSchema.optional();
      }
      
      configFields[field.name] = fieldSchema;
    });
    
    schemaFields.config = z.object(configFields);
    
    // If edit mode, make fields optional
    if (isEdit) {
      schemaFields.name = schemaFields.name.optional();
    }
    
    setFormSchema(z.object(schemaFields));
  }, [subscriptionType, isEdit]);
  
  // Create form once schema is available
  const form = useForm<any>({
    resolver: formSchema ? zodResolver(formSchema) : undefined,
    defaultValues: {
      name: initialValues?.name || '',
      config: initialValues?.config || {},
    },
  });
  
  // Update form values when initialValues change
  useEffect(() => {
    if (initialValues) {
      form.reset({
        name: initialValues.name || '',
        config: initialValues.config || {},
      });
    }
  }, [initialValues, form]);
  
  if (!subscriptionType || !formSchema) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  const handleSubmit = async (values: any) => {
    try {
      await onSubmit(values);
      if (!isEdit) {
        form.reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la suscripción</FormLabel>
              <FormControl>
                <Input placeholder="Nombre descriptivo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Subscription type fields */}
        <Card>
          <CardContent className="p-6 space-y-6">
            <h3 className="text-lg font-semibold">{subscriptionType.name}</h3>
            <p className="text-sm text-muted-foreground">{subscriptionType.description}</p>
            
            {subscriptionType.fields.map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={`config.${field.name}`}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </FormLabel>
                    <FormControl>
                      {(() => {
                        switch (field.type) {
                          case 'text':
                            return (
                              <Input
                                placeholder={field.placeholder || ''}
                                {...formField}
                              />
                            );
                          case 'number':
                            return (
                              <Input
                                type="number"
                                placeholder={field.placeholder || ''}
                                {...formField}
                                onChange={(e) => formField.onChange(e.target.value)}
                              />
                            );
                          case 'select':
                            return (
                              <Select
                                value={formField.value}
                                onValueChange={formField.onChange}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={field.placeholder || 'Seleccione una opción'} />
                                </SelectTrigger>
                                <SelectContent>
                                  {field.options?.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            );
                          case 'date':
                            return (
                              <DatePicker
                                value={formField.value ? new Date(formField.value) : undefined}
                                onChange={formField.onChange}
                              />
                            );
                          case 'boolean':
                            return (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  checked={formField.value}
                                  onCheckedChange={formField.onChange}
                                  id={`checkbox-${field.name}`}
                                />
                                <label
                                  htmlFor={`checkbox-${field.name}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {field.help || ''}
                                </label>
                              </div>
                            );
                          case 'textarea':
                            return (
                              <Textarea
                                placeholder={field.placeholder || ''}
                                {...formField}
                              />
                            );
                          default:
                            return (
                              <Input
                                placeholder={field.placeholder || ''}
                                {...formField}
                              />
                            );
                        }
                      })()}
                    </FormControl>
                    {field.help && (
                      <p className="text-sm text-muted-foreground">{field.help}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Actualizar suscripción' : 'Crear suscripción'}
        </Button>
      </form>
    </Form>
  );
};

export default SubscriptionForm;