'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2, ExternalLink, BookOpen } from 'lucide-react';
import type { Paper } from '@/lib/types';

type SortKey = 'title' | 'year' | 'journal' | 'evidence_type';
type SortDir = 'asc' | 'desc';

interface PapersTableProps {
  papers: Paper[];
  loading: boolean;
  onEdit: (paper: Paper) => void;
  onDelete: (id: string) => void;
}

export function PapersTable({ papers, loading, onEdit, onDelete }: PapersTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('year');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
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
      ? papers.filter((p) =>
          p.title.toLowerCase().includes(q) ||
          p.authors.some((a) => a.toLowerCase().includes(q)) ||
          p.journal.toLowerCase().includes(q) ||
          p.arxiv_id.toLowerCase().includes(q)
        )
      : papers;

    return [...list].sort((a, b) => {
      let av: any, bv: any;
      if (sortKey === 'year') { av = a.year ?? 0; bv = b.year ?? 0; }
      else { av = (a[sortKey] ?? '').toString().toLowerCase(); bv = (b[sortKey] ?? '').toString().toLowerCase(); }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [papers, sortKey, sortDir, search]);

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
          placeholder="Search papers\u2026"
          className="flex-1 px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#A3B18A] focus:ring-2 focus:ring-[#A3B18A]/20 text-[#1F2937] placeholder:text-[#9CA3AF]"
        />
        <span className="text-xs text-[#9CA3AF] shrink-0">{filtered.length} / {papers.length}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center mb-3">
            <BookOpen size={18} className="text-[#9CA3AF]" />
          </div>
          <p className="text-sm text-[#6B7280]">{papers.length === 0 ? 'No papers added yet' : 'No results match your search'}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[#E5E7EB]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                {([
                  ['title', 'Title'],
                  ['year', 'Year'],
                  ['journal', 'Journal'],
                  ['evidence_type', 'Evidence'],
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
              {filtered.map((paper) => (
                <tr key={paper.id} className="hover:bg-[#FAFAFA] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5 max-w-xs">
                      <span className="font-medium text-[#1F2937] line-clamp-2 text-xs leading-snug">{paper.title}</span>
                      {paper.authors.length > 0 && (
                        <span className="text-[10px] text-[#9CA3AF] truncate">
                          {paper.authors.slice(0, 2).join(', ')}{paper.authors.length > 2 ? ` +${paper.authors.length - 2}` : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#4B5563] text-xs whitespace-nowrap">{paper.year || '\u2014'}</td>
                  <td className="px-4 py-3 text-[#4B5563] text-xs max-w-[160px] truncate">{paper.journal || '\u2014'}</td>
                  <td className="px-4 py-3">
                    {paper.evidence_type ? (
                      <span className="tag-pill bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                        {paper.evidence_type}
                      </span>
                    ) : (
                      <span className="text-[#9CA3AF] text-xs">\u2014</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {paper.url && (
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#9CA3AF] hover:text-[#3A5A40] transition-colors rounded-md hover:bg-[#F3F4F6]"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <button
                        onClick={() => onEdit(paper)}
                        className="p-1.5 text-[#9CA3AF] hover:text-[#3A5A40] transition-colors rounded-md hover:bg-[#F3F4F6]"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(paper.id)}
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
