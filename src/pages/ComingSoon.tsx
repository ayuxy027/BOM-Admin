import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
}

const ComingSoon = ({ title }: ComingSoonProps) => {
  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 rounded-2xl gradient-gold flex items-center justify-center mb-6">
          <Construction className="h-8 w-8 text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground max-w-md">
          This module is currently under development. Check back soon for updates.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default ComingSoon;
