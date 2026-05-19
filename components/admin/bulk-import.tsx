'use client';

import { useState, useRef } from 'react';
import { Upload, FileJson, FileText, CircleAlert as AlertCircle, CircleCheck as CheckCircle2 } from 'lucide-react';
import { createEntity, upsertTaxonomy, createEvidence } from '@/lib/queries';
import type { Entity } from '@/lib/types';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export function BulkImport({ onComplete }: { onComplete: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const processData = async (data: any[]): Promise<ImportResult> => {
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    for (const item of data) {
      try {
        const entity = await createEntity({
          name: item.name || item.Name,
          type: item.type || item.Type || 'App',
          focus: item.focus || item.Focus || 'Wellness',
          description: item.description || item.Description || '',
          affective_ai: item.affective_ai === true || item.affective_ai === 'true' || false,
          ai_details: item.ai_details || '',
          ai_description: item.ai_description || '',
          url: item.url || item.URL || '',
          logo_url: item.logo_url || '',
          platform: (item.platform || '').split(',').map((s: string) => s.trim()).filter(Boolean),
          markets: (item.markets || '').split(',').map((s: string) => s.trim()).filter(Boolean),
          languages: (item.languages || '').split(',').map((s: string) => s.trim()).filter(Boolean),
          age_group: item.age_group || 'All ages',
          business_model: item.business_model ? (item.business_model as string).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          security_features: item.security_features ? (item.security_features as string).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        });

        if (item.tags || item.conditions || item.frameworks) {
          const tags: { tag_name: string; tag_type: string }[] = [];
          const conditions = (item.conditions || item.tags || '').split(',').map((s: string) => s.trim()).filter(Boolean);
          const frameworks = (item.frameworks || '').split(',').map((s: string) => s.trim()).filter(Boolean);
          conditions.forEach((c: string) => tags.push({ tag_name: c, tag_type: 'condition' }));
          frameworks.forEach((f: string) => tags.push({ tag_name: f, tag_type: 'framework' }));
          if (tags.length) await upsertTaxonomy(entity.id, tags);
        }

        if (item.evidence_title || item.evidence_type) {
          await createEvidence({
            entity_id: entity.id,
            title: item.evidence_title || 'Study',
            source_url: item.evidence_url || '',
            type: item.evidence_type || 'Anecdotal',
            date: item.evidence_date || null,
            notes: item.evidence_notes || '',
            summary: item.evidence_summary || '',
          });
        }

        result.success++;
      } catch (err: any) {
        result.failed++;
        result.errors.push(`${item.name || 'Unknown'}: ${err.message}`);
      }
    }

    return result;
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    setResult(null);

    try {
      const text = await file.text();
      let data: any[];

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
        if (!Array.isArray(data)) data = [data];
      } else if (file.name.endsWith('.csv')) {
        const lines = text.split('\n').filter((l) => l.trim());
        const headers = lines[0].split(',').map((h) => h.trim().replace(/\"/g, ''));
        data = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim().replace(/\"/g, ''));
          return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] || '' }), {});
        });
      } else {
        throw new Error('Only .json and .csv files are supported');
      }

      const importResult = await processData(data);
      setResult(importResult);
      if (importResult.success > 0) onComplete();
    } catch (err: any) {
      setResult({ success: 0, failed: 1, errors: [err.message] });
    } finally {
      setLoading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragging ? 'border-[#3A5A40] bg-[#3A5A40]/5' : 'border-[#D1D5DB] hover:border-[#A3B18A] hover:bg-[#F9FAFB]'
        }`}
      >
        <input ref={fileRef} type="file" className="hidden" accept=".json,.csv" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-[#3A5A40] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[#6B7280]">Importing...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload size={28} className="text-[#9CA3AF]" />
            <div>
              <p className="text-sm font-medium text-[#1F2937]">Drop a file here or click to upload</p>
              <p className="text-xs text-[#9CA3AF] mt-1">Supports JSON and CSV formats</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#9CA3AF]">
              <span className="flex items-center gap-1"><FileJson size={12} /> JSON</span>
              <span className="flex items-center gap-1"><FileText size={12} /> CSV</span>
            </div>
          </div>
        )}
      </div>

      {result && (
        <div className={`rounded-lg p-4 border ${result.failed === 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {result.failed === 0 ? (
              <CheckCircle2 size={16} className="text-emerald-600" />
            ) : (
              <AlertCircle size={16} className="text-amber-600" />
            )}
            <p className="text-sm font-medium text-[#1F2937]">
              Import complete: {result.success} succeeded, {result.failed} failed
            </p>
          </div>
          {result.errors.length > 0 && (
            <ul className="space-y-1 mt-2">
              {result.errors.map((e, i) => (
                <li key={i} className="text-xs text-red-600">{e}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
        <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-2">Expected JSON format</p>
        <pre className="text-xs text-[#4B5563] overflow-x-auto">{`[{\n  "name": "App Name",\n  "type": "App",\n  "focus": "Clinical",\n  "description": "...",\n  "affective_ai": false,\n  "url": "https://...",\n  "platform": "iOS, Android",\n  "markets": "Global, United States",\n  "languages": "English, Spanish",\n  "conditions": "Anxiety, Depression",\n  "frameworks": "CBT, DBT",\n  "evidence_title": "Study title",\n  "evidence_type": "RCT",\n  "evidence_url": "https://..."\n}]`}</pre>
      </div>
    </div>
  );
}
