'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Sparkles, Calendar, FlaskConical, ChevronLeft, ChevronRight, Bot } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { EvidenceBadge } from '@/components/evidence-badge';
import { ScreenshotGallery } from '@/components/screenshot-gallery';
import { getEntityById } from '@/lib/queries';
import type { EntityWithRelations } from '@/lib/types';

function inlineBold(text: string) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="font-semibold text-[#1F2937]">{part}</strong> : part
  );
}

function MarkdownBlock({ content }: { content: string }) {
  if (!content.trim()) return null;
  const lines = content.split('\n');
  const nodes: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      nodes.push(
        <h3 key={i} className="text-sm font-semibold text-[#1F2937] mt-5 mb-2 first:mt-0">
          {inlineBold(line.slice(3))}
        </h3>
      );
      i++;
    } else if (line.startsWith('- ')) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(<li key={i}>{inlineBold(lines[i].slice(2))}</li>);
        i++;
      }
      nodes.push(
        <ul key={`ul-${i}`} className="list-disc list-outside ml-4 space-y-1.5 text-sm text-[#4B5563] leading-relaxed">
          {items}
        </ul>
      );
    } else if (line.trim() === '') {
      i++;
    } else {
      nodes.push(
        <p key={i} className="text-sm text-[#4B5563] leading-relaxed">
          {inlineBold(line)}
        </p>
      );
      i++;
    }
  }
  return <div className="space-y-2">{nodes}</div>;
}

const focusColors: Record<string, string> = {
  Clinical: 'bg-blue-50 text-blue-700 border-blue-200',
  Wellness: 'bg-[#A3B18A]/20 text-[#3A5A40] border-[#A3B18A]/40',
  Both: 'bg-teal-50 text-teal-700 border-teal-200',
};

export default function EntityDetailPage({ params }: { params: { id: string } }) {
  const [entity, setEntity] = useState<EntityWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEntityById(params.id)
      .then(setEntity)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <div className="h-8 w-32 bg-[#E5E7EB] rounded animate-pulse mb-8" />
          <div className="grid lg:grid-cols-[1fr_420px] gap-10">
            <div className="space-y-4">
              <div className="h-10 w-64 bg-[#E5E7EB] rounded animate-pulse" />
              <div className="h-4 w-full bg-[#E5E7EB] rounded animate-pulse" />
              <div className="h-4 w-3/4 bg-[#E5E7EB] rounded animate-pulse" />
            </div>
            <div className="h-96 bg-[#E5E7EB] rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-[#F9FAFB]">
        <Navigation />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 text-center">
          <h2 className="text-xl font-semibold text-[#1F2937]">Entity not found</h2>
          <Link href="/" className="text-sm text-[#3A5A40] hover:underline mt-2 inline-block">Back to gallery</Link>
        </div>
      </div>
    );
  }

  const conditions = entity.taxonomy.filter((t) => t.tag_type === 'condition');
  const frameworks = entity.taxonomy.filter((t) => t.tag_type === 'framework');
  const hasMedia = entity.media.length > 0;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors mb-8 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to gallery
        </Link>

        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          <div className="space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="tag-pill bg-stone-100 text-stone-600 border-stone-200">{entity.type}</span>
                <span className={`tag-pill ${focusColors[entity.focus] || focusColors['Wellness']}`}>{entity.focus}</span>
                {entity.affective_ai && (
                  <span className="tag-pill bg-[#A3B18A]/20 text-[#3A5A40] border-[#A3B18A]/40 flex items-center gap-1">
                    <Sparkles size={10} /> Affective AI
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold text-[#1F2937] tracking-tight mb-2">{entity.name}</h1>

              {entity.url && (
                <a
                  href={entity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-[#3A5A40] hover:text-[#2d4731] transition-colors"
                >
                  {entity.url.replace(/^https?:\/\//, '').split('/')[0]}
                  <ExternalLink size={12} />
                </a>
              )}
            </div>

            {entity.description && (
              <div>
                <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">About</h2>
                <MarkdownBlock content={entity.description} />
              </div>
            )}

            {entity.affective_ai && entity.ai_details && (
              <div className="bg-[#3A5A40]/5 border border-[#A3B18A]/30 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-[#3A5A40]" />
                  <h2 className="text-sm font-semibold text-[#3A5A40]">AI Implementation</h2>
                </div>
                <p className="text-sm text-[#4B5563] leading-relaxed">{entity.ai_details}</p>
              </div>
            )}

            {entity.ai_description?.trim() && (
              <div className="bg-white border border-[#E5E7EB] rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-[#F3F4F6]">
                  <div className="w-7 h-7 rounded-lg bg-[#3A5A40]/10 flex items-center justify-center">
                    <Bot size={14} className="text-[#3A5A40]" />
                  </div>
                  <h2 className="text-sm font-semibold text-[#1F2937]">How AI is Used</h2>
                </div>
                <MarkdownBlock content={entity.ai_description} />
              </div>
            )}

            {(conditions.length > 0 || frameworks.length > 0) && (
              <div className="space-y-4">
                {conditions.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2.5">Mental Health Conditions</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {conditions.map((t) => (
                        <span key={t.id} className="tag-pill bg-slate-100 text-slate-500 border-slate-200">
                          {t.tag_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {frameworks.length > 0 && (
                  <div>
                    <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2.5">Psychological Frameworks</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {frameworks.map((t) => (
                        <span key={t.id} className="tag-pill bg-[#3A5A40]/8 text-[#3A5A40] border-[#A3B18A]/30">
                          {t.tag_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {entity.evidence.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">
                  Clinical Evidence ({entity.evidence.length})
                </h2>
                <div className="space-y-3">
                  {entity.evidence.map((ev) => (
                    <div key={ev.id} className="bg-white border border-[#E5E7EB] rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <EvidenceBadge type={ev.type} size="md" />
                            {ev.date && (
                              <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
                                <Calendar size={10} />
                                {new Date(ev.date).getFullYear()}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-[#1F2937] mt-1">{ev.title}</p>
                          {ev.notes && <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">{ev.notes}</p>}
                        </div>
                        {ev.source_url && (
                          <a
                            href={ev.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-[#3A5A40] hover:text-[#2d4731] transition-colors"
                          >
                            View <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-24 space-y-6">
            <ScreenshotGallery media={entity.media} entityName={entity.name} />

            <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 space-y-4">
              <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Quick Facts</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Type</span>
                  <span className="font-medium text-[#1F2937]">{entity.type}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Focus</span>
                  <span className="font-medium text-[#1F2937]">{entity.focus}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Affective AI</span>
                  <span className={`font-medium ${entity.affective_ai ? 'text-[#3A5A40]' : 'text-[#9CA3AF]'}`}>
                    {entity.affective_ai ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Evidence items</span>
                  <span className="font-medium text-[#1F2937]">{entity.evidence.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6B7280]">Tags</span>
                  <span className="font-medium text-[#1F2937]">{entity.taxonomy.length}</span>
                </div>
              </div>
              {entity.url && (
                <a
                  href={entity.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#3A5A40] hover:bg-[#2d4731] text-white text-sm font-medium rounded-lg px-4 py-2.5 transition-colors"
                >
                  Visit Website <ExternalLink size={13} />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
