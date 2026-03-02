"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Account } from "@/types";
import { AccountList } from "@/components/accounts/account-list";
import { AccountDialog } from "@/components/accounts/account-dialog";
import { DeleteAccountDialog } from "@/components/accounts/delete-account-dialog";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  // Fetch accounts
  useEffect(() => {
    async function fetchAccounts() {
      setLoading(true);
      try {
        const res = await fetch("/api/accounts");
        if (res.ok) {
          const data = await res.json();
          setAccounts(data);
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAccounts();
  }, [refreshKey]);

  function handleAdd() {
    setEditingAccount(null);
    setDialogOpen(true);
  }

  function handleEdit(account: Account) {
    setEditingAccount(account);
    setDialogOpen(true);
  }

  function handleDelete(accountId: string) {
    setDeletingId(accountId);
    setDeleteDialogOpen(true);
  }

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold border-l-4 border-l-primary pl-3">
          Accounts
        </h1>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Account
        </Button>
      </div>

      <AccountList
        accounts={accounts}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <AccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        account={editingAccount}
        onSuccess={refresh}
      />

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        accountId={deletingId}
        onSuccess={refresh}
      />
    </div>
  );
}
