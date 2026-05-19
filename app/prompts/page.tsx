'use client';

import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Search, X, SlidersHorizontal } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { PromptCard } from '@/components/prompt-card';
import { getPrompts } from '@/lib/queries';
import { CONDITIONS, FRAMEWORKS, USE_CASES } from '@/lib/types';
import type { Prompt } from '@/lib/types';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>([]);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getPrompts().then(setPrompts).finally(() => setLoading(false));
  }, []);

  const toggle = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const activeFilterCount = selectedConditions.length + selectedFrameworks.length + selectedUseCases.length;

  const clearFilters = () => {
    setSelectedConditions([]);
    setSelectedFrameworks([]);
    setSelectedUseCases([]);
  };

  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      if (selectedConditions.length && !selectedConditions.includes(p.condition)) return false;
      if (selectedFrameworks.length && !selectedFrameworks.includes(p.framework)) return false;
      if (selectedUseCases.length && !selectedUseCases.includes(p.use_case)) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(q);
        const inText = p.prompt_text.toLowerCase().includes(q);
        const inDesc = p.description.toLowerCase().includes(q);
        const inCondition = p.condition.toLowerCase().includes(q);
        const inFramework = p.framework.toLowerCase().includes(q);
        const inTags = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!inTitle && !inText && !inDesc && !inCondition && !inFramework && !inTags) return false;
      }

      return true;
    });
  }, [prompts, search, selectedConditions, selectedFrameworks, selectedUseCases]);

  const allConditionsInUse = useMemo(() => {
    const set = new Set(prompts.map((p) => p.condition).filter(Boolean));
    return CONDITIONS.filter((c) => set.has(c));
  }, [prompts]);

  const allFrameworksInUse = useMemo(() => {
    const set = new Set(prompts.map((p) => p.framework).filter(Boolean));
    return FRAMEWORKS.filter((f) => set.has(f));
  }, [prompts]);

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
              Prompt Library
            </span>
          </div>
          <h1 className="text-4xl font-bold text-[#1F2937] mb-3 tracking-tight">
            Prompt Library
          </h1>
          <p className="text-base text-[#6B7280] max-w-2xl leading-relaxed">
            Curated prompts for working with AI in mental health contexts — organized by condition, therapeutic framework, and use case. Copy and adapt freely.
          </p>

          {!loading && (
            <div className="flex items-center gap-6 mt-5">
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <div className="w-2 h-2 rounded-full bg-[#3A5A40]" />
                <span><strong className="text-[#1F2937]">{prompts.length}</strong> prompts available</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search prompts, conditions, frameworks..."
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
              <h3 className="text-sm font-semibold text-[#1F2937]">Filter prompts</h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-[#9CA3AF] hover:text-[#1F2937]">
                  Clear all
                </button>
              )}
            </div>

            <FilterSection
              label="Use Case"
              items={USE_CASES}
              selected={selectedUseCases}
              onToggle={(v) => toggle(selectedUseCases, v, setSelectedUseCases)}
              color="bg-blue-600 text-white border-blue-600"
            />

            {allConditionsInUse.length > 0 && (
              <FilterSection
                label="Condition"
                items={allConditionsInUse}
                selected={selectedConditions}
                onToggle={(v) => toggle(selectedConditions, v, setSelectedConditions)}
              />
            )}

            {allFrameworksInUse.length > 0 && (
              <FilterSection
                label="Framework"
                items={allFrameworksInUse}
                selected={selectedFrameworks}
                onToggle={(v) => toggle(selectedFrameworks, v, setSelectedFrameworks)}
                color="bg-[#A3B18A]/80 text-white border-[#A3B18A]"
              />
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] h-64 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-[#9CA3AF]" />
            </div>
            <h3 className="text-base font-semibold text-[#1F2937] mb-1">
              {prompts.length === 0 ? 'No prompts added yet' : 'No results found'}
            </h3>
            <p className="text-sm text-[#9CA3AF]">
              {prompts.length === 0 ? 'Add prompts from the admin dashboard' : 'Try adjusting your search or filters'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-[#9CA3AF] mb-4">
              {filtered.length} {filtered.length === 1 ? 'prompt' : 'prompts'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
