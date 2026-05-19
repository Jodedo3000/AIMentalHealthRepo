'use client';

import { useState, useMemo } from 'react';
import { CreditCard as Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Search, X } from 'lucide-react';
import { EvidenceBadge } from '@/components/evidence-badge';
import { Brain } from 'lucide-react';
import type { EntityWithRelations, EvidenceType } from '@/lib/types';
import { EVIDENCE_LEVEL_ORDER } from '@/lib/types';

type SortKey = 'name' | 'type' | 'focus' | 'evidence' | 'tags' | 'affective_ai';
type SortDir = 'asc' | 'desc';

interface ColumnFilters {
  name: string;
  type: string;
  focus: string;
}

interface EntitiesTableProps {
  entities: EntityWithRelations[];
  loading: boolean;
  onEdit: (entity: EntityWithRelations) => void;
  onDelete: (id: string) => void;
}

function getBestEvidence(entity: EntityWithRelations): EvidenceType | null {
  if (!entity.evidence.length) return null;
  return [...entity.evidence].sort(
    (a, b) => EVIDENCE_LEVEL_ORDER[a.type] - EVIDENCE_LEVEL_ORDER[b.type]
  )[0].type;
}

function getBestEvidenceOrder(entity: EntityWithRelations): number {
  const best = getBestEvidence(entity);
  return best ? EVIDENCE_LEVEL_ORDER[best] : 99;
}

