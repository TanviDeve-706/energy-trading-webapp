import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ArrowDownLeft, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import type { EnergyTransaction } from "@shared/schema";

export default function TransactionHistory() {
  const { data: transactionsData, isLoading } = useQuery<{ transactions: EnergyTransaction[] }>({
    queryKey: ['/api/transactions'],
    select: (data) => ({
      transactions: data.transactions.slice(0, 3) // Only show recent 3 transactions
    }),
  });

  const transactions = transactionsData?.transactions || [];

  const getTransactionIcon = (transaction: EnergyTransaction) => {
    // This should be based on whether current user is buyer or seller
    return <ArrowUpRight className="text-primary text-xs" size={12} />;
  };

  const getTransactionType = (transaction: EnergyTransaction) => {
    // This should be based on whether current user is buyer or seller
    return "Energy Sale";
  };

  const getTransactionAmount = (transaction: EnergyTransaction) => {
    // This should show + or - based on whether current user is buyer or seller
    return `+${transaction.totalPrice} ETH`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle data-testid="text-recent-transactions-title">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground" data-testid="text-no-recent-transactions">
              No recent transactions
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between py-3 border-b border-border last:border-b-0"
                  data-testid={`recent-transaction-${transaction.id}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      {getTransactionIcon(transaction)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground" data-testid={`text-transaction-type-${transaction.id}`}>
                        {getTransactionType(transaction)}
                      </p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-transaction-time-${transaction.id}`}>
                        {new Date(transaction.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary" data-testid={`text-transaction-amount-${transaction.id}`}>
                      {getTransactionAmount(transaction)}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`text-transaction-energy-${transaction.id}`}>
                      {transaction.energyAmount} kWh
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <Link href="/transactions">
                <Button variant="ghost" className="w-full text-primary hover:text-primary/80" data-testid="button-view-all-transactions">
                  View All Transactions
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
