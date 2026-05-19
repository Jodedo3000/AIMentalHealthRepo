'use client';

import { useState } from 'react';
import { Copy, CircleCheck as CheckCircle2, Tag } from 'lucide-react';
import type { Prompt } from '@/lib/types';

interface PromptCardProps {
  prompt: Prompt;
}

const USE_CASE_COLORS: Record<string, string> = {
  'Therapist': 'bg-blue-50 text-blue-700 border-blue-200',
  'Self-guided user': 'bg-teal-50 text-teal-700 border-teal-200',
  'App builder': 'bg-amber-50 text-amber-700 border-amber-200',
  'Researcher': 'bg-sky-50 text-sky-700 border-sky-200',
  'Clinician': 'bg-blue-50 text-blue-700 border-blue-200',
  'Coach': 'bg-orange-50 text-orange-700 border-orange-200',
  'Student': 'bg-lime-50 text-lime-700 border-lime-200',
};

export function PromptCard({ prompt }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.prompt_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const useCaseColor = prompt.use_case && USE_CASE_COLORS[prompt.use_case]
    ? USE_CASE_COLORS[prompt.use_case]
    : 'bg-stone-100 text-stone-600 border-stone-200';

  return (
    <article className="group bg-white rounded-xl border border-[#E5E7EB] hover:border-[#A3B18A] hover:shadow-sm transition-all duration-200 flex flex-col">
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {prompt.use_case && (
              <span className={`tag-pill text-[10px] font-medium ${useCaseColor}`}>
                {prompt.use_case}
              </span>
            )}
            {prompt.condition && (
              <span className="tag-pill bg-slate-100 text-slate-500 border-slate-200 text-[10px]">
                {prompt.condition}
              </span>
            )}
            {prompt.framework && (
              <span className="tag-pill bg-[#A3B18A]/15 text-[#3A5A40] border-[#A3B18A]/30 text-[10px]">
                {prompt.framework}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-sm font-semibold text-[#1F2937] leading-snug group-hover:text-[#3A5A40] transition-colors">
          {prompt.title}
        </h3>

        {prompt.description && (
          <p className="text-xs text-[#6B7280] leading-relaxed line-clamp-2">
            {prompt.description}
          </p>
        )}
      </div>

      <div className="mx-5 mb-4 rounded-lg bg-[#F8F9FA] border border-[#E9ECEF] overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#E9ECEF] bg-[#F3F4F6]">
          <span className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">Prompt</span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1 text-[10px] font-medium transition-all rounded px-2 py-0.5 ${
              copied
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-[#6B7280] hover:text-[#3A5A40] hover:bg-white'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 size={10} />
                Copied
              </>
            ) : (
              <>
                <Copy size={10} />
                Copy
              </>
            )}
          </button>
        </div>
        <p className="px-3 py-3 text-xs text-[#374151] leading-relaxed font-mono whitespace-pre-wrap line-clamp-6">
          {prompt.prompt_text}
        </p>
      </div>

      {prompt.tags.length > 0 && (
        <div className="px-5 pb-4 flex items-center gap-1.5 flex-wrap">
          <Tag size={10} className="text-[#9CA3AF] shrink-0" />
          {prompt.tags.map((tag) => (
            <span key={tag} className="tag-pill bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB] text-[10px]">
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
