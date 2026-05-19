import Link from 'next/link';
import { ExternalLink, FlaskConical, Sparkles } from 'lucide-react';
import type { EntityWithRelations, EvidenceType } from '@/lib/types';
import { EVIDENCE_LEVEL_ORDER, EVIDENCE_COLORS } from '@/lib/types';
import { EvidenceBadge } from './evidence-badge';

interface EntityCardProps {
  entity: EntityWithRelations;
}

function getBestEvidence(evidenceList: EntityWithRelations['evidence']): EvidenceType | null {
  if (!evidenceList.length) return null;
  return evidenceList.sort((a, b) => EVIDENCE_LEVEL_ORDER[a.type] - EVIDENCE_LEVEL_ORDER[b.type])[0].type;
}

const focusColors: Record<string, string> = {
  Clinical: 'bg-blue-50 text-blue-700 border-blue-200',
  Wellness: 'bg-[#A3B18A]/20 text-[#3A5A40] border-[#A3B18A]/40',
  Both: 'bg-teal-50 text-teal-700 border-teal-200',
};

const typeColors: Record<string, string> = {
  App: 'bg-stone-100 text-stone-600 border-stone-200',
  Research: 'bg-orange-50 text-orange-700 border-orange-200',
  VC: 'bg-slate-100 text-slate-600 border-slate-200',
  'App/Research': 'bg-orange-50 text-orange-700 border-orange-200',
};

export function EntityCard({ entity }: EntityCardProps) {
  const bestEvidence = getBestEvidence(entity.evidence);
  const conditions = entity.taxonomy.filter((t) => t.tag_type === 'condition');
  const frameworks = entity.taxonomy.filter((t) => t.tag_type === 'framework');
  const thumbnail = entity.media[0];

  return (
    <Link href={`/entity/${entity.id}`} className="group block">
      <article className="bg-white rounded-xl border border-[#E5E7EB] card-hover overflow-hidden h-full flex flex-col">
        {thumbnail ? (
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-stone-100 flex items-center justify-center">
            <div className="relative w-[90px] h-[170px] rounded-[14px] border-[3px] border-[#2C2C2E] bg-black shadow-lg overflow-hidden transition-transform duration-500 group-hover:scale-105">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[36px] h-[10px] bg-[#2C2C2E] rounded-b-lg z-10" />
              <img
                src={thumbnail.image_url}
                alt={thumbnail.caption || entity.name}
                className="w-full h-full object-cover object-top"
              />
            </div>
            {entity.affective_ai && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#3A5A40] text-[10px] font-semibold px-2 py-1 rounded-full border border-[#A3B18A]/40">
                <Sparkles size={10} />
                Affective AI
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-48 bg-gradient-to-br from-slate-100 to-stone-100 flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-[#3A5A40]/10 flex items-center justify-center">
              <FlaskConical size={24} className="text-[#3A5A40]/60" />
            </div>
            {entity.affective_ai && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[#3A5A40] text-[10px] font-semibold px-2 py-1 rounded-full border border-[#A3B18A]/40">
                <Sparkles size={10} />
                Affective AI
              </div>
            )}
          </div>
        )}

        <div className="p-5 flex flex-col gap-3 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-[#1F2937] text-base leading-tight truncate group-hover:text-[#3A5A40] transition-colors">
                {entity.name}
              </h3>
              {entity.url && (
                <span className="text-xs text-[#9CA3AF] truncate block mt-0.5">
                  {entity.url.replace(/^https?:\/\//, '').split('/')[0]}
                </span>
              )}
            </div>
            <ExternalLink size={13} className="text-[#D1D5DB] group-hover:text-[#A3B18A] transition-colors flex-shrink-0 mt-0.5" />
          </div>

          <div className="flex flex-wrap gap-1.5">
            <span className={`tag-pill ${typeColors[entity.type] || typeColors['App']}`}>{entity.type}</span>
            <span className={`tag-pill ${focusColors[entity.focus] || focusColors['Wellness']}`}>{entity.focus}</span>
            {entity.age_group && entity.age_group !== 'All ages' && (
              <span className={`tag-pill text-[10px] ${
                entity.age_group === 'Children & Adolescents'
                  ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}>
                {entity.age_group}
              </span>
            )}
            {bestEvidence && <EvidenceBadge type={bestEvidence} />}
          </div>

          <p className="text-sm text-[#6B7280] line-clamp-2 leading-relaxed flex-1">
            {entity.description}
          </p>

          {(conditions.length > 0 || frameworks.length > 0) && (
            <div className="flex flex-wrap gap-1 pt-1 border-t border-[#F3F4F6]">
              {conditions.slice(0, 2).map((t) => (
                <span key={t.id} className="tag-pill bg-slate-100 text-slate-500 border-slate-200 text-[10px]">
                  {t.tag_name}
                </span>
              ))}
              {frameworks.slice(0, 2).map((t) => (
                <span key={t.id} className="tag-pill bg-[#3A5A40]/8 text-[#3A5A40] border-[#A3B18A]/30 text-[10px]">
                  {t.tag_name}
                </span>
              ))}
              {entity.taxonomy.length > 4 && (
                <span className="tag-pill bg-[#F9FAFB] text-[#9CA3AF] border-[#E5E7EB] text-[10px]">
                  +{entity.taxonomy.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
