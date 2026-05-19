'use client';

import Link from 'next/link';
import { ExternalLink, BookOpen, Users, Calendar, Lock, Clock as Unlock } from 'lucide-react';
import type { Paper } from '@/lib/types';
import { EVIDENCE_COLORS } from '@/lib/types';

interface PaperCardProps {
  paper: Paper;
}

export function PaperCard({ paper }: PaperCardProps) {
  const authorsDisplay = paper.authors.length > 3
    ? `${paper.authors.slice(0, 3).join(', ')} +${paper.authors.length - 3} more`
    : paper.authors.join(', ');

  const evidenceColor = paper.evidence_type && EVIDENCE_COLORS[paper.evidence_type as keyof typeof EVIDENCE_COLORS]
    ? EVIDENCE_COLORS[paper.evidence_type as keyof typeof EVIDENCE_COLORS]
    : 'bg-stone-100 text-stone-600 border-stone-200';

  return (
    <article className="group bg-white rounded-xl border border-[#E5E7EB] hover:border-[#A3B18A] hover:shadow-sm transition-all duration-200 flex flex-col overflow-hidden">
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 tag-pill bg-[#3A5A40]/8 text-[#3A5A40] border-[#A3B18A]/30 text-[10px] font-semibold uppercase tracking-wider">
              <BookOpen size={9} />
              Research Paper
            </span>
            {paper.open_access && (
              <span className="inline-flex items-center gap-1 tag-pill bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                <Unlock size={9} />
                Open Access
              </span>
            )}
            {!paper.open_access && paper.doi && (
              <span className="inline-flex items-center gap-1 tag-pill bg-stone-50 text-stone-500 border-stone-200 text-[10px]">
                <Lock size={9} />
                Paywalled
              </span>
            )}
          </div>
          {paper.evidence_type && (
            <span className={`tag-pill text-[10px] shrink-0 ${evidenceColor}`}>
              {paper.evidence_type}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-[#1F2937] leading-snug line-clamp-3 group-hover:text-[#3A5A40] transition-colors">
          {paper.title}
        </h3>

        {paper.summary ? (
          <p className="text-xs text-[#4B5563] leading-relaxed line-clamp-3">
            {paper.summary}
          </p>
        ) : paper.abstract ? (
          <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-3 italic">
            {paper.abstract}
          </p>
        ) : null}

        <div className="flex flex-col gap-1.5 mt-auto pt-2">
          {authorsDisplay && (
            <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
              <Users size={11} className="shrink-0" />
              <span className="truncate">{authorsDisplay}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-[11px] text-[#9CA3AF]">
            {paper.year && (
              <div className="flex items-center gap-1">
                <Calendar size={11} />
                <span>{paper.year}</span>
              </div>
            )}
            {paper.journal && (
              <span className="truncate text-[#9CA3AF] italic">{paper.journal}</span>
            )}
            {paper.arxiv_id && (
              <span className="font-mono text-[10px] bg-[#F3F4F6] text-[#6B7280] px-1.5 py-0.5 rounded">
                arXiv:{paper.arxiv_id}
              </span>
            )}
          </div>
        </div>

        {(paper.conditions.length > 0 || paper.frameworks.length > 0) && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-[#F3F4F6]">
            {paper.conditions.slice(0, 3).map((c) => (
              <span key={c} className="tag-pill bg-slate-100 text-slate-500 border-slate-200 text-[10px]">
                {c}
              </span>
            ))}
            {paper.frameworks.slice(0, 2).map((f) => (
              <span key={f} className="tag-pill bg-[#A3B18A]/15 text-[#3A5A40] border-[#A3B18A]/30 text-[10px]">
                {f}
              </span>
            ))}
          </div>
        )}
      </div>

      {paper.url && (
        <div className="px-5 py-3 border-t border-[#F3F4F6] bg-[#FAFAFA]">
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-[#3A5A40] hover:text-[#2d4731] transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={11} />
            View paper
          </a>
        </div>
      )}
    </article>
  );
}
