import { Badge, BadgeVariant } from '../ui';

export enum MemberStatus {
  New = '신규',
  Growing = '성장',
  Active = '활성',
  Loyal = '장기',
}

interface MemberStatusBadgeProps {
  visits?: number;
  value?: MemberStatus;
}

function resolveMemberStatus(): MemberStatus {
  // TODO: Read the persisted lifecycle status from Prisma once the field exists.
  return MemberStatus.New;
}

function resolveBadgeVariant(status: MemberStatus): BadgeVariant {
  switch (status) {
    case MemberStatus.New:
      return 'default';
    case MemberStatus.Growing:
      return 'warning';
    case MemberStatus.Active:
      return 'success';
    case MemberStatus.Loyal:
      return 'danger';
    default:
      return 'default';
  }
}

export function getMemberStatus(): MemberStatus {
  return resolveMemberStatus();
}

export function MemberStatusBadge({ visits, value }: MemberStatusBadgeProps) {
  const status = value ?? resolveMemberStatus();

  return <Badge variant={resolveBadgeVariant(status)}>{status}</Badge>;
}
