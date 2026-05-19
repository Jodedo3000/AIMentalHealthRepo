import { EVIDENCE_COLORS } from '@/lib/types';
import type { EvidenceType } from '@/lib/types';

interface EvidenceBadgeProps {
  type: EvidenceType;
  size?: 'sm' | 'md';
}

export function EvidenceBadge({ type, size = 'sm' }: EvidenceBadgeProps) {
  const colorClass = EVIDENCE_COLORS[type];
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-medium border ${colorClass} ${sizeClass}`}>
      {type === 'RCT' ? 'RCT (Gold Standard)' : type}
    </span>
  );
}
