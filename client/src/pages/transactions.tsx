import Header from "@/components/layout/header";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import type { EnergyTransaction } from "@shared/schema";

export default function Transactions() {
  const { data: transactionsData, isLoading } = useQuery<{ transactions: EnergyTransaction[] }>({
    queryKey: ['/api/transactions'],
  });

  const transactions = transactionsData?.transactions || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-accent" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default' as const;
      case 'failed':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <div>
      <Header 
        title="Transaction History"
        subtitle="View your complete energy trading transaction history"
      />

      <div className="px-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-transactions-title">All Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg" data-testid="text-no-transactions">No transactions found.</p>
                <p className="text-sm text-muted-foreground mt-2">Your energy trading transactions will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                    data-testid={`transaction-${transaction.id}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground" data-testid={`text-transaction-type-${transaction.id}`}>
                          Energy Trade
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-transaction-time-${transaction.id}`}>
                          {new Date(transaction.createdAt!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-foreground" data-testid={`text-transaction-amount-${transaction.id}`}>
                          {transaction.energyAmount} kWh
                        </p>
                        <p className="text-sm text-muted-foreground" data-testid={`text-transaction-price-${transaction.id}`}>
                          {transaction.totalPrice} ETH
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(transaction.status!)}
                        <Badge variant={getStatusBadgeVariant(transaction.status!)} data-testid={`badge-transaction-status-${transaction.id}`}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
