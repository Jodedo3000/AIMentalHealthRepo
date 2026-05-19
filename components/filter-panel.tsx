'use client';

import { X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { CONDITIONS, FRAMEWORKS, MARKETS, LANGUAGES, PLATFORMS, AGE_GROUPS, SECURITY_FEATURES, BUSINESS_MODELS } from '@/lib/types';
import type { EntityFocus, EntityType, EvidenceType, AgeGroup } from '@/lib/types';

export interface FilterState {
  types: EntityType[];
  focuses: EntityFocus[];
  evidenceLevels: EvidenceType[];
  conditions: string[];
  frameworks: string[];
  platforms: string[];
  markets: string[];
  languages: string[];
  affectiveAi: boolean | null;
  ageGroups: AgeGroup[];
  securityFeatures: string[];
  businessModels: string[];
}

export const defaultFilters: FilterState = {
  types: [],
  focuses: [],
  evidenceLevels: [],
  conditions: [],
  frameworks: [],
  platforms: [],
  markets: [],
  languages: [],
  affectiveAi: null,
  ageGroups: [],
  securityFeatures: [],
  businessModels: [],
};

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

const ENTITY_TYPES: EntityType[] = ['App', 'Research', 'VC', 'App/Research'];
const ENTITY_FOCUSES: EntityFocus[] = ['Clinical', 'Wellness', 'Both'];
const EVIDENCE_TYPES: EvidenceType[] = ['RCT', 'Meta-analysis', 'Peer-reviewed', 'Pilot', 'Anecdotal'];

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#F3F4F6] pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full mb-3 text-left group"
      >
        <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider">{title}</span>
        <ChevronDown
          size={14}
          className={`text-[#9CA3AF] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="space-y-1.5">{children}</div>}
    </div>
  );
}

function CheckOption({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <div
        className={`w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
          checked
            ? 'bg-[#3A5A40] border-[#3A5A40]'
            : 'border-[#D1D5DB] group-hover:border-[#A3B18A]'
        }`}
        onClick={() => onChange(!checked)}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className={`text-sm transition-colors leading-tight ${checked ? 'text-[#1F2937] font-medium' : 'text-[#6B7280] group-hover:text-[#1F2937]'}`}>
        {label}
      </span>
    </label>
  );
}

function hasActive(filters: FilterState): boolean {
  return (
    filters.types.length > 0 ||
    filters.focuses.length > 0 ||
    filters.evidenceLevels.length > 0 ||
    filters.conditions.length > 0 ||
    filters.frameworks.length > 0 ||
    filters.platforms.length > 0 ||
    filters.markets.length > 0 ||
    filters.languages.length > 0 ||
    filters.affectiveAi !== null ||
    filters.ageGroups.length > 0 ||
    filters.securityFeatures.length > 0 ||
    filters.businessModels.length > 0
  );
}

export function FilterPanel({ filters, onFiltersChange, totalCount, filteredCount }: FilterPanelProps) {
  const toggle = <T extends string>(arr: T[], value: T): T[] =>
    arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];

  const clearAll = () => onFiltersChange(defaultFilters);

  return (
    <aside className="w-56 flex-shrink-0">
      <div className="sticky top-24 bg-white rounded-xl border border-[#E5E7EB] p-4 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-[#1F2937]">Filters</span>
            <p className="text-xs text-[#9CA3AF] mt-0.5">
              {filteredCount} of {totalCount}
            </p>
          </div>
          {hasActive(filters) && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 text-xs text-[#3A5A40] hover:text-[#2d4731] font-medium"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>

        <FilterSection title="Type">
          {ENTITY_TYPES.map((type) => (
            <CheckOption
              key={type}
              label={type}
              checked={filters.types.includes(type)}
              onChange={() => onFiltersChange({ ...filters, types: toggle(filters.types, type) })}
            />
          ))}
        </FilterSection>

        <FilterSection title="Focus">
          {ENTITY_FOCUSES.map((focus) => (
            <CheckOption
              key={focus}
              label={focus}
              checked={filters.focuses.includes(focus)}
              onChange={() => onFiltersChange({ ...filters, focuses: toggle(filters.focuses, focus) })}
            />
          ))}
        </FilterSection>

        <FilterSection title="Business Model">
          {BUSINESS_MODELS.map((bm) => (
            <CheckOption
              key={bm}
              label={bm}
              checked={filters.businessModels.includes(bm)}
              onChange={() => onFiltersChange({ ...filters, businessModels: toggle(filters.businessModels, bm) })}
            />
          ))}
        </FilterSection>

        <FilterSection title="Age Group">
          {AGE_GROUPS.map((ag) => (
            <CheckOption
              key={ag}
              label={ag}
              checked={filters.ageGroups.includes(ag)}
              onChange={() => onFiltersChange({ ...filters, ageGroups: toggle(filters.ageGroups, ag) })}
            />
          ))}
        </FilterSection>

        <FilterSection title="Platform">
          {PLATFORMS.map((p) => (
            <CheckOption
              key={p}
              label={p}
              checked={filters.platforms.includes(p)}
              onChange={() => onFiltersChange({ ...filters, platforms: toggle(filters.platforms, p) })}
            />
          ))}
        </FilterSection>

        <FilterSection title="Evidence Level">
          {EVIDENCE_TYPES.map((ev) => (
            <CheckOption
              key={ev}
              label={ev === 'RCT' ? 'RCT (Gold Standard)' : ev}
              checked={filters.evidenceLevels.includes(ev)}
              onChange={() => onFiltersChange({ ...filters, evidenceLevels: toggle(filters.evidenceLevels, ev) })}
            />
          ))}
        </FilterSection>

        <FilterSection title="Conditions">
          {CONDITIONS.map((c) => (
            <CheckOption
              key={c}
              label={c}
              checked={filters.conditions.includes(c)}
              onChange={() => onFiltersChange({ ...filters, conditions: toggle(filters.conditions, c) })}
            />
          ))}
        </FilterSection>

        <FilterSection title="Frameworks">
          {FRAMEWORKS.map((f) => (
            <CheckOption
              key={f}
              label={f}
              checked={filters.frameworks.includes(f)}
              onChange={() => onFiltersChange({ ...filters, frameworks: toggle(filters.frameworks, f) })}
            />
          ))}
        </FilterSection>

        <FilterSection title="Markets" defaultOpen={false}>
          {MARKETS.map((m) => (
            <CheckOption
              key={m}
              label={m}
              checked={filters.markets.includes(m)}
              onChange={() => onFiltersChange({ ...filters, markets: toggle(filters.markets, m) })}
            />
          ))}
        </FilterSection>

        <FilterSection title="Languages" defaultOpen={false}>
          {LANGUAGES.map((l) => (
            <CheckOption
              key={l}
              label={l}
              checked={filters.languages.includes(l)}
              onChange={() => onFiltersChange({ ...filters, languages: toggle(filters.languages, l) })}
            />
          ))}
        </FilterSection>

        <FilterSection title="AI Features">
          <CheckOption
            label="Affective AI only"
            checked={filters.affectiveAi === true}
            onChange={(v) => onFiltersChange({ ...filters, affectiveAi: v ? true : null })}
          />
        </FilterSection>

        <FilterSection title="Security & Privacy">
          {SECURITY_FEATURES.map((feat) => (
            <CheckOption
              key={feat}
              label={feat}
              checked={filters.securityFeatures.includes(feat)}
              onChange={() => onFiltersChange({ ...filters, securityFeatures: toggle(filters.securityFeatures, feat) })}
            />
          ))}
        </FilterSection>
      </div>
    </aside>
  );
}
