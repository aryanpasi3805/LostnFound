import { cn } from "@/lib/utils";

export function ConfidenceIndicator({ score, size = "sm" }: { score: number; size?: "sm" | "md" }) {
  const percentage = Math.min(100, Math.max(0, score));
  const color = percentage >= 80 ? "bg-success" : percentage >= 50 ? "bg-warning" : "bg-destructive";
  const label = percentage >= 80 ? "High" : percentage >= 50 ? "Medium" : "Low";
  const isMd = size === "md";

  return (
    <div className={cn("flex items-center gap-2", isMd && "flex-col items-start")}>
      <div className={cn("flex items-center gap-1.5", isMd && "w-full")}>
        <div className={cn("rounded-full bg-muted overflow-hidden", isMd ? "h-2 flex-1" : "h-1.5 w-16")}>
          <div className={cn("h-full rounded-full transition-all duration-500", color)} style={{ width: `${percentage}%` }} />
        </div>
        <span className={cn("font-semibold tabular-nums", isMd ? "text-sm" : "text-xs text-muted-foreground")}>{percentage}%</span>
      </div>
      {isMd && <span className="text-xs text-muted-foreground">{label} confidence match</span>}
    </div>
  );
}
