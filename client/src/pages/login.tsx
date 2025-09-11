import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Zap, Sun, Wind } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import WalletConnector from "@/components/wallet/wallet-connector";

export default function Login() {
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ 
    username: "", 
    password: "", 
    confirmPassword: "",
    userType: "consumer" as 'prosumer' | 'consumer'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(loginForm.username, loginForm.password);
    } catch (error) {
      // Error handled by auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      return;
    }
    setIsLoading(true);
    try {
      await register(registerForm.username, registerForm.password, registerForm.userType);
    } catch (error) {
      // Error handled by auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="energy-gradient w-16 h-16 rounded-2xl flex items-center justify-center mr-4">
              <Zap className="text-white text-2xl" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground" data-testid="text-app-title">EnergyTrade</h1>
              <p className="text-xl text-muted-foreground" data-testid="text-app-subtitle">Blockchain Energy Trading Platform</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trade renewable energy directly with your neighbors using blockchain technology. 
            Become a prosumer and sell your solar energy, or find the best deals as a consumer.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Features Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-foreground">Why EnergyTrade?</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50">
                <div className="energy-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sun className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Sell Excess Energy</h3>
                  <p className="text-sm text-muted-foreground">
                    Turn your solar panels into a revenue stream by selling excess energy directly to your community.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50">
                <div className="blockchain-gradient w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Wind className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Buy Clean Energy</h3>
                  <p className="text-sm text-muted-foreground">
                    Purchase renewable energy at competitive prices from local producers in your area.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 rounded-lg bg-muted/50">
                <div className="bg-accent w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Blockchain Security</h3>
                  <p className="text-sm text-muted-foreground">
                    All transactions are secured by smart contracts on the Ethereum blockchain, ensuring transparency and trust.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-border">
              <h3 className="font-semibold text-foreground mb-2">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect your MetaMask wallet to start trading energy on the blockchain.
              </p>
              <WalletConnector />
            </div>
          </div>

          {/* Auth Section */}
          <div className="w-full max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Get Started</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                    <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                          required
                          data-testid="input-login-username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          required
                          data-testid="input-login-password"
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-login">
                        {isLoading ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="register">
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="reg-username">Username</Label>
                        <Input
                          id="reg-username"
                          value={registerForm.username}
                          onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                          required
                          data-testid="input-register-username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reg-password">Password</Label>
                        <Input
                          id="reg-password"
                          type="password"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          required
                          data-testid="input-register-password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          required
                          data-testid="input-confirm-password"
                        />
                        {registerForm.password && registerForm.confirmPassword && 
                         registerForm.password !== registerForm.confirmPassword && (
                          <p className="text-xs text-destructive mt-1">Passwords do not match</p>
                        )}
                      </div>
                      <div>
                        <Label>Account Type</Label>
                        <div className="flex space-x-2 mt-2">
                          <button
                            type="button"
                            onClick={() => setRegisterForm({ ...registerForm, userType: 'consumer' })}
                            className={`flex-1 p-3 rounded-lg border transition-colors ${
                              registerForm.userType === 'consumer' 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border hover:bg-muted/50'
                            }`}
                            data-testid="button-select-consumer"
                          >
                            <div className="text-center">
                              <Badge variant={registerForm.userType === 'consumer' ? 'default' : 'outline'}>
                                Consumer
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">Buy energy from others</p>
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegisterForm({ ...registerForm, userType: 'prosumer' })}
                            className={`flex-1 p-3 rounded-lg border transition-colors ${
                              registerForm.userType === 'prosumer' 
                                ? 'border-primary bg-primary/10' 
                                : 'border-border hover:bg-muted/50'
                            }`}
                            data-testid="button-select-prosumer"
                          >
                            <div className="text-center">
                              <Badge variant={registerForm.userType === 'prosumer' ? 'default' : 'outline'}>
                                Prosumer
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">Sell excess energy</p>
                            </div>
                          </button>
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-register">
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}