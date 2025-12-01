import { Card } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

const motivationalMessages = [
  {
    message: "Every scholarship application is a step closer to your goals. Keep pushing forward!",
    context: "achievement"
  },
  {
    message: "Your education is an investment in your future. These scholarships help make it possible.",
    context: "success"
  },
  {
    message: "The fact that you're here, applying for scholarships, shows your determination. That's already a win.",
    context: "encouragement"
  },
  {
    message: "Completing your profile increases your chances of being matched with the right scholarships.",
    context: "action"
  },
  {
    message: "Remember, every successful student started exactly where you are. You've got this!",
    context: "inspiration"
  },
  {
    message: "Financial barriers don't define your potential. Let these scholarships help you shine.",
    context: "empowerment"
  },
  {
    message: "You're not just applying for money—you're investing in your dreams.",
    context: "motivation"
  },
  {
    message: "Your hard work and grades have brought you here. Now let scholarships take you further.",
    context: "recognition"
  }
];

export function MotivationalMessage() {
  const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  return (
    <Card className="bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
      <div className="flex items-start gap-4 p-4">
        <div className="p-2 bg-accent/20 rounded-md flex-shrink-0 mt-1">
          <Lightbulb className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{message.message}</p>
        </div>
      </div>
    </Card>
  );
}
