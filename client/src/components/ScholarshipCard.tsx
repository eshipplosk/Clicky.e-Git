import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, GraduationCap } from 'lucide-react';

interface ScholarshipCardProps {
  id: string;
  title: string;
  amount: number;
  deadline: string;
  category: string;
  eligibility: string;
  matchScore?: number;
  description: string;
  onClick?: () => void;
}

export function ScholarshipCard({
  id,
  title,
  amount,
  deadline,
  category,
  eligibility,
  matchScore,
  description,
  onClick
}: ScholarshipCardProps) {
  const isHighMatch = matchScore && matchScore >= 80;
  const isMediumMatch = matchScore && matchScore >= 60 && matchScore < 80;

  return (
    <Card 
      className="hover-elevate transition-all cursor-pointer"
      onClick={onClick}
      data-testid={`card-scholarship-${id}`}
    >
      <CardHeader className="gap-2 space-y-0 pb-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-tight" data-testid={`text-title-${id}`}>
            {title}
          </h3>
          {matchScore !== undefined && (
            <Badge 
              variant={isHighMatch ? "default" : isMediumMatch ? "secondary" : "outline"}
              data-testid={`badge-match-${id}`}
            >
              {matchScore}% Match
            </Badge>
          )}
        </div>
        <Badge variant="outline" className="w-fit" data-testid={`badge-category-${id}`}>
          {category}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-description-${id}`}>
          {description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span data-testid={`text-amount-${id}`}>${amount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span data-testid={`text-deadline-${id}`}>Due: {deadline}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <span data-testid={`text-eligibility-${id}`}>{eligibility}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button 
          className="w-full" 
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          data-testid={`button-view-details-${id}`}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}
