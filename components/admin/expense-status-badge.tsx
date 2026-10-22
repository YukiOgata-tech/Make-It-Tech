import { Badge } from "@/components/ui/badge";
import { EXPENSE_STATUS_LABELS, type ExpenseStatus } from "@/lib/expenses/constants";
import { cn } from "@/lib/utils";

export function ExpenseStatusBadge({ status }: { status: ExpenseStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-md",
        status === "confirmed" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        status === "draft" && "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        status === "archived" && "text-muted-foreground"
      )}
    >
      {EXPENSE_STATUS_LABELS[status]}
    </Badge>
  );
}
