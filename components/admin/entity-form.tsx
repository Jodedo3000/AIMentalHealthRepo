'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, X, CircleCheck as CheckCircle2, GripVertical, Pencil } from 'lucide-react';
import { CONDITIONS, FRAMEWORKS, PLATFORMS, MARKETS, LANGUAGES, AGE_GROUPS, SECURITY_FEATURES, BUSINESS_MODELS, AUTO_PAPER_EVIDENCE_TYPES } from '@/lib/types';
import type { EntityWithRelations, EntityType, EntityFocus, EvidenceType, MediaCategory, AgeGroup } from '@/lib/types';
import { createEntity, updateEntity, createEvidence, deleteEvidence, createMedia, deleteMedia, updateMediaSortOrder, upsertTaxonomy, createPaper } from '@/lib/queries';
import { ImageUpload } from '@/components/admin/image-upload';

interface EntityFormProps {
  entity?: EntityWithRelations;
  onSuccess: () => void;
  onCancel: () => void;
}

const ENTITY_TYPES: EntityType[] = ['App', 'Research', 'VC', 'App/Research'];
const ENTITY_FOCUSES: EntityFocus[] = ['Clinical', 'Wellness', 'Both'];
const EVIDENCE_TYPES: EvidenceType[] = ['RCT', 'Meta-analysis', 'Peer-reviewed', 'Observational', 'Pilot', 'Anecdotal'];
const MEDIA_CATEGORIES: MediaCategory[] = ['Onboarding', 'AI-Interaction', 'Dashboard', 'General'];

