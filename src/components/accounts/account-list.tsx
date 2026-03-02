"use client";

import { Account } from "@/types";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AccountListProps {
  accounts: Account[];
  loading: boolean;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string) => void;
}

export function AccountList({ accounts, loading, onEdit, onDelete }: AccountListProps) {
  // Type badge colors
  const getTypeBadge = (type: string) => {
    const variants = {
      BANK: { label: "Bank", variant: "default" as const },
      UPI: { label: "UPI", variant: "secondary" as const },
      CREDIT_CARD: { label: "Credit Card", variant: "outline" as const },
    };
    return variants[type as keyof typeof variants];
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Initial Balance</TableHead>
            <TableHead className="text-right">Current Balance</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                Loading...
              </TableCell>
            </TableRow>
          ) : accounts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No accounts found. Create your first account to get started.
              </TableCell>
            </TableRow>
          ) : (
            accounts.map((account) => {
              const typeBadge = getTypeBadge(account.type);
              return (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.name}</TableCell>
                  <TableCell>
                    <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(account.initialBalance)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(account.currentBalance)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(account)}
                        title="Edit account"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(account.id)}
                        title="Delete account"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
