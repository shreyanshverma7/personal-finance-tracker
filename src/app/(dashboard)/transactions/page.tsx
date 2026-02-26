import { TransactionList } from "@/components/transactions/transaction-list";

export default function TransactionsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold border-l-4 border-l-primary pl-3">Transactions</h1>
      <TransactionList />
    </div>
  );
}
