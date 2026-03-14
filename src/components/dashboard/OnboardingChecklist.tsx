import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TapCheck as Check, TapLink as Link2, TapPalette as Palette, TapShare as Share2 } from '@/components/icons/TapIcons';
import { motion } from 'framer-motion';

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  icon: any;
}

interface OnboardingChecklistProps {
  items: ChecklistItem[];
}

export const OnboardingChecklist = ({ items }: OnboardingChecklistProps) => {
  const completedCount = items.filter(item => item.completed).length;
  const progress = (completedCount / items.length) * 100;

  if (completedCount === items.length) return null;

  return (
    <Card className="p-4 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Premiers pas</h3>
          <span className="text-xs text-muted-foreground">{completedCount}/{items.length}</span>
        </div>
        <Progress value={progress} className="h-1.5" />
        <div className="space-y-2">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2.5"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    item.completed ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  {item.completed ? (
                    <Check className="w-3 h-3 text-primary-foreground" />
                  ) : (
                    <Icon className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <span
                  className={`text-xs ${
                    item.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
