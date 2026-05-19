'use client';

import { useState } from 'react';
import { CircleCheck as CheckCircle2 } from 'lucide-react';
import { createPrompt, updatePrompt } from '@/lib/queries';
import { CONDITIONS, FRAMEWORKS, USE_CASES } from '@/lib/types';
import type { Prompt } from '@/lib/types';

interface PromptFormProps {
  prompt?: Prompt;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PromptForm({ prompt, onSuccess, onCancel }: PromptFormProps) {
  const [title, setTitle] = useState(prompt?.title ?? '');
  const [promptText, setPromptText] = useState(prompt?.prompt_text ?? '');
  const [description, setDescription] = useState(prompt?.description ?? '');
  const [condition, setCondition] = useState(prompt?.condition ?? '');
  const [framework, setFramework] = useState(prompt?.framework ?? '');
  const [useCase, setUseCase] = useState(prompt?.use_case ?? '');
  const [tagsRaw, setTagsRaw] = useState(prompt?.tags.join(', ') ?? '');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (!promptText.trim()) { setError('Prompt text is required'); return; }

    setSaving(true);
    setError('');

    try {
      const data = {
        title: title.trim(),
        prompt_text: promptText.trim(),
        description: description.trim(),
        condition,
        framework,
        use_case: useCase,
        tags: tagsRaw.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (prompt) {
        await updatePrompt(prompt.id, data);
      } else {
        await createPrompt(data);
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
          {prompt ? 'Changes saved successfully' : 'Prompt added successfully'}
        </div>
      )}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. CBT thought record for anxiety" />
      </div>

      <div>
        <label className={labelClass}>Prompt Text *</label>
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          rows={6}
          className={`${inputClass} resize-none font-mono text-xs`}
          placeholder="You are a compassionate mental health support assistant\u2026"
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
          placeholder="When and why to use this prompt, who it\u2019s for\u2026"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Use Case</label>
          <select value={useCase} onChange={(e) => setUseCase(e.target.value)} className={inputClass}>
            <option value="">\u2014 None \u2014</option>
            {USE_CASES.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Condition</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass}>
            <option value="">\u2014 None \u2014</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Framework</label>
          <select value={framework} onChange={(e) => setFramework(e.target.value)} className={inputClass}>
            <option value="">\u2014 None \u2014</option>
            {FRAMEWORKS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Tags</label>
        <input value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)} className={inputClass} placeholder="crisis support, journaling, self-compassion" />
        <p className="text-[10px] text-[#9CA3AF] mt-1">Comma-separated</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || saved}
          className="flex-1 sm:flex-none sm:px-6 py-2 bg-[#3A5A40] hover:bg-[#2d4731] disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {saving ? 'Saving\u2026' : saved ? 'Saved' : prompt ? 'Update Prompt' : 'Add Prompt'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937] text-sm rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
