/**
 * InternationalStudentResources Component
 * 
 * Displays a curated list of external resources for international students
 * including cost estimators, currency converters, and scholarship databases.
 * 
 * Resources are loaded from a JSON config file for easy updates without code changes.
 * All links open in new tabs for user convenience.
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Calculator, GraduationCap, Award, DollarSign, Globe, Landmark, MapPin, Heart } from 'lucide-react';
import resourcesConfig from '@/config/internationalResources.json';

// Type definitions for the resource configuration
interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  icon: string;
}

interface CategoryConfig {
  label: string;
  color: string;
}

interface ResourcesConfig {
  sectionTitle: string;
  sectionDescription: string;
  resources: Resource[];
  categories: Record<string, CategoryConfig>;
}

// Type assertion for the imported JSON config
const config = resourcesConfig as ResourcesConfig;

/**
 * Maps icon names from the config to Lucide React icon components
 * Add new icon mappings here when extending the resource list
 */
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'calculator': Calculator,
  'graduation-cap': GraduationCap,
  'award': Award,
  'dollar-sign': DollarSign,
  'globe': Globe,
  'landmark': Landmark,
  'map-pin': MapPin,
  'heart': Heart,
};

/**
 * Maps category colors to Tailwind CSS classes
 * Provides consistent styling for category badges
 */
const getCategoryStyles = (color: string): string => {
  const colorMap: Record<string, string> = {
    'primary': 'bg-primary/10 text-primary border-primary/20',
    'blue': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'green': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    'purple': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  };
  return colorMap[color] || colorMap['primary'];
};

/**
 * ResourceCard Component
 * Renders an individual resource link card with icon, description, and category badge
 */
function ResourceCard({ resource }: { resource: Resource }) {
  const IconComponent = iconMap[resource.icon] || Globe;
  const categoryConfig = config.categories[resource.category];
  
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      data-testid={`link-resource-${resource.id}`}
    >
      <Card className="h-full transition-all duration-200 hover-elevate border-border/50">
        <CardContent className="p-4">
          {/* Header with icon and external link indicator */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="p-2 rounded-md bg-muted/50 shrink-0">
              <IconComponent className="h-5 w-5 text-muted-foreground" />
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </div>
          
          {/* Resource title */}
          <h4 className="font-medium text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {resource.title}
          </h4>
          
          {/* Resource description */}
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {resource.description}
          </p>
          
          {/* Category badge */}
          {categoryConfig && (
            <Badge 
              variant="outline" 
              className={`text-xs ${getCategoryStyles(categoryConfig.color)}`}
            >
              {categoryConfig.label}
            </Badge>
          )}
        </CardContent>
      </Card>
    </a>
  );
}

/**
 * Main InternationalStudentResources Component
 * Renders the full section with title and grid of resource cards
 */
export function InternationalStudentResources() {
  return (
    <section className="space-y-4" data-testid="section-international-resources">
      {/* Section Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Globe className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold" data-testid="text-section-title">
            {config.sectionTitle}
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {config.sectionDescription}
        </p>
      </div>
      
      {/* Resources Grid - Responsive layout */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {config.resources.map((resource) => (
          <ResourceCard key={resource.id} resource={resource} />
        ))}
      </div>
    </section>
  );
}

export default InternationalStudentResources;
