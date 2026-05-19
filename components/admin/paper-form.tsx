'use client';

import { useState, useEffect } from 'react';
import { CircleCheck as CheckCircle2 } from 'lucide-react';
import { createPaper, updatePaper } from '@/lib/queries';
import { CONDITIONS, FRAMEWORKS, EVIDENCE_LEVEL_ORDER } from '@/lib/types';
import type { Paper, EvidenceType } from '@/lib/types';

const EVIDENCE_TYPES = Object.keys(EVIDENCE_LEVEL_ORDER) as EvidenceType[];

interface PaperFormProps {
  paper?: Paper;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PaperForm({ paper, onSuccess, onCancel }: PaperFormProps) {
  const [title, setTitle] = useState(paper?.title ?? '');
  const [authorsRaw, setAuthorsRaw] = useState(paper?.authors.join(', ') ?? '');
  const [abstract, setAbstract] = useState(paper?.abstract ?? '');
  const [summary, setSummary] = useState(paper?.summary ?? '');
  const [arxivId, setArxivId] = useState(paper?.arxiv_id ?? '');
  const [doi, setDoi] = useState(paper?.doi ?? '');
  const [journal, setJournal] = useState(paper?.journal ?? '');
  const [year, setYear] = useState<string>(paper?.year?.toString() ?? '');
  const [url, setUrl] = useState(paper?.url ?? '');
  const [evidenceType, setEvidenceType] = useState(paper?.evidence_type ?? '');
  const [openAccess, setOpenAccess] = useState(paper?.open_access ?? false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(paper?.conditions ?? []);
  const [selectedFrameworks, setSelectedFrameworks] = useState<string[]>(paper?.frameworks ?? []);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const toggleItem = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }

    setSaving(true);
    setError('');

    try {
      const data = {
        title: title.trim(),
        authors: authorsRaw.split(',').map((a) => a.trim()).filter(Boolean),
        abstract: abstract.trim(),
        summary: summary.trim(),
        arxiv_id: arxivId.trim(),
        doi: doi.trim(),
        journal: journal.trim(),
        year: year ? parseInt(year, 10) : null,
        url: url.trim(),
        evidence_type: evidenceType,
        open_access: openAccess,
        conditions: selectedConditions,
        frameworks: selectedFrameworks,
      };

      if (paper) {
        await updatePaper(paper.id, data);
      } else {
        await createPaper(data);
      }

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onSuccess();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 text-sm bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#A3B18A] focus:ring-2 focus:ring-[#A3B18A]/20 text-[#1F2937] placeholder:text-[#9CA3AF]';
  const labelClass = 'block text-xs font-semibold text-[#4B5563] mb-1.5 uppercase tracking-wide';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
          <CheckCircle2 size={15} />
          {paper ? 'Changes saved successfully' : 'Paper added successfully'}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="Full paper title" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Authors</label>
          <input value={authorsRaw} onChange={(e) => setAuthorsRaw(e.target.value)} className={inputClass} placeholder="Author A, Author B, Author C" />
          <p className="text-[10px] text-[#9CA3AF] mt-1">Comma-separated</p>
        </div>
        <div>
          <label className={labelClass}>Year</label>
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} placeholder="2024" min="1990" max="2030" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Journal / Conference</label>
          <input value={journal} onChange={(e) => setJournal(e.target.value)} className={inputClass} placeholder="Nature, JMIR, NeurIPS\u2026" />
        </div>
        <div>
          <label className={labelClass}>Evidence Type</label>
          <select value={evidenceType} onChange={(e) => setEvidenceType(e.target.value)} className={inputClass}>
            <option value="">\u2014 None \u2014</option>
            {EVIDENCE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>ArXiv ID</label>
          <input value={arxivId} onChange={(e) => setArxivId(e.target.value)} className={inputClass} placeholder="2512.04124" />
        </div>
        <div>
          <label className={labelClass}>DOI</label>
          <input value={doi} onChange={(e) => setDoi(e.target.value)} className={inputClass} placeholder="10.1000/xyz123" />
        </div>
      </div>

      <div>
        <label className={labelClass}>URL</label>
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className={inputClass} placeholder="https://arxiv.org/abs/..." />
      </div>

      <div>
        <label className={labelClass}>Abstract</label>
        <textarea value={abstract} onChange={(e) => setAbstract(e.target.value)} rows={4} className={`${inputClass} resize-none`} placeholder="Paste the full abstract here\u2026" />
      </div>

      <div>
        <label className={labelClass}>Editorial Summary</label>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className={`${inputClass} resize-none`} placeholder="A brief plain-English summary of what this paper is about and why it matters\u2026" />
        <p className="text-[10px] text-[#9CA3AF] mt-1">This is shown on the card instead of the abstract.</p>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setOpenAccess((v) => !v)}
            className={`w-9 h-5 rounded-full relative transition-colors cursor-pointer ${openAccess ? 'bg-[#3A5A40]' : 'bg-[#D1D5DB]'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${openAccess ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-sm text-[#4B5563]">Open access</span>
        </label>
      </div>

      <div>
        <label className={labelClass}>Conditions</label>
        <div className="flex flex-wrap gap-1.5">
          {CONDITIONS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleItem(selectedConditions, c, setSelectedConditions)}
              className={`tag-pill text-[11px] transition-all ${
                selectedConditions.includes(c)
                  ? 'bg-[#3A5A40] text-white border-[#3A5A40]'
                  : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#A3B18A]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelClass}>Frameworks</label>
        <div className="flex flex-wrap gap-1.5">
          {FRAMEWORKS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggleItem(selectedFrameworks, f, setSelectedFrameworks)}
              className={`tag-pill text-[11px] transition-all ${
                selectedFrameworks.includes(f)
                  ? 'bg-[#A3B18A]/80 text-white border-[#A3B18A]'
                  : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#A3B18A]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || saved}
          className="flex-1 sm:flex-none sm:px-6 py-2 bg-[#3A5A40] hover:bg-[#2d4731] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving\u2026' : saved ? 'Saved' : paper ? 'Update Paper' : 'Add Paper'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937] text-sm rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
