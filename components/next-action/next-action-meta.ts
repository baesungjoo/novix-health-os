import type { BadgeVariant } from "@/components/ui";

export const NEXT_ACTION_TYPE_LABELS = {
  CALL: "전화",
  VISIT: "방문",
  COUNSELING: "상담",
  FOLLOW_UP: "후속관리",
  PAYMENT: "결제안내",
  OTHER: "기타",
} as const;

export const NEXT_ACTION_PRIORITY_LABELS = {
  URGENT: "긴급",
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음",
} as const;

export const NEXT_ACTION_STATUS_LABELS = {
  TODO: "진행중",
  COMPLETED: "완료",
} as const;

export const NEXT_ACTION_PRIORITY_VARIANTS: Record<
  keyof typeof NEXT_ACTION_PRIORITY_LABELS,
  BadgeVariant
> = {
  URGENT: "danger",
  HIGH: "warning",
  MEDIUM: "default",
  LOW: "success",
};

export const NEXT_ACTION_STATUS_VARIANTS: Record<
  keyof typeof NEXT_ACTION_STATUS_LABELS,
  BadgeVariant
> = {
  TODO: "warning",
  COMPLETED: "success",
};

export const NEXT_ACTION_PRIORITY_ORDER = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
} as const;

export type NextActionType = keyof typeof NEXT_ACTION_TYPE_LABELS;
export type NextActionPriority = keyof typeof NEXT_ACTION_PRIORITY_LABELS;
export type NextActionStatus = keyof typeof NEXT_ACTION_STATUS_LABELS;

export interface NextActionMemberSummary {
  id: number;
  name: string;
  phone: string;
}

export interface NextActionRecord {
  id: number;
  memberId: number;
  type: NextActionType;
  title: string;
  description: string;
  dueDate: string;
  priority: NextActionPriority;
  status: NextActionStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  member: NextActionMemberSummary;
}

export function sortNextActionsByPriority(
  left: Pick<NextActionRecord, "priority" | "dueDate" | "createdAt">,
  right: Pick<NextActionRecord, "priority" | "dueDate" | "createdAt">
) {
  const priorityGap =
    NEXT_ACTION_PRIORITY_ORDER[left.priority] -
    NEXT_ACTION_PRIORITY_ORDER[right.priority];

  if (priorityGap !== 0) return priorityGap;

  const dueDateGap = left.dueDate.localeCompare(right.dueDate);
  if (dueDateGap !== 0) return dueDateGap;

  return left.createdAt.localeCompare(right.createdAt);
}
