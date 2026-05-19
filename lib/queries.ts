import { supabase } from './supabase';
import type { Entity, Evidence, Media, Taxonomy, EntityWithRelations, Paper, Prompt } from './types';

export async function getEntities(): Promise<EntityWithRelations[]> {
  const { data: entities, error } = await supabase
    .from('entities')
    .select('*')
    .order('name');

  if (error) throw error;
  if (!entities?.length) return [];

  const ids = entities.map((e) => e.id);

  const [{ data: evidence }, { data: media }, { data: taxonomy }] = await Promise.all([
    supabase.from('evidence').select('*').in('entity_id', ids),
    supabase.from('media').select('*').in('entity_id', ids).order('sort_order'),
    supabase.from('taxonomy').select('*').in('entity_id', ids),
  ]);

  return entities.map((entity) => ({
    ...entity,
    evidence: (evidence || []).filter((e) => e.entity_id === entity.id),
    media: (media || []).filter((m) => m.entity_id === entity.id),
    taxonomy: (taxonomy || []).filter((t) => t.entity_id === entity.id),
  }));
}

export async function getEntityById(id: string): Promise<EntityWithRelations | null> {
  const { data: entity, error } = await supabase
    .from('entities')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!entity) return null;

  const [{ data: evidence }, { data: media }, { data: taxonomy }] = await Promise.all([
    supabase.from('evidence').select('*').eq('entity_id', id).order('date', { ascending: false }),
    supabase.from('media').select('*').eq('entity_id', id).order('sort_order'),
    supabase.from('taxonomy').select('*').eq('entity_id', id),
  ]);

  return {
    ...entity,
    evidence: evidence || [],
    media: media || [],
    taxonomy: taxonomy || [],
  };
}

export async function createEntity(data: Omit<Entity, 'id' | 'created_at' | 'updated_at'>): Promise<Entity> {
  const { data: entity, error } = await supabase
    .from('entities')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return entity as Entity;
}

export async function updateEntity(id: string, data: Partial<Omit<Entity, 'id' | 'created_at' | 'updated_at'>>) {
  const { data: entity, error } = await supabase
    .from('entities')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return entity as Entity;
}

export async function deleteEntity(id: string) {
  const { error } = await supabase.from('entities').delete().eq('id', id);
  if (error) throw error;
}

export async function createEvidence(data: Omit<Evidence, 'id' | 'created_at'>) {
  const { data: ev, error } = await supabase.from('evidence').insert(data).select().single();
  if (error) throw error;
  return ev as Evidence;
}

export async function deleteEvidence(id: string) {
  const { error } = await supabase.from('evidence').delete().eq('id', id);
  if (error) throw error;
}

export async function createMedia(data: Omit<Media, 'id' | 'created_at'>) {
  const { data: m, error } = await supabase.from('media').insert(data).select().single();
  if (error) throw error;
  return m as Media;
}

export async function deleteMedia(id: string) {
  const { error } = await supabase.from('media').delete().eq('id', id);
  if (error) throw error;
}

export async function updateMediaSortOrder(id: string, sortOrder: number) {
  const { error } = await supabase.from('media').update({ sort_order: sortOrder }).eq('id', id);
  if (error) throw error;
}

export async function upsertTaxonomy(entityId: string, tags: { tag_name: string; tag_type: string }[]) {
  await supabase.from('taxonomy').delete().eq('entity_id', entityId);
  if (!tags.length) return;
  const { error } = await supabase.from('taxonomy').insert(
    tags.map((t) => ({ entity_id: entityId, tag_name: t.tag_name, tag_type: t.tag_type }))
  );
  if (error) throw error;
}

export async function getAllTags(): Promise<{ tag_name: string; tag_type: string; count: number }[]> {
  const { data, error } = await supabase.from('taxonomy').select('tag_name, tag_type');
  if (error) throw error;

  const counts: Record<string, { tag_name: string; tag_type: string; count: number }> = {};
  for (const t of data || []) {
    if (!counts[t.tag_name]) {
      counts[t.tag_name] = { tag_name: t.tag_name, tag_type: t.tag_type, count: 0 };
    }
    counts[t.tag_name].count++;
  }
  return Object.values(counts).sort((a, b) => b.count - a.count);
}

export async function getPapers(): Promise<Paper[]> {
  const { data, error } = await supabase.from('papers').select('*').order('year', { ascending: false }).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Paper[];
}

export async function getPaperById(id: string): Promise<Paper | null> {
  const { data, error } = await supabase.from('papers').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Paper | null;
}

export async function createPaper(data: Omit<Paper, 'id' | 'created_at' | 'updated_at'>): Promise<Paper> {
  const { data: paper, error } = await supabase.from('papers').insert(data).select().single();
  if (error) throw error;
  return paper as Paper;
}

export async function updatePaper(id: string, data: Partial<Omit<Paper, 'id' | 'created_at' | 'updated_at'>>): Promise<Paper> {
  const { data: paper, error } = await supabase.from('papers').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return paper as Paper;
}

export async function deletePaper(id: string) {
  const { error } = await supabase.from('papers').delete().eq('id', id);
  if (error) throw error;
}

export async function getPrompts(): Promise<Prompt[]> {
  const { data, error } = await supabase.from('prompts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Prompt[];
}

export async function createPrompt(data: Omit<Prompt, 'id' | 'created_at' | 'updated_at'>): Promise<Prompt> {
  const { data: prompt, error } = await supabase.from('prompts').insert(data).select().single();
  if (error) throw error;
  return prompt as Prompt;
}

export async function updatePrompt(id: string, data: Partial<Omit<Prompt, 'id' | 'created_at' | 'updated_at'>>): Promise<Prompt> {
  const { data: prompt, error } = await supabase.from('prompts').update({ ...data, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return prompt as Prompt;
}

export async function deletePrompt(id: string) {
  const { error } = await supabase.from('prompts').delete().eq('id', id);
  if (error) throw error;
}
