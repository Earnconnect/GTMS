import { Badge } from "@/components/ui";

const TONES: Record<string, "gray" | "green" | "red" | "yellow" | "blue" | "purple"> = {
  // task
  DRAFT: "gray",
  FUNDING: "yellow",
  ACTIVE: "green",
  PAUSED: "yellow",
  COMPLETED: "blue",
  EXPIRED: "gray",
  CANCELLED: "red",
  // assignment
  AVAILABLE: "green",
  RESERVED: "yellow",
  SUBMITTED: "blue",
  APPROVED: "green",
  REJECTED: "red",
  // submission
  PENDING: "yellow",
  DISPUTED: "purple",
  // payout
  REQUESTED: "yellow",
  PROCESSING: "blue",
  PAID: "green",
  FAILED: "red",
  // dispute
  OPEN: "yellow",
  UNDER_REVIEW: "blue",
  RESOLVED_WORKER: "green",
  RESOLVED_REQUESTER: "green",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={TONES[status] ?? "gray"}>{status.replaceAll("_", " ")}</Badge>;
}
