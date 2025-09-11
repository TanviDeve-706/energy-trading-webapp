import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/use-wallet";
import WalletConnector from "@/components/wallet/wallet-connector";

export default function Settings() {
  const { isConnected, account, balance } = useWallet();

  return (
    <div>
      <Header 
        title="Account Settings"
        subtitle="Manage your account and wallet settings"
      />

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-profile-title">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  defaultValue="energy_user" 
                  disabled 
                  className="mt-1"
                  data-testid="input-username"
                />
                <p className="text-xs text-muted-foreground mt-1">Username cannot be changed</p>
              </div>
              
              <div>
                <Label htmlFor="userType">Account Type</Label>
                <div className="mt-1">
                  <Badge variant="secondary" data-testid="badge-user-type">Prosumer</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Switch between Prosumer and Consumer in the dashboard</p>
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  placeholder="Enter your location" 
                  className="mt-1"
                  data-testid="input-location"
                />
              </div>
              
              <Button className="w-full" data-testid="button-save-profile">Save Changes</Button>
            </CardContent>
          </Card>

          {/* Wallet Settings */}
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-wallet-title">Wallet Connection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isConnected ? (
                <div className="space-y-4">
                  <div>
                    <Label>Wallet Address</Label>
                    <div className="mt-1 p-3 bg-muted rounded-lg">
                      <p className="font-mono text-sm break-all" data-testid="text-wallet-address">
                        {account}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Balance</Label>
                    <div className="mt-1">
                      <p className="text-2xl font-bold text-foreground" data-testid="text-wallet-balance">
                        {balance} ETH
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm text-primary" data-testid="text-wallet-status">Connected</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4" data-testid="text-wallet-not-connected">
                    Connect your wallet to start trading energy
                  </p>
                  <WalletConnector />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Energy Settings */}
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-energy-title">Energy Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="energyType">Primary Energy Source</Label>
                <select 
                  id="energyType" 
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring mt-1"
                  data-testid="select-energy-type"
                >
                  <option value="solar">Solar</option>
                  <option value="wind">Wind</option>
                  <option value="hydro">Hydro</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="capacity">Installation Capacity (kW)</Label>
                <Input 
                  id="capacity" 
                  type="number" 
                  placeholder="5.0" 
                  className="mt-1"
                  data-testid="input-capacity"
                />
              </div>
              
              <div>
                <Label htmlFor="defaultPrice">Default Price per kWh (ETH)</Label>
                <Input 
                  id="defaultPrice" 
                  type="number" 
                  step="0.001" 
                  placeholder="0.05" 
                  className="mt-1"
                  data-testid="input-default-price"
                />
              </div>
              
              <Button className="w-full" data-testid="button-save-energy-settings">Save Settings</Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-notifications-title">Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Energy Sales</p>
                  <p className="text-sm text-muted-foreground">Get notified when your energy is sold</p>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="w-4 h-4"
                  data-testid="checkbox-sales-notifications"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">New Offers</p>
                  <p className="text-sm text-muted-foreground">Get notified of new energy offers</p>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked 
                  className="w-4 h-4"
                  data-testid="checkbox-offers-notifications"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Price Alerts</p>
                  <p className="text-sm text-muted-foreground">Get alerts when prices change significantly</p>
                </div>
                <input 
                  type="checkbox" 
                  className="w-4 h-4"
                  data-testid="checkbox-price-alerts"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
