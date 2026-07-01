export type EntityType = 'App' | 'Research' | 'VC' | 'App/Research';
export type EntityFocus = 'Clinical' | 'Wellness' | 'Both';
export type EvidenceType = 'RCT' | 'Pilot' | 'Peer-reviewed' | 'Anecdotal' | 'Meta-analysis' | 'Observational';
// Free-text "part of the app" section label (e.g. "AI Chat with Fy", "Onboarding").
export type MediaCategory = string;
export const MEDIA_CATEGORY_SUGGESTIONS = ['Onboarding', 'AI-Interaction', 'Dashboard', 'General'];
export type TagType = 'condition' | 'framework' | 'general';
export type AgeGroup = 'Adults' | 'Children & Adolescents' | 'All ages';

export const AGE_GROUPS: AgeGroup[] = ['Adults', 'Children & Adolescents', 'All ages'];

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  focus: EntityFocus;
  description: string;
  affective_ai: boolean;
  ai_details: string;
  ai_description: string;
  url: string;
  logo_url: string;
  markets: string[];
  languages: string[];
  platform: string[];
  age_group: AgeGroup;
  business_model: string[];
  security_features: string[];
  created_at: string;
  updated_at: string;
}

export interface Evidence {
  id: string;
  entity_id: string;
  title: string;
  source_url: string;
  type: EvidenceType;
  date: string | null;
  notes: string;
  summary: string;
  created_at: string;
}

export interface Media {
  id: string;
  entity_id: string;
  image_url: string;
  caption: string;
  category: MediaCategory;
  sort_order: number;
  created_at: string;
}

export interface Taxonomy {
  id: string;
  entity_id: string;
  tag_name: string;
  tag_type: TagType;
  created_at: string;
}

export interface EntityWithRelations extends Entity {
  evidence: Evidence[];
  media: Media[];
  taxonomy: Taxonomy[];
}

export interface Paper {
  id: string;
  title: string;
  authors: string[];
  abstract: string;
  summary: string;
  arxiv_id: string;
  doi: string;
  journal: string;
  year: number | null;
  url: string;
  conditions: string[];
  frameworks: string[];
  evidence_type: string;
  open_access: boolean;
  source_evidence_id?: string | null;
  created_at: string;
  updated_at: string;
}

export const AUTO_PAPER_EVIDENCE_TYPES: EvidenceType[] = ['RCT', 'Meta-analysis', 'Observational'];

export interface Prompt {
  id: string;
  title: string;
  prompt_text: string;
  description: string;
  condition: string;
  framework: string;
  use_case: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export const USE_CASES = [
  'Therapist', 'Self-guided user', 'App builder', 'Researcher', 'Clinician', 'Coach', 'Student'
];

export type Database = {
  public: {
    Tables: {
      entities: {
        Row: Entity;
        Insert: Omit<Entity, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Entity, 'id' | 'created_at' | 'updated_at'>>;
      };
      evidence: {
        Row: Evidence;
        Insert: Omit<Evidence, 'id' | 'created_at'>;
        Update: Partial<Omit<Evidence, 'id' | 'created_at'>>;
      };
      media: {
        Row: Media;
        Insert: Omit<Media, 'id' | 'created_at'>;
        Update: Partial<Omit<Media, 'id' | 'created_at'>>;
      };
      taxonomy: {
        Row: Taxonomy;
        Insert: Omit<Taxonomy, 'id' | 'created_at'>;
        Update: Partial<Omit<Taxonomy, 'id' | 'created_at'>>;
      };
    };
  };
};

export const EVIDENCE_LEVEL_ORDER: Record<EvidenceType, number> = {
  'RCT': 1,
  'Meta-analysis': 2,
  'Peer-reviewed': 3,
  'Observational': 4,
  'Pilot': 5,
  'Anecdotal': 6,
};

export const EVIDENCE_COLORS: Record<EvidenceType, string> = {
  'RCT': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Meta-analysis': 'bg-blue-100 text-blue-800 border-blue-200',
  'Peer-reviewed': 'bg-sky-100 text-sky-800 border-sky-200',
  'Observational': 'bg-teal-100 text-teal-800 border-teal-200',
  'Pilot': 'bg-amber-100 text-amber-800 border-amber-200',
  'Anecdotal': 'bg-stone-100 text-stone-600 border-stone-200',
};

export const BUSINESS_MODELS = ['B2B', 'B2C', 'B2B2C', 'Platform'] as const;
export type BusinessModel = typeof BUSINESS_MODELS[number];

export const SECURITY_FEATURES = [
  'GDPR',
  'HIPAA',
  'CCPA',
  'Role-based Access Control',
  'Crisis Protocol',
  'Advanced Encryption',
] as const;
export type SecurityFeature = typeof SECURITY_FEATURES[number];

export const PLATFORMS = ['iOS', 'Android', 'Web'] as const;
export type Platform = typeof PLATFORMS[number];

export const MARKETS = [
  'Global', 'United States', 'United Kingdom', 'European Union', 'Canada',
  'Australia', 'Germany', 'France', 'Netherlands', 'Nordics', 'Asia-Pacific',
  'Latin America', 'Middle East', 'Africa'
];

export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Dutch', 'Portuguese',
  'Italian', 'Japanese', 'Korean', 'Mandarin', 'Arabic', 'Swedish',
  'Norwegian', 'Danish', 'Finnish', 'Polish', 'Russian'
];

export const CONDITIONS = [
  'Depression', 'Anxiety', 'PTSD', 'OCD', 'Bipolar Disorder',
  'Schizophrenia', 'Eating Disorders', 'ADHD', 'Postpartum Depression',
  'Worry Spirals', 'General Mental Health', 'Stress', 'Burnout', 'Grief'
];

export const FRAMEWORKS = [
  'CBT', 'DBT', 'ACT', 'Mindfulness', 'Positive Psychology', 'PERMA',
  'Cognitive Reframing', 'Stoicism', 'Motivational Interviewing', 'Psychodynamic',
  'Solution-Focused', 'Narrative Therapy', 'EMDR'
];
