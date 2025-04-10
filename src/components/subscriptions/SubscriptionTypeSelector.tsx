import { useState, useEffect } from 'react';
import { subscriptionTypesService, SubscriptionType } from '../../lib/api/services/subscription-types';

interface SubscriptionTypeSelectorProps {
  onSelect: (type: SubscriptionType) => void;
  selectedTypeId?: string;
}

export default function SubscriptionTypeSelector({ onSelect, selectedTypeId }: SubscriptionTypeSelectorProps) {
  const [types, setTypes] = useState<SubscriptionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch subscription types on component mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        setLoading(true);
        const response = await subscriptionTypesService.list();
        
        if (response.ok && response.data?.data?.types) {
          setTypes(response.data.data.types);
        } else {
          setError('Failed to load subscription templates');
          console.error('Failed to load subscription types:', response.error);
        }
      } catch (err) {
        setError('An error occurred while loading subscription templates');
        console.error('Error fetching subscription types:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTypes();
  }, []);

  // Handle selection of a subscription type
  const handleTypeSelect = (type: SubscriptionType) => {
    onSelect(type);
  };

  if (loading) {
    return <div className="p-4 text-center">Loading subscription templates...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (types.length === 0) {
    return <div className="p-4 text-center">No subscription templates available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {types.map((type) => (
        <div
          key={type.id}
          onClick={() => handleTypeSelect(type)}
          className={`
            cursor-pointer p-4 rounded-lg border transition-all
            ${selectedTypeId === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
          `}
        >
          <div className="flex items-center mb-2">
            {type.icon && (
              <img 
                src={type.logo_url || type.icon} 
                alt={type.display_name || type.name} 
                className="w-6 h-6 mr-2" 
              />
            )}
            <h3 className="text-lg font-medium">{type.display_name || type.name}</h3>
            {type.is_system && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                System
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">{type.description}</p>
          {type.metadata?.default_prompts && Array.isArray(type.metadata.default_prompts) && type.metadata.default_prompts.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-gray-500">Default prompts:</span>
              <ul className="mt-1 list-disc pl-5 text-xs text-gray-600">
                {type.metadata.default_prompts.slice(0, 2).map((prompt, idx) => (
                  <li key={idx}>{prompt}</li>
                ))}
                {type.metadata.default_prompts.length > 2 && (
                  <li>+{type.metadata.default_prompts.length - 2} more</li>
                )}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 