'use client';

import { useState, useEffect, useMemo } from 'react';
import { BookOpen, Search, X, SlidersHorizontal } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { PaperCard } from '@/components/paper-card';
import { getPapers } from '@/lib/queries';
import { CONDITIONS, FRAMEWORKS, EVIDENCE_LEVEL_ORDER } from '@/lib/types';
import type { Paper, EvidenceType } from '@/lib/types';

const ALL_EVIDENCE_TYPES = Object.keys(EVIDENCE_LEVEL_ORDER) as EvidenceType[];

export default function PapersPage() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [selectedEvidenceTypes, setSelectedEvidenceTypes] = useState<string[]>([]);
  const [openAccessOnly, setOpenAccessOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getPapers().then(setPapers).finally(() => setLoading(false));
  }, []);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const activeFilterCount = selectedConditions.length + selectedFrameworks.length + selectedEvidenceTypes.length + (openAccessOnly ? 1 : 0);

  const clearFilters = () => {
    setSelectedConditions([]);
    setSelectedFrameworks([]);
    setSelectedEvidenceTypes([]);
    setOpenAccessOnly(false);
  };

  const filtered = useMemo(() => {
    return papers.filter((p) => {
      if (openAccessOnly && !p.open_access) return false;
      if (selectedConditions.length && !selectedConditions.some((c) => p.conditions.includes(c))) return false;
      if (selectedFrameworks.length && !selectedFrameworks.some((f) => p.frameworks.includes(f))) return false;
      if (selectedEvidenceTypes.length && !selectedEvidenceTypes.includes(p.evidence_type)) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(q);
        const inAbstract = p.abstract.toLowerCase().includes(q);
        const inSummary = p.summary.toLowerCase().includes(q);
        const inAuthors = p.authors.some((a) => a.toLowerCase().includes(q));
        const inJournal = p.journal.toLowerCase().includes(q);
        const inConditions = p.conditions.some((c) => c.toLowerCase().includes(q));
        const inFrameworks = p.frameworks.some((f) => f.toLowerCase().includes(q));
        if (!inTitle && !inAbstract && !inSummary && !inAuthors && !inJournal && !inConditions && !inFrameworks) return false;
      }

      return true;
    });
  }, [papers, search, selectedConditions, selectedFrameworks, selectedEvidenceTypes, openAccessOnly]);

  const FilterSection = ({ label, items, selected, onToggle, color }: {
    label: string;
    items: string[];
    selected: string[];
    onToggle: (v: string) => void;
    color?: string;
  }) => (
    <div>
      <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onToggle(item)}
            className={`tag-pill text-[11px] transition-all ${
              selected.includes(item)
                ? (color || 'bg-[#3A5A40] text-white border-[#3A5A40]')
                : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#A3B18A]'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="tag-pill bg-[#3A5A40]/10 text-[#3A5A40] border-[#A3B18A]/40 text-[10px] font-semibold uppercase tracking-wider">
              Research Library
            </span>
          </div>
          <h1 className="text-4xl font-bold text-[#1F2937] mb-3 tracking-tight">
            Research Papers
          </h1>
          <p className="text-base text-[#6B7280] max-w-2xl leading-relaxed">
            Curated academic papers at the intersection of AI and mental health — with editorial summaries, condition tags, and evidence classifications.
          </p>

          {!loading && (
            <div className="flex items-center gap-6 mt-5">
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <div className="w-2 h-2 rounded-full bg-[#3A5A40]" />
                <span><strong className="text-[#1F2937]">{papers.length}</strong> papers indexed</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span><strong className="text-[#1F2937]">{papers.filter((p) => p.open_access).length}</strong> open access</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search papers, authors, topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-[#E5E7EB] rounded-xl focus:outline-none focus:border-[#A3B18A] focus:ring-2 focus:ring-[#A3B18A]/20 transition-all text-[#1F2937] placeholder:text-[#9CA3AF]"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1F2937]">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-[#3A5A40] text-white border-[#3A5A40]'
                : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#A3B18A]'
            }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white/30 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-sm text-[#6B7280] hover:text-[#1F2937] transition-colors"
            >
              <X size={13} />
              Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 mb-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1F2937]">Filter papers</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-[#9CA3AF] hover:text-[#1F2937]">
                  Clear all
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setOpenAccessOnly((v) => !v)}
                  className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${openAccessOnly ? 'bg-[#3A5A40]' : 'bg-[#D1D5DB]'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${openAccessOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-[#4B5563]">Open access only</span>
              </label>
            </div>

            <FilterSection
              label="Conditions"
              items={CONDITIONS}
              selected={selectedConditions}
              onToggle={(v) => toggle(selectedConditions, v, setSelectedConditions)}
            />
            <FilterSection
              label="Frameworks"
              items={FRAMEWORKS}
              selected={selectedFrameworks}
              onToggle={(v) => toggle(selectedFrameworks, v, setSelectedFrameworks)}
              color="bg-[#A3B18A]/80 text-white border-[#A3B18A]"
            />
            <FilterSection
              label="Evidence Type"
              items={ALL_EVIDENCE_TYPES}
              selected={selectedEvidenceTypes}
              onToggle={(v) => toggle(selectedEvidenceTypes, v, setSelectedEvidenceTypes)}
              color="bg-emerald-600 text-white border-emerald-600"
            />
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] h-72 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-[#9CA3AF]" />
            </div>
            <h3 className="text-base font-semibold text-[#1F2937] mb-1">
              {papers.length === 0 ? 'No papers added yet' : 'No results found'}
            </h3>
            <p className="text-sm text-[#9CA3AF]">
              {papers.length === 0 ? 'Add research papers from the admin dashboard' : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#9CA3AF] mb-4">
              {filtered.length} {filtered.length === 1 ? 'paper' : 'papers'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
