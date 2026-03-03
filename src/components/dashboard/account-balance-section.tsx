"use client";

import { Account } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Smartphone, CreditCard, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AccountBalanceSectionProps {
  accounts: Account[];
}

// Sort accounts: BANK -> UPI -> CREDIT_CARD, then alphabetically
function sortAccounts(accounts: Account[]): Account[] {
  const typeOrder = { BANK: 1, UPI: 2, CREDIT_CARD: 3 };

  return [...accounts].sort((a, b) => {
    const typeComparison = typeOrder[a.type] - typeOrder[b.type];
    if (typeComparison !== 0) return typeComparison;
    return a.name.localeCompare(b.name);
  });
}

// Get icon for account type
function getAccountIcon(type: Account["type"]) {
  switch (type) {
    case "BANK":
      return Building2;
    case "UPI":
      return Smartphone;
    case "CREDIT_CARD":
      return CreditCard;
  }
}

// Get badge variant and label for account type
function getTypeBadge(type: Account["type"]) {
  const variants = {
    BANK: { label: "Bank", variant: "default" as const },
    UPI: { label: "UPI", variant: "secondary" as const },
    CREDIT_CARD: { label: "Credit Card", variant: "outline" as const },
  };
  return variants[type];
}

export function AccountBalanceSection({ accounts }: AccountBalanceSectionProps) {
  const sortedAccounts = sortAccounts(accounts);

  // Empty state
  if (accounts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="rounded-full bg-muted p-3 mb-3">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mb-3 text-center">
            No accounts yet. Add your first account to track balances.
          </p>
          <Link href="/accounts">
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Account
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Account Balances</h3>
        <Link href="/accounts">
          <Button variant="ghost" size="sm" className="text-xs">
            Manage Accounts
          </Button>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedAccounts.map((account) => {
          const Icon = getAccountIcon(account.type);
          const typeBadge = getTypeBadge(account.type);
          const isNegative = account.currentBalance < 0;

          return (
            <Card key={account.id} className="border-l-2 border-l-primary/50">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1 min-w-0 pr-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground truncate">
                    {account.name}
                  </CardTitle>
                  <Badge variant={typeBadge.variant} className="mt-1.5 text-xs">
                    {typeBadge.label}
                  </Badge>
                </div>
                <Icon className="h-4 w-4 text-primary flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold ${
                  isNegative ? "text-red-600" : "text-green-600"
                }`}>
                  {formatCurrency(account.currentBalance)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
