'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2, MessageSquare } from 'lucide-react';
import type { Prompt } from '@/lib/types';

type SortKey = 'title' | 'condition' | 'framework' | 'use_case';
type SortDir = 'asc' | 'desc';

interface PromptsTableProps {
  prompts: Prompt[];
  loading: boolean;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
}

export function PromptsTable({ prompts, loading, onEdit, onDelete }: PromptsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('title');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');

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
    const q = search.toLowerCase();
    const list = q
      ? prompts.filter((p) =>
          p.title.toLowerCase().includes(q) ||
          p.prompt_text.toLowerCase().includes(q) ||
          p.condition.toLowerCase().includes(q) ||
          p.framework.toLowerCase().includes(q) ||
          p.use_case.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        )
      : prompts;

    return [...list].sort((a, b) => {
      const av = (a[sortKey] ?? '').toLowerCase();
      const bv = (b[sortKey] ?? '').toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [prompts, sortKey, sortDir, search]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-[#F9FAFB] rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search prompts\u2026"
          className="flex-1 px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#A3B18A] focus:ring-2 focus:ring-[#A3B18A]/20 text-[#1F2937] placeholder:text-[#9CA3AF]"
        />
        <span className="text-xs text-[#9CA3AF] shrink-0">{filtered.length} / {prompts.length}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center mb-3">
            <MessageSquare size={18} className="text-[#9CA3AF]" />
          </div>
          <p className="text-sm text-[#6B7280]">{prompts.length === 0 ? 'No prompts added yet' : 'No results match your search'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {([
                  ['title', 'Title'],
                  ['use_case', 'Use Case'],
                  ['condition', 'Condition'],
                  ['framework', 'Framework'],
                ] as [SortKey, string][]).map(([key, label]) => (
                  <th key={key} className="text-left px-4 py-3">
                    <button
                      onClick={() => handleSort(key)}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider hover:text-[#3A5A40] transition-colors"
                    >
                      {label}
                      <SortIcon col={key} />
                    </button>
                  </th>
                ))}
                <th className="px-4 py-3 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {filtered.map((prompt) => (
                <tr key={prompt.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3 max-w-[200px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-[#1F2937] text-xs truncate">{prompt.title}</span>
                      <span className="text-[10px] text-[#9CA3AF] line-clamp-1">{prompt.prompt_text.slice(0, 60)}\u2026</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {prompt.use_case ? (
                      <span className="tag-pill bg-blue-50 text-blue-700 border-blue-200 text-[10px]">{prompt.use_case}</span>
                    ) : <span className="text-[#9CA3AF] text-xs">\u2014</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#4B5563] whitespace-nowrap">{prompt.condition || '\u2014'}</td>
                  <td className="px-4 py-3">
                    {prompt.framework ? (
                      <span className="tag-pill bg-[#A3B18A]/15 text-[#3A5A40] border-[#A3B18A]/30 text-[10px]">{prompt.framework}</span>
                    ) : <span className="text-[#9CA3AF] text-xs">\u2014</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => onEdit(prompt)}
                        className="p-1.5 text-[#9CA3AF] hover:text-[#3A5A40] transition-colors rounded-md hover:bg-[#F3F4F6]"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(prompt.id)}
                        className="p-1.5 text-[#9CA3AF] hover:text-red-500 transition-colors rounded-md hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
