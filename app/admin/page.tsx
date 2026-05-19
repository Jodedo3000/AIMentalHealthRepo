'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus, ChartBar as BarChart3, Brain, FlaskConical, TrendingUp, X, LogOut,
  BookOpen, MessageSquare, LayoutGrid,
} from 'lucide-react';
import { Navigation } from '@/components/navigation';
import { EntityForm } from '@/components/admin/entity-form';
import { BulkImport } from '@/components/admin/bulk-import';
import { AdminLogin } from '@/components/admin/admin-login';
import { EntitiesTable } from '@/components/admin/entities-table';
import { PaperForm } from '@/components/admin/paper-form';
import { PapersTable } from '@/components/admin/papers-table';
import { PromptForm } from '@/components/admin/prompt-form';
import { PromptsTable } from '@/components/admin/prompts-table';
import { getEntities, deleteEntity, getPapers, deletePaper, getPrompts, deletePrompt } from '@/lib/queries';
import { supabase } from '@/lib/supabase';
import type { EntityWithRelations, Paper, Prompt } from '@/lib/types';

const ADMIN_EMAIL = 'jdommnich@gmail.com';

type Section = 'entities' | 'papers' | 'prompts';
type EntityTab = 'list' | 'add' | 'import';
type PaperTab = 'list' | 'add';
type PromptTab = 'list' | 'add';

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  const [entities, setEntities] = useState<EntityWithRelations[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loadingEntities, setLoadingEntities] = useState(true);
  const [loadingPapers, setLoadingPapers] = useState(true);
  const [loadingPrompts, setLoadingPrompts] = useState(true);

  const [section, setSection] = useState<Section>('entities');
  const [entityTab, setEntityTab] = useState<EntityTab>('list');
  const [paperTab, setPaperTab] = useState<PaperTab>('list');
  const [promptTab, setPromptTab] = useState<PromptTab>('list');

  const [editingEntity, setEditingEntity] = useState<EntityWithRelations | null>(null);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'entity' | 'paper' | 'prompt'; id: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(session?.user?.email === ADMIN_EMAIL);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(session?.user?.email === ADMIN_EMAIL);
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadEntities = useCallback(async () => {
    setLoadingEntities(true);
    try { setEntities(await getEntities()); }
    finally { setLoadingEntities(false); }
  }, []);

  const loadPapers = useCallback(async () => {
    setLoadingPapers(true);
    try { setPapers(await getPapers()); }
    finally { setLoadingPapers(false); }
  }, []);

  const loadPrompts = useCallback(async () => {
    setLoadingPrompts(true);
    try { setPrompts(await getPrompts()); }
    finally { setLoadingPrompts(false); }
  }, []);

  useEffect(() => {
    if (authed) {
      loadEntities();
      loadPapers();
      loadPrompts();
    }
  }, [authed, loadEntities, loadPapers, loadPrompts]);

  const handleSignOut = async () => { await supabase.auth.signOut(); };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'entity') { await deleteEntity(deleteConfirm.id); await loadEntities(); }
    if (deleteConfirm.type === 'paper') { await deletePaper(deleteConfirm.id); await loadPapers(); }
    if (deleteConfirm.type === 'prompt') { await deletePrompt(deleteConfirm.id); await loadPrompts(); }
    setDeleteConfirm(null);
  };

  if (authed === null) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#3A5A40] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />;
  }

  const stats = {
    entities: entities.length,
    apps: entities.filter((e) => e.type === 'App' || e.type === 'App/Research').length,
    papers: papers.length,
    prompts: prompts.length,
  };

  const sectionTabs = [
    { key: 'entities' as Section, label: 'Entities', icon: LayoutGrid, count: stats.entities },
    { key: 'papers' as Section, label: 'Papers', icon: BookOpen, count: stats.papers },
    { key: 'prompts' as Section, label: 'Prompts', icon: MessageSquare, count: stats.prompts },
  ];

  const entityInnerTabs: [EntityTab, string][] = [
    ['list', 'All Entities'],
    ['add', editingEntity ? 'Edit Entity' : 'Add Entity'],
    ['import', 'Bulk Import'],
  ];

  const paperInnerTabs: [PaperTab, string][] = [
    ['list', 'All Papers'],
    ['add', editingPaper ? 'Edit Paper' : 'Add Paper'],
  ];

  const promptInnerTabs: [PromptTab, string][] = [
    ['list', 'All Prompts'],
    ['add', editingPrompt ? 'Edit Prompt' : 'Add Prompt'],
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navigation />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937] tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-[#9CA3AF] mt-1">Manage entities, research papers, and prompts</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#1F2937] border border-[#E5E7EB] rounded-lg px-3 py-1.5 hover:border-[#D1D5DB] transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Entities', value: stats.entities, icon: BarChart3, color: 'text-[#3A5A40]', bg: 'bg-[#3A5A40]/8' },
            { label: 'Apps', value: stats.apps, icon: Brain, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Papers', value: stats.papers, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Prompts', value: stats.prompts, icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E5E7EB] p-4">
              <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon size={16} className={s.color} />
              </div>
              <p className="text-2xl font-bold text-[#1F2937]">{s.value}</p>
              <p className="text-xs text-[#9CA3AF] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          {sectionTabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                section === key
                  ? 'bg-[#3A5A40] text-white border-[#3A5A40]'
                  : 'bg-white text-[#4B5563] border-[#E5E7EB] hover:border-[#A3B18A] hover:text-[#1F2937]'
              }`}
            >
              <Icon size={14} />
              {label}
              <span className={`text-[10px] rounded-full px-1.5 py-0.5 font-semibold ${
                section === key ? 'bg-white/20 text-white' : 'bg-[#F3F4F6] text-[#6B7280]'
              }`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          {section === 'entities' && (
            <>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#F3F4F6]">
                <div className="flex">
                  {entityInnerTabs.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => { setEntityTab(key); if (key !== 'add') setEditingEntity(null); }}
                      className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                        entityTab === key ? 'bg-[#F3F4F6] text-[#1F2937]' : 'text-[#6B7280] hover:text-[#1F2937]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {entityTab === 'list' && (
                  <button
                    onClick={() => { setEditingEntity(null); setEntityTab('add'); }}
                    className="flex items-center gap-1.5 bg-[#3A5A40] hover:bg-[#2d4731] text-white text-sm font-medium rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <Plus size={14} /> New Entity
                  </button>
                )}
              </div>
              <div className="p-5">
                {entityTab === 'list' && (
                  <EntitiesTable
                    entities={entities}
                    loading={loadingEntities}
                    onEdit={(entity) => { setEditingEntity(entity); setEntityTab('add'); }}
                    onDelete={(id) => setDeleteConfirm({ type: 'entity', id })}
                  />
                )}
                {entityTab === 'add' && (
                  <EntityForm
                    key={editingEntity?.id ?? 'new'}
                    entity={editingEntity ?? undefined}
                    onSuccess={async () => { setEntityTab('list'); setEditingEntity(null); await loadEntities(); }}
                    onCancel={() => { setEntityTab('list'); setEditingEntity(null); }}
                  />
                )}
                {entityTab === 'import' && (
                  <BulkImport onComplete={async () => { await loadEntities(); }} />
                )}
              </div>
            </>
          )}

          {section === 'papers' && (
            <>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#F3F4F6]">
                <div className="flex">
                  {paperInnerTabs.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => { setPaperTab(key); if (key !== 'add') setEditingPaper(null); }}
                      className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                        paperTab === key ? 'bg-[#F3F4F6] text-[#1F2937]' : 'text-[#6B7280] hover:text-[#1F2937]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {paperTab === 'list' && (
                  <button
                    onClick={() => { setEditingPaper(null); setPaperTab('add'); }}
                    className="flex items-center gap-1.5 bg-[#3A5A40] hover:bg-[#2d4731] text-white text-sm font-medium rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <Plus size={14} /> New Paper
                  </button>
                )}
              </div>
              <div className="p-5">
                {paperTab === 'list' && (
                  <PapersTable
                    papers={papers}
                    loading={loadingPapers}
                    onEdit={(paper) => { setEditingPaper(paper); setPaperTab('add'); }}
                    onDelete={(id) => setDeleteConfirm({ type: 'paper', id })}
                  />
                )}
                {paperTab === 'add' && (
                  <PaperForm
                    key={editingPaper?.id ?? 'new'}
                    paper={editingPaper ?? undefined}
                    onSuccess={async () => { setPaperTab('list'); setEditingPaper(null); await loadPapers(); }}
                    onCancel={() => { setPaperTab('list'); setEditingPaper(null); }}
                  />
                )}
              </div>
            </>
          )}

          {section === 'prompts' && (
            <>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#F3F4F6]">
                <div className="flex">
                  {promptInnerTabs.map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => { setPromptTab(key); if (key !== 'add') setEditingPrompt(null); }}
                      className={`px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                        promptTab === key ? 'bg-[#F3F4F6] text-[#1F2937]' : 'text-[#6B7280] hover:text-[#1F2937]'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {promptTab === 'list' && (
                  <button
                    onClick={() => { setEditingPrompt(null); setPromptTab('add'); }}
                    className="flex items-center gap-1.5 bg-[#3A5A40] hover:bg-[#2d4731] text-white text-sm font-medium rounded-lg px-3 py-1.5 transition-colors"
                  >
                    <Plus size={14} /> New Prompt
                  </button>
                )}
              </div>
              <div className="p-5">
                {promptTab === 'list' && (
                  <PromptsTable
                    prompts={prompts}
                    loading={loadingPrompts}
                    onEdit={(prompt) => { setEditingPrompt(prompt); setPromptTab('add'); }}
                    onDelete={(id) => setDeleteConfirm({ type: 'prompt', id })}
                  />
                )}
                {promptTab === 'add' && (
                  <PromptForm
                    key={editingPrompt?.id ?? 'new'}
                    prompt={editingPrompt ?? undefined}
                    onSuccess={async () => { setPromptTab('list'); setEditingPrompt(null); await loadPrompts(); }}
                    onCancel={() => { setPromptTab('list'); setEditingPrompt(null); }}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-[#1F2937]">
                Delete {deleteConfirm.type}?
              </h3>
              <button onClick={() => setDeleteConfirm(null)} className="text-[#9CA3AF] hover:text-[#1F2937]">
                <X size={16} />
              </button>
            </div>
            <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">
              This will permanently delete this {deleteConfirm.type}. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937] font-medium rounded-lg px-4 py-2 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
