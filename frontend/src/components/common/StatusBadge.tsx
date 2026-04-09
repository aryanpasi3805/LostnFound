import { cn } from "@/lib/utils";

type Status = "lost" | "found" | "claimed" | "verified" | "pending" | "approved" | "rejected";

const statusConfig: Record<Status, { label: string; className: string }> = {
  lost: { label: "Lost", className: "status-lost" },
  found: { label: "Found", className: "status-found" },
  claimed: { label: "Claimed", className: "status-claimed" },
  verified: { label: "Verified", className: "status-verified" },
  pending: { label: "Pending Review", className: "status-pending" },
  approved: { label: "Approved", className: "status-verified" },
  rejected: { label: "Rejected", className: "status-lost" },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium", config.className, className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {config.label}
    </span>
  );
}
