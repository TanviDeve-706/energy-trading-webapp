import { Link, useLocation } from "wouter";
import { Zap, Gauge, Store, History, Settings, LogOut } from "lucide-react";
import WalletConnector from "@/components/wallet/wallet-connector";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { useAuth } from "@/context/AuthContext";

const navigation = [
  { name: 'Dashboard', href: '/', icon: Gauge },
  { name: 'Marketplace', href: '/marketplace', icon: Store },
  { name: 'Transaction History', href: '/transactions', icon: History },
  { name: 'Account Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { isConnected, account } = useWallet();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-card shadow-lg border-r border-border">
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="energy-gradient w-10 h-10 rounded-lg flex items-center justify-center">
            <Zap className="text-white text-xl" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground" data-testid="text-app-title">EnergyTrade</h1>
            <p className="text-sm text-muted-foreground" data-testid="text-app-subtitle">Blockchain Energy Trading</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6 px-4">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} href={item.href}>
                <div 
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'sidebar-active text-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  data-testid={`link-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon size={20} />
                  <span className="ml-3 font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* User Status and Wallet Connection */}
      <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-border bg-card">
        {user ? (
          <div className="space-y-2">
            <div className="flex items-center space-x-3 p-3 bg-primary/10 rounded-lg">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Zap size={16} className="text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground" data-testid="text-user-status">
                  {user.userType === 'prosumer' ? 'Prosumer' : 'Consumer'}
                </p>
                <p className="text-xs text-muted-foreground truncate" data-testid="text-user-wallet">
                  {user.walletAddress ? 
                    `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 
                    'No wallet connected'
                  }
                </p>
              </div>
            </div>
            {!isConnected && <WalletConnector />}
            <Button 
              onClick={logout} 
              variant="outline" 
              size="sm" 
              className="w-full"
              data-testid="button-logout"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <WalletConnector />
        )}
      </div>
    </aside>
  );
}
