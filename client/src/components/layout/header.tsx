import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface HeaderProps {
  title: string;
  subtitle: string;
  userType?: 'prosumer' | 'consumer';
  onUserTypeChange?: (type: 'prosumer' | 'consumer') => void;
  showNewTradeButton?: boolean;
}

export default function Header({ 
  title, 
  subtitle, 
  userType = 'prosumer', 
  onUserTypeChange,
  showNewTradeButton = false 
}: HeaderProps) {
  return (
    <header className="bg-card border-b border-border px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-page-title">{title}</h1>
          <p className="text-muted-foreground mt-1" data-testid="text-page-subtitle">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {onUserTypeChange && (
            <div className="flex bg-muted rounded-lg p-1">
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  userType === 'prosumer' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => onUserTypeChange('prosumer')}
                data-testid="button-toggle-prosumer"
              >
                Prosumer
              </button>
              <button 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  userType === 'consumer' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => onUserTypeChange('consumer')}
                data-testid="button-toggle-consumer"
              >
                Consumer
              </button>
            </div>
          )}
          {showNewTradeButton && (
            <Button 
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              data-testid="button-new-trade"
            >
              <Plus size={16} className="mr-2" />
              New Trade
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
