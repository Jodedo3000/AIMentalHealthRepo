'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, TrendingUp, Download } from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { EntityCard } from '@/components/entity-card';
import { FilterPanel, defaultFilters } from '@/components/filter-panel';
import { SearchBar } from '@/components/search-bar';
import type { FilterState } from '@/components/filter-panel';
import type { EntityWithRelations } from '@/lib/types';
import { getEntities } from '@/lib/queries';

export default function GalleryPage() {
  const [entities, setEntities] = useState<EntityWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  useEffect(() => {
    getEntities()
      .then(setEntities)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return entities.filter((entity) => {
      if (filters.types.length && !filters.types.includes(entity.type)) return false;
      if (filters.focuses.length && !filters.focuses.includes(entity.focus)) return false;
      if (filters.affectiveAi === true && !entity.affective_ai) return false;

      if (filters.platforms.length) {
        if (!filters.platforms.some((p) => entity.platform.includes(p))) return false;
      }

      if (filters.markets.length) {
        if (!filters.markets.some((m) => entity.markets.includes(m))) return false;
      }

      if (filters.languages.length) {
        if (!filters.languages.some((l) => entity.languages.includes(l))) return false;
      }

      if (filters.evidenceLevels.length) {
        const evTypes = new Set(entity.evidence.map((e) => e.type));
        if (!filters.evidenceLevels.some((l) => evTypes.has(l))) return false;
      }

      if (filters.conditions.length) {
        const tags = new Set(entity.taxonomy.filter((t) => t.tag_type === 'condition').map((t) => t.tag_name));
        if (!filters.conditions.some((c) => tags.has(c))) return false;
      }

      if (filters.frameworks.length) {
        const tags = new Set(entity.taxonomy.filter((t) => t.tag_type === 'framework').map((t) => t.tag_name));
        if (!filters.frameworks.some((f) => tags.has(f))) return false;
      }

      if (filters.ageGroups.length && !filters.ageGroups.includes(entity.age_group)) return false;

      if (filters.securityFeatures.length) {
        if (!filters.securityFeatures.some((f) => (entity.security_features ?? []).includes(f))) return false;
      }

      if (filters.businessModels.length) {
        if (!filters.businessModels.some((bm) => (entity.business_model ?? []).includes(bm))) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const inName = entity.name.toLowerCase().includes(q);
        const inDesc = entity.description.toLowerCase().includes(q);
        const inTags = entity.taxonomy.some((t) => t.tag_name.toLowerCase().includes(q));
        const inAi = entity.ai_details.toLowerCase().includes(q);
        const inPlatform = entity.platform.some((p) => p.toLowerCase().includes(q));
        const inMarkets = entity.markets.some((m) => m.toLowerCase().includes(q));
        if (!inName && !inDesc && !inTags && !inAi && !inPlatform && !inMarkets) return false;
      }

      return true;
    });
  }, [entities, filters, search]);

  const exportCSV = useCallback(() => {
    const headers = [
      'Name', 'Type', 'Focus', 'Business Model', 'Age Group', 'Affective AI',
      'URL', 'Markets', 'Platforms', 'Languages', 'Security Features',
      'Evidence Types', 'Conditions', 'Frameworks', 'Description',
    ];
    const rows = filtered.map((e) => [
      e.name,
      e.type,
      e.focus,
      (e.business_model ?? []).join('; '),
      e.age_group,
      e.affective_ai ? 'Yes' : 'No',
      e.url,
      e.markets.join('; '),
      e.platform.join('; '),
      e.languages.join('; '),
      (e.security_features ?? []).join('; '),
      Array.from(new Set(e.evidence.map((ev) => ev.type))).join('; '),
      e.taxonomy.filter((t) => t.tag_type === 'condition').map((t) => t.tag_name).join('; '),
      e.taxonomy.filter((t) => t.tag_type === 'framework').map((t) => t.tag_name).join('; '),
      e.description.replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-mental-health-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const stats = useMemo(() => ({
    apps: entities.filter((e) => e.type === 'App' || e.type === 'App/Research').length,
    rcts: entities.filter((e) => e.evidence.some((ev) => ev.type === 'RCT')).length,
    affective: entities.filter((e) => e.affective_ai).length,
  }), [entities]);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="tag-pill bg-[#3A5A40]/10 text-[#3A5A40] border-[#A3B18A]/40 text-[10px] font-semibold uppercase tracking-wider">
              Knowledge Repository
            </span>
          </div>
          <h1 className="text-4xl font-bold text-[#1F2937] mb-3 tracking-tight">
            AI × Mental Health
          </h1>
          <p className="text-base text-[#6B7280] max-w-2xl leading-relaxed">
            A curated overview of applications, research, and organizations at the intersection of artificial intelligence and mental health and wellbeing. Bridging clinical evidence with product excellence.
          </p>

          {!loading && (
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <div className="w-2 h-2 rounded-full bg-[#3A5A40]" />
                <span><strong className="text-[#1F2937]">{entities.length}</strong> entities tracked</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span><strong className="text-[#1F2937]">{stats.rcts}</strong> with RCT evidence</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Sparkles size={12} className="text-[#A3B18A]" />
                <span><strong className="text-[#1F2937]">{stats.affective}</strong> using affective AI</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        <div className="flex gap-8">
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            totalCount={entities.length}
            filteredCount={filtered.length}
          />

          <main className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] h-72 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#F3F4F6] flex items-center justify-center mb-4">
                  <TrendingUp size={24} className="text-[#9CA3AF]" />
                </div>
                <h3 className="text-base font-semibold text-[#1F2937] mb-1">No results found</h3>
                <p className="text-sm text-[#9CA3AF]">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-[#9CA3AF]">
                    {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
                  </p>
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-1.5 text-xs font-medium text-[#0D4F6B] border border-[#0D4F6B]/30 bg-white hover:bg-[#0D4F6B]/5 rounded-lg px-3 py-1.5 transition-all"
                  >
                    <Download size={13} />
                    Export CSV
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filtered.map((entity) => (
                    <EntityCard key={entity.id} entity={entity} />
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