export function EntityForm({ entity, onSuccess, onCancel }: EntityFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => {
      setSaved(false);
      onSuccess();
    }, 1800);
    return () => clearTimeout(t);
  }, [saved, onSuccess]);

  const [name, setName] = useState(entity?.name ?? '');
  const [type, setType] = useState<EntityType>(entity?.type ?? 'App');
  const [focus, setFocus] = useState<EntityFocus>(entity?.focus ?? 'Wellness');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(entity?.age_group ?? 'All ages');
  const [selectedBusinessModels, setSelectedBusinessModels] = useState<string[]>(entity?.business_model ?? []);
  const [description, setDescription] = useState(entity?.description ?? '');
  const [affectiveAi, setAffectiveAi] = useState(entity?.affective_ai ?? false);
  const [aiDetails, setAiDetails] = useState(entity?.ai_details ?? '');
  const [aiDescription, setAiDescription] = useState(entity?.ai_description ?? '');
  const [url, setUrl] = useState(entity?.url ?? '');
  const [logoUrl, setLogoUrl] = useState(entity?.logo_url ?? '');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(entity?.platform ?? []);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(entity?.markets ?? []);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(entity?.languages ?? []);

  const toggleItem = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const [selectedTags, setSelectedTags] = useState<{ name: string; type: string }[]>(
    entity?.taxonomy.map((t) => ({ name: t.tag_name, type: t.tag_type })) ?? []
  );

  const [evidenceList, setEvidenceList] = useState(entity?.evidence ?? []);
  const [deletedEvidenceIds, setDeletedEvidenceIds] = useState<string[]>([]);
  const [newEvidence, setNewEvidence] = useState({
    title: '', source_url: '', type: 'Pilot' as EvidenceType, date: '', notes: '', summary: ''
  });

  const [selectedSecurity, setSelectedSecurity] = useState<string[]>(entity?.security_features ?? []);

  const [mediaList, setMediaList] = useState(entity?.media ?? []);
  const [newMediaCaption, setNewMediaCaption] = useState('');
  const [newMediaCategory, setNewMediaCategory] = useState<MediaCategory>('General');

  const toggleTag = (tagName: string, tagType: string) => {
    setSelectedTags((prev) =>
      prev.some((t) => t.name === tagName)
        ? prev.filter((t) => t.name !== tagName)
        : [...prev, { name: tagName, type: tagType }]
    );
  };

  const addEvidence = () => {
    if (!newEvidence.title) return;
    setEvidenceList((prev) => [...prev, { ...newEvidence, id: `new-${Date.now()}`, entity_id: entity?.id ?? '', created_at: '' }]);
    setNewEvidence({ title: '', source_url: '', type: 'Pilot', date: '', notes: '', summary: '' });
  };

  const removeEvidence = (id: string) => {
    if (!id.startsWith('new-')) {
      setDeletedEvidenceIds((prev) => [...prev, id]);
    }
    setEvidenceList((prev) => prev.filter((e) => e.id !== id));
  };

  const loadEvidenceForEdit = (ev: typeof evidenceList[0]) => {
    if (!ev.id.startsWith('new-')) {
      setDeletedEvidenceIds((prev) => [...prev, ev.id]);
    }
    setEvidenceList((prev) => prev.filter((e) => e.id !== ev.id));
    setNewEvidence({
      title: ev.title,
      source_url: ev.source_url,
      type: ev.type,
      date: ev.date ?? '',
      notes: ev.notes,
      summary: ev.summary ?? '',
    });
  };

  const handleImageUploaded = (imageUrl: string) => {
    setMediaList((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        entity_id: entity?.id ?? '',
        image_url: imageUrl,
        caption: newMediaCaption,
        category: newMediaCategory,
        sort_order: prev.length,
        created_at: '',
      },
    ]);
    setNewMediaCaption('');
  };

  const removeMedia = async (id: string) => {
    if (!id.startsWith('new-') && entity) {
      await deleteMedia(id);
    }
    setMediaList((prev) => prev.filter((m) => m.id !== id));
  };

  const dragIndex = useRef<number | null>(null);
  const dragOverIndex = useRef<number | null>(null);

  const handleDragStart = (index: number) => {
    dragIndex.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverIndex.current = index;
    if (dragIndex.current === null || dragIndex.current === index) return;
    setMediaList((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex.current!, 1);
      next.splice(index, 0, moved);
      dragIndex.current = index;
      return next.map((m, i) => ({ ...m, sort_order: i }));
    });
  };

  const handleDragEnd = async () => {
    dragIndex.current = null;
    dragOverIndex.current = null;
    for (let i = 0; i < mediaList.length; i++) {
      const m = mediaList[i];
      if (!m.id.startsWith('new-')) {
        await updateMediaSortOrder(m.id, i);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }

    setLoading(true);
    setError('');
    try {
      let entityId = entity?.id;

      const entityData = {
        name, type, focus, description,
        affective_ai: affectiveAi, ai_details: aiDetails, ai_description: aiDescription,
        url, logo_url: logoUrl,
        platform: selectedPlatforms,
        markets: selectedMarkets,
        languages: selectedLanguages,
        age_group: ageGroup,
        business_model: selectedBusinessModels,
        security_features: selectedSecurity,
      };

      if (entity) {
        await updateEntity(entity.id, entityData);
      } else {
        const created = await createEntity(entityData);
        entityId = created.id;
      }

      if (!entityId) throw new Error('Failed to get entity ID');

      for (const id of deletedEvidenceIds) {
        await deleteEvidence(id);
      }

      const pendingEvidence = newEvidence.title.trim()
        ? [...evidenceList, { ...newEvidence, id: `new-${Date.now()}`, entity_id: entityId, created_at: '' }]
        : evidenceList;

      for (const ev of pendingEvidence) {
        if (ev.id.startsWith('new-')) {
          const created = await createEvidence({ entity_id: entityId, title: ev.title, source_url: ev.source_url, type: ev.type, date: ev.date || null, notes: ev.notes, summary: ev.summary ?? '' });
          if (AUTO_PAPER_EVIDENCE_TYPES.includes(ev.type)) {
            const yearVal = ev.date ? parseInt(ev.date.substring(0, 4), 10) : null;
            await createPaper({
              title: ev.title,
              authors: [],
              abstract: ev.summary ?? '',
              summary: ev.notes ?? '',
              arxiv_id: '',
              doi: '',
              journal: '',
              year: yearVal && !isNaN(yearVal) ? yearVal : null,
              url: ev.source_url ?? '',
              conditions: [],
              frameworks: [],
              evidence_type: ev.type,
              open_access: false,
              source_evidence_id: created.id,
            });
          }
        }
      }

      for (const m of mediaList) {
        if (m.id.startsWith('new-')) {
          await createMedia({ entity_id: entityId, image_url: m.image_url, caption: m.caption, category: m.category, sort_order: m.sort_order });
        }
      }

      await upsertTaxonomy(entityId, selectedTags.map((t) => ({ tag_name: t.name, tag_type: t.type })));

      setSaved(true);
      setTimeout(() => onSuccess(), 1200);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm text-[#1F2937] bg-white focus:outline-none focus:ring-2 focus:ring-[#3A5A40]/20 focus:border-[#3A5A40] transition-all placeholder:text-[#9CA3AF]";
  const labelClass = "block text-xs font-semibold text-[#6B7280] uppercase tracking-wide mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>Name *</label>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Woebot Health" required />
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as EntityType)}>
            {ENTITY_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Focus</label>
          <select className={inputClass} value={focus} onChange={(e) => setFocus(e.target.value as EntityFocus)}>
            {ENTITY_FOCUSES.map((f) => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Age Group</label>
          <div className="flex gap-2">
            {AGE_GROUPS.map((ag) => (
              <button
                key={ag}
                type="button"
                onClick={() => setAgeGroup(ag)}
                className={`flex-1 py-2 px-2 text-xs rounded-lg border font-medium transition-all ${
                  ageGroup === ag
                    ? 'bg-[#3A5A40] text-white border-[#3A5A40]'
                    : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#A3B18A]'
                }`}
              >
                {ag}
              </button>
            ))}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Business Model</label>
          <div className="flex gap-2 flex-wrap">
            {BUSINESS_MODELS.map((bm) => {
              const sel = selectedBusinessModels.includes(bm);
              return (
                <button
                  key={bm}
                  type="button"
                  onClick={() => toggleItem(selectedBusinessModels, bm, setSelectedBusinessModels)}
                  className={`py-2 px-4 text-xs rounded-lg border font-medium transition-all ${
                    sel
                      ? 'bg-[#0D4F6B] text-white border-[#0D4F6B]'
                      : 'bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#0D4F6B]/40 hover:text-[#0D4F6B]'
                  }`}
                >
                  {bm}
                </button>
              );
            })}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea className={inputClass} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the entity..." />
        </div>
        <div>
          <label className={labelClass}>Website URL</label>
          <input className={inputClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div>
          <label className={labelClass}>Logo URL</label>
          <input className={inputClass} value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="sm:col-span-2 space-y-3">
          <div>
            <label className={labelClass}>Platform</label>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map((p) => {
                const sel = selectedPlatforms.includes(p);
                return (
                  <button key={p} type="button"
                    onClick={() => toggleItem(selectedPlatforms, p, setSelectedPlatforms)}
                    className={`tag-pill cursor-pointer transition-all ${sel ? 'bg-[#3A5A40] text-white border-[#3A5A40]' : 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:border-[#3A5A40]/40 hover:text-[#3A5A40]'}`}
                  >{p}</button>
                );
              })}
            </div>
          </div>
          <div>
            <label className={labelClass}>Markets</label>
            <div className="flex flex-wrap gap-1.5">
              {MARKETS.map((m) => {
                const sel = selectedMarkets.includes(m);
                return (
                  <button key={m} type="button"
                    onClick={() => toggleItem(selectedMarkets, m, setSelectedMarkets)}
                    className={`tag-pill cursor-pointer transition-all ${sel ? 'bg-[#3A5A40] text-white border-[#3A5A40]' : 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:border-[#3A5A40]/40 hover:text-[#3A5A40]'}`}
                  >{m}</button>
                );
              })}
            </div>
          </div>
          <div>
            <label className={labelClass}>Languages</label>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.map((l) => {
                const sel = selectedLanguages.includes(l);
                return (
                  <button key={l} type="button"
                    onClick={() => toggleItem(selectedLanguages, l, setSelectedLanguages)}
                    className={`tag-pill cursor-pointer transition-all ${sel ? 'bg-[#3A5A40] text-white border-[#3A5A40]' : 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:border-[#3A5A40]/40 hover:text-[#3A5A40]'}`}
                  >{l}</button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <div
              className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${affectiveAi ? 'bg-[#3A5A40] border-[#3A5A40]' : 'border-[#D1D5DB] hover:border-[#A3B18A]'}`}
              onClick={() => setAffectiveAi(!affectiveAi)}
            >
              {affectiveAi && (
                <svg width="12" height="10" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm font-medium text-[#1F2937]">Uses Affective AI</span>
          </label>
          {affectiveAi && (
            <div className="mt-2">
              <input className={inputClass} value={aiDetails} onChange={(e) => setAiDetails(e.target.value)} placeholder="Describe the AI implementation..." />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>How AI is Used <span className="text-[#9CA3AF] font-normal">(markdown supported)</span></label>
        <textarea
          className={`${inputClass} resize-y leading-relaxed`}
          rows={12}
          value={aiDescription}
          onChange={(e) => setAiDescription(e.target.value)}
          placeholder={'Brief intro line...\n## Section heading\n- Bullet point one\n- Bullet point two\n## Another section\n- More details here'}
        />
        <p className="mt-1 text-xs text-[#9CA3AF]">Supports ## headings, **bold**, and - bullet lists</p>
      </div>

      <div>
        <label className={labelClass}>Security, Privacy & Safety</label>
        <div className="flex flex-wrap gap-2">
          {SECURITY_FEATURES.map((feat) => {
            const sel = selectedSecurity.includes(feat);
            return (
              <button
                key={feat}
                type="button"
                onClick={() => toggleItem(selectedSecurity, feat, setSelectedSecurity)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  sel
                    ? 'bg-[#0D4F6B] text-white border-[#0D4F6B]'
                    : 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:border-[#0D4F6B]/40 hover:text-[#0D4F6B]'
                }`}
              >
                {feat}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelClass}>Taxonomy Tags</label>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-[#9CA3AF] mb-2">Conditions</p>
            <div className="flex flex-wrap gap-1.5">
              {CONDITIONS.map((c) => {
                const selected = selectedTags.some((t) => t.name === c);
                return (
                  <button key={c} type="button" onClick={() => toggleTag(c, 'condition')}
                    className={`tag-pill cursor-pointer transition-all ${selected ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:border-slate-300 hover:text-slate-600'}`}
                  >{c}</button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="text-xs text-[#9CA3AF] mb-2">Frameworks</p>
            <div className="flex flex-wrap gap-1.5">
              {FRAMEWORKS.map((f) => {
                const selected = selectedTags.some((t) => t.name === f);
                return (
                  <button key={f} type="button" onClick={() => toggleTag(f, 'framework')}
                    className={`tag-pill cursor-pointer transition-all ${selected ? 'bg-[#3A5A40]/10 text-[#3A5A40] border-[#A3B18A]/50' : 'bg-[#F9FAFB] text-[#6B7280] border-[#E5E7EB] hover:border-[#A3B18A]/40 hover:text-[#3A5A40]'}`}
                  >{f}</button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Evidence</label>
        <div className="space-y-2 mb-3">
          {evidenceList.map((ev) => (
            <div key={ev.id} className="flex items-start gap-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg px-3 py-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#1F2937] truncate">{ev.title}</p>
                <p className="text-xs text-[#9CA3AF]">{ev.type}{ev.date ? ` \u00b7 ${ev.date}` : ''}</p>
                {ev.summary && <p className="text-xs text-[#6B7280] mt-0.5 line-clamp-2">{ev.summary}</p>}
              </div>
              <div className="flex items-center gap-1 shrink-0 mt-0.5">
                <button type="button" onClick={() => loadEvidenceForEdit(ev)} className="text-[#9CA3AF] hover:text-[#3A5A40] transition-colors">
                  <Pencil size={13} />
                </button>
                <button type="button" onClick={() => removeEvidence(ev.id)} className="text-[#9CA3AF] hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-[#F9FAFB] border border-dashed border-[#D1D5DB] rounded-lg p-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClass} value={newEvidence.title} onChange={(e) => setNewEvidence({ ...newEvidence, title: e.target.value })} placeholder="Evidence title" />
            <select className={inputClass} value={newEvidence.type} onChange={(e) => setNewEvidence({ ...newEvidence, type: e.target.value as EvidenceType })}>
              {EVIDENCE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className={inputClass} value={newEvidence.source_url} onChange={(e) => setNewEvidence({ ...newEvidence, source_url: e.target.value })} placeholder="Source URL" />
            <input className={inputClass} type="date" value={newEvidence.date} onChange={(e) => setNewEvidence({ ...newEvidence, date: e.target.value })} />
          </div>
          <textarea
            className={`${inputClass} resize-none`}
            rows={2}
            value={newEvidence.summary}
            onChange={(e) => setNewEvidence({ ...newEvidence, summary: e.target.value })}
            placeholder="Brief summary of the study findings..."
          />
          <button type="button" onClick={addEvidence} className="flex items-center gap-1.5 text-xs font-medium text-[#3A5A40] hover:text-[#2d4731] transition-colors">
            <Plus size={13} /> Add Evidence
          </button>
        </div>
      </div>

      <div>
        <label className={labelClass}>Screenshots / Media</label>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {mediaList.map((m, index) => (
            <div
              key={m.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="relative group rounded-lg overflow-hidden border border-[#E5E7EB] aspect-[9/16] bg-[#F3F4F6] cursor-grab active:cursor-grabbing"
            >
              <img src={m.image_url} alt={m.caption} className="w-full h-full object-cover pointer-events-none" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="absolute top-1 left-1 bg-black/40 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical size={12} className="text-white" />
              </div>
              <button type="button" onClick={() => removeMedia(m.id)} className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                <X size={12} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1.5 py-1 truncate">{m.caption || m.category}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Caption (optional)</label>
              <input
                className={inputClass}
                value={newMediaCaption}
                onChange={(e) => setNewMediaCaption(e.target.value)}
                placeholder="e.g., Onboarding screen"
              />
            </div>
            <div>
              <label className="block text-[10px] text-[#9CA3AF] mb-1 uppercase tracking-wide">Category</label>
              <select
                className={inputClass}
                value={newMediaCategory}
                onChange={(e) => setNewMediaCategory(e.target.value as MediaCategory)}
              >
                {MEDIA_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <ImageUpload onUploaded={handleImageUploaded} />
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg px-4 py-3 text-sm font-medium">
          <CheckCircle2 size={15} className="flex-shrink-0" />
          Changes saved successfully
        </div>
      )}

      <div className="flex items-center gap-3 pt-2 border-t border-[#F3F4F6]">
        <button
          type="submit"
          disabled={loading || saved}
          className="flex-1 bg-[#3A5A40] hover:bg-[#2d4731] text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : entity ? 'Update Entity' : 'Create Entity'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm font-medium text-[#6B7280] hover:text-[#1F2937] border border-[#E5E7EB] rounded-lg transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