export function EntitiesTable({ entities, loading, onEdit, onDelete }: EntitiesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [colFilters, setColFilters] = useState<ColumnFilters>({ name: '', type: '', focus: '' });
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown size={12} className="text-[#D1D5DB]" />;
    return sortDir === 'asc'
      ? <ArrowUp size={12} className="text-[#3A5A40]" />
      : <ArrowDown size={12} className="text-[#3A5A40]" />;
  };

  const filtered = useMemo(() => {
    return entities.filter((e) => {
      if (colFilters.name && !e.name.toLowerCase().includes(colFilters.name.toLowerCase())) return false;
      if (colFilters.type && !e.type.toLowerCase().includes(colFilters.type.toLowerCase())) return false;
      if (colFilters.focus && !e.focus.toLowerCase().includes(colFilters.focus.toLowerCase())) return false;
      return true;
    });
  }, [entities, colFilters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'type': cmp = a.type.localeCompare(b.type); break;
        case 'focus': cmp = a.focus.localeCompare(b.focus); break;
        case 'evidence': cmp = getBestEvidenceOrder(a) - getBestEvidenceOrder(b); break;
        case 'tags': cmp = a.taxonomy.length - b.taxonomy.length; break;
        case 'affective_ai': cmp = Number(a.affective_ai) - Number(b.affective_ai); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const hasFilters = colFilters.name || colFilters.type || colFilters.focus;

  const clearFilter = (key: keyof ColumnFilters) =>
    setColFilters((f) => ({ ...f, [key]: '' }));

  const FilterPopover = ({
    col,
    placeholder,
  }: {
    col: keyof ColumnFilters;
    placeholder: string;
  }) => {
    if (openFilter !== col) return null;
    return (
      <div
        className="absolute top-full left-0 mt-1 z-20 bg-white border border-[#E5E7EB] rounded-lg shadow-lg p-2 min-w-[160px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            autoFocus
            type="text"
            value={colFilters[col]}
            onChange={(e) => setColFilters((f) => ({ ...f, [col]: e.target.value }))}
            placeholder={placeholder}
            className="w-full pl-6 pr-6 py-1.5 text-xs border border-[#E5E7EB] rounded-md focus:outline-none focus:border-[#3A5A40] focus:ring-1 focus:ring-[#3A5A40]/20"
          />
          {colFilters[col] && (
            <button
              onClick={() => clearFilter(col)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>
    );
  };

  const ColHeader = ({
    label,
    sortCol,
    filterCol,
    filterPlaceholder,
  }: {
    label: string;
    sortCol: SortKey;
    filterCol?: keyof ColumnFilters;
    filterPlaceholder?: string;
  }) => {
    const isFiltered = filterCol && colFilters[filterCol];
    return (
      <th className="text-left pb-3 pr-4">
        <div className="relative flex items-center gap-1">
          <button
            onClick={() => handleSort(sortCol)}
            className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wide hover:text-[#1F2937] transition-colors ${
              sortKey === sortCol ? 'text-[#3A5A40]' : 'text-[#9CA3AF]'
            }`}
          >
            {label}
            <SortIcon col={sortCol} />
          </button>
          {filterCol && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenFilter(openFilter === filterCol ? null : filterCol);
              }}
              className={`p-0.5 rounded transition-colors ${
                isFiltered
                  ? 'text-[#3A5A40] bg-[#3A5A40]/10'
                  : 'text-[#D1D5DB] hover:text-[#9CA3AF]'
              }`}
            >
              <Search size={11} />
            </button>
          )}
          {filterCol && filterPlaceholder && (
            <FilterPopover col={filterCol} placeholder={filterPlaceholder} />
          )}
        </div>
      </th>
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-[#F9FAFB] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (entities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center mx-auto mb-3">
          <Brain size={20} className="text-[#9CA3AF]" />
        </div>
        <p className="text-sm text-[#9CA3AF]">No entities yet. Add your first one!</p>
      </div>
    );
  }

  return (
    <div onClick={() => setOpenFilter(null)}>
      {hasFilters && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xs text-[#9CA3AF]">Filtered:</span>
          {colFilters.name && (
            <span className="flex items-center gap-1 bg-[#3A5A40]/8 text-[#3A5A40] text-xs px-2 py-0.5 rounded-full border border-[#A3B18A]/30">
              Name: "{colFilters.name}"
              <button onClick={() => clearFilter('name')}><X size={10} /></button>
            </span>
          )}
          {colFilters.type && (
            <span className="flex items-center gap-1 bg-[#3A5A40]/8 text-[#3A5A40] text-xs px-2 py-0.5 rounded-full border border-[#A3B18A]/30">
              Type: "{colFilters.type}"
              <button onClick={() => clearFilter('type')}><X size={10} /></button>
            </span>
          )}
          {colFilters.focus && (
            <span className="flex items-center gap-1 bg-[#3A5A40]/8 text-[#3A5A40] text-xs px-2 py-0.5 rounded-full border border-[#A3B18A]/30">
              Focus: "{colFilters.focus}"
              <button onClick={() => clearFilter('focus')}><X size={10} /></button>
            </span>
          )}
          <span className="text-xs text-[#9CA3AF]">
            {sorted.length} of {entities.length} shown
          </span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F3F4F6]">
              <ColHeader label="Name" sortCol="name" filterCol="name" filterPlaceholder="Search name..." />
              <ColHeader label="Type" sortCol="type" filterCol="type" filterPlaceholder="Filter type..." />
              <ColHeader label="Focus" sortCol="focus" filterCol="focus" filterPlaceholder="Filter focus..." />
              <ColHeader label="Best Evidence" sortCol="evidence" />
              <ColHeader label="Tags" sortCol="tags" />
              <ColHeader label="Affective AI" sortCol="affective_ai" />
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F9FAFB]">
            {sorted.map((entity) => {
              const bestEv = getBestEvidence(entity);
              return (
                <tr key={entity.id} className="group hover:bg-[#F9FAFB] transition-colors">
                  <td className="py-3 pr-4">
                    <p className="text-sm font-medium text-[#1F2937]">{entity.name}</p>
                    {entity.url && (
                      <p className="text-xs text-[#9CA3AF] truncate max-w-[160px]">
                        {entity.url.replace(/^https?:\/\//, '').split('/')[0]}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-[#6B7280]">{entity.type}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-[#6B7280]">{entity.focus}</span>
                  </td>
                  <td className="py-3 pr-4">
                    {bestEv ? <EvidenceBadge type={bestEv} /> : <span className="text-xs text-[#D1D5DB]">\u2014</span>}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="text-xs text-[#6B7280]">{entity.taxonomy.length} tags</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`text-xs font-medium ${entity.affective_ai ? 'text-[#3A5A40]' : 'text-[#D1D5DB]'}`}>
                      {entity.affective_ai ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(entity)}
                        className="p-1.5 rounded-md hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#1F2937] transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(entity.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-[#6B7280] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {sorted.length === 0 && (
          <div className="text-center py-10">
            <p className="text-sm text-[#9CA3AF]">No entities match your column filters.</p>
            <button
              onClick={() => setColFilters({ name: '', type: '', focus: '' })}
              className="mt-2 text-xs text-[#3A5A40] hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
