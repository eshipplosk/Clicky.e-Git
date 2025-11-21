import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, GraduationCap, Check } from 'lucide-react';

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
  onAccept?: (id: string) => void;
  isAccepted?: boolean;
  isAccepting?: boolean;
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
  onClick,
  onAccept,
  isAccepted,
  isAccepting
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
          <div className="flex items-center gap-2">
            {isAccepted && (
              <Badge variant="default" className="gap-1" data-testid={`badge-accepted-${id}`}>
                <Check className="h-3 w-3" />
                Accepted
              </Badge>
            )}
            {matchScore !== undefined && (
              <Badge 
                variant={isHighMatch ? "default" : isMediumMatch ? "secondary" : "outline"}
                data-testid={`badge-match-${id}`}
              >
                {matchScore}% Match
              </Badge>
            )}
          </div>
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

      <CardFooter className="gap-2">
        {onAccept && !isAccepted && (
          <Button 
            className="flex-1"
            variant="default"
            onClick={(e) => {
              e.stopPropagation();
              onAccept(id);
            }}
            disabled={isAccepting}
            data-testid={`button-accept-${id}`}
          >
            {isAccepting ? "Applying..." : "Apply"}
          </Button>
        )}
        <Button 
          className={onAccept && !isAccepted ? "flex-1" : "w-full"}
          variant={onAccept && !isAccepted ? "outline" : "default"}
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
