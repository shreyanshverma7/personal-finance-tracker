"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, TrendingUp, TrendingDown, DollarSign, ArrowRight } from "lucide-react";
import { DashboardStats } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatsCard } from "./stats-card";
import { SpendingPieChart } from "@/components/charts/spending-pie-chart";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        setStats(await res.json());
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[380px]" />
          <Skeleton className="h-[380px]" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Balance"
          value={formatCurrency(stats.totalBalance)}
          icon={Wallet}
          className={stats.totalBalance >= 0 ? "text-green-600" : "text-red-600"}
        />
        <StatsCard
          title="Month Income"
          value={formatCurrency(stats.monthIncome)}
          icon={TrendingUp}
          className="text-green-600"
        />
        <StatsCard
          title="Month Expenses"
          value={formatCurrency(stats.monthExpenses)}
          icon={TrendingDown}
          className="text-red-600"
        />
        <StatsCard
          title="Net This Month"
          value={formatCurrency(stats.monthNet)}
          icon={DollarSign}
          className={stats.monthNet >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingPieChart data={stats.categoryBreakdown} />
        <MonthlyTrendChart data={stats.monthlyTrend} />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Transactions</CardTitle>
          <Link href="/transactions">
            <Button variant="ghost" size="sm">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No transactions yet. Add your first transaction!
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: t.category.color }}
                    />
                    <div>
                      <p className="text-sm font-medium">{t.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(t.date)}</span>
                        <Badge variant="outline" className="text-xs">
                          {t.category.name}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      t.type === "INCOME" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "INCOME" ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
