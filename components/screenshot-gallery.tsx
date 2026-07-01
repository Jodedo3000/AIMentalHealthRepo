'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, FlaskConical } from 'lucide-react';
import type { Media } from '@/lib/types';

const FALLBACK = 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400';
const slug = (s: string) => 'sec-' + s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function Frame({ src, alt, className = '' }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`phone-frame aspect-[9/19] ${className}`}>
      <div className="pt-4 w-full h-full overflow-hidden rounded-[2rem]">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="w-full h-full object-cover object-top"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
        />
      </div>
    </div>
  );
}

export function ScreenshotGallery({ media, entityName }: { media: Media[]; entityName: string }) {
  const items = useMemo(() => [...media].sort((a, b) => a.sort_order - b.sort_order), [media]);
  const sections = useMemo(() => {
    const map = new Map<string, Media[]>();
    for (const m of items) {
      const k = m.category || 'General';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(m);
    }
    return Array.from(map, ([name, list]) => ({ name, list }));
  }, [items]);

  const [hero, setHero] = useState(0);
  const [fsOpen, setFsOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    const open = fsOpen || lightbox !== null;
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [fsOpen, lightbox]);

  const move = useCallback((delta: number) => {
    setLightbox((i) => (i === null ? i : (i + delta + items.length) % items.length));
  }, [items.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox !== null) {
        if (e.key === 'Escape') setLightbox(null);
        else if (e.key === 'ArrowRight') move(1);
        else if (e.key === 'ArrowLeft') move(-1);
      } else if (fsOpen && e.key === 'Escape') setFsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, fsOpen, move]);

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] flex items-center justify-center mx-auto mb-3">
          <FlaskConical size={20} className="text-[#9CA3AF]" />
        </div>
        <p className="text-sm text-[#9CA3AF]">No screenshots available</p>
      </div>
    );
  }

  const current = items[hero];
  const arrowBtn = 'w-7 h-7 rounded-full border border-[#E5E7EB] bg-white/90 backdrop-blur flex items-center justify-center text-[#6B7280] hover:border-[#A3B18A] hover:text-[#3A5A40] transition-colors shadow-sm';

  return (
    <>
      {/* ---------- inline ---------- */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Screenshots ({items.length})</h2>
          <button onClick={() => setFsOpen(true)} className="text-xs font-medium text-[#3A5A40] hover:underline inline-flex items-center gap-1">
            <Maximize2 size={12} /> View all
          </button>
        </div>

        <div className="relative">
          <button onClick={() => setFsOpen(true)} className="block mx-auto w-[230px]" aria-label="Open full screenshot gallery">
            <Frame src={current.image_url} alt={`${entityName} screenshot`} className="w-[230px]" />
          </button>
          {items.length > 1 && (
            <>
              <button onClick={() => setHero((h) => (h - 1 + items.length) % items.length)} className={`${arrowBtn} absolute left-1 top-1/2 -translate-y-1/2`} aria-label="Previous">
                <ChevronLeft size={15} />
              </button>
              <button onClick={() => setHero((h) => (h + 1) % items.length)} className={`${arrowBtn} absolute right-1 top-1/2 -translate-y-1/2`} aria-label="Next">
                <ChevronRight size={15} />
              </button>
            </>
          )}
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-[#9CA3AF]">
          <span className="tag-pill bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]">{current.category}</span>
          <span>{hero + 1}/{items.length}</span>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {items.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setHero(i)}
              className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === hero ? 'border-[#3A5A40]' : 'border-transparent opacity-55 hover:opacity-100'}`}
              aria-label={`Screenshot ${i + 1}`}
            >
              <img src={m.image_url} alt="" loading="lazy" className="w-9 h-[76px] object-cover object-top" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }} />
            </button>
          ))}
        </div>
      </div>

      {/* ---------- fullscreen gallery ---------- */}
      {fsOpen && (
        <div className="fixed inset-0 z-[100] bg-[#F9FAFB] overflow-y-auto overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
          <div className="sticky top-0 z-10 bg-white/85 backdrop-blur border-b border-[#E5E7EB]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-baseline gap-2">
                <span className="font-semibold text-[#1F2937] truncate">{entityName}</span>
                <span className="text-[#9CA3AF] text-sm whitespace-nowrap">{items.length} screenshots</span>
              </div>
              <button onClick={() => setFsOpen(false)} className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] flex-shrink-0" aria-label="Close gallery">
                <X size={18} />
              </button>
            </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-2.5 flex flex-wrap gap-2">
              {sections.map((s) => (
                <a key={s.name} href={`#${slug(s.name)}`} className="text-xs px-3 py-1 rounded-full border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#A3B18A] hover:text-[#3A5A40] whitespace-nowrap transition-colors">
                  {s.name} <span className="text-[#B8BFC7]">{s.list.length}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-12">
            {sections.map((s) => (
              <section key={s.name} id={slug(s.name)} className="scroll-mt-32">
                <div className="flex items-baseline gap-2 mb-4">
                  <h3 className="text-lg font-bold text-[#1F2937]">{s.name}</h3>
                  <span className="text-sm text-[#9CA3AF]">{s.list.length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {s.list.map((m) => {
                    const gi = items.indexOf(m);
                    return (
                      <button key={m.id} onClick={() => setLightbox(gi)} className="group text-left focus:outline-none">
                        <div className="transition-transform group-hover:-translate-y-1">
                          <Frame src={m.image_url} alt={m.caption || `${entityName} screenshot`} className="w-full" />
                        </div>
                        {m.caption && <p className="mt-1.5 text-xs text-[#6B7280] line-clamp-2">{m.caption}</p>}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {/* ---------- lightbox (light, per design rules) ---------- */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-[110] bg-white/95 backdrop-blur-md flex flex-col" onClick={() => setLightbox(null)}>
          <div className="h-14 flex items-center justify-between px-4 sm:px-6 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm text-[#6B7280]">
              <span className="font-medium text-[#1F2937]">{items[lightbox].category}</span>
              <span className="mx-2 text-[#D1D5DB]">·</span>{lightbox + 1} / {items.length}
            </span>
            <button onClick={() => setLightbox(null)} className="w-9 h-9 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]" aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 min-h-0 flex items-center justify-center px-4 pb-8 gap-3 sm:gap-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => move(-1)} className="hidden sm:flex w-11 h-11 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-[#1F2937] items-center justify-center flex-shrink-0 shadow-sm" aria-label="Previous">
              <ChevronLeft size={20} />
            </button>
            <img
              src={items[lightbox].image_url}
              alt={items[lightbox].caption || `${entityName} screenshot`}
              className="max-h-full max-w-full object-contain rounded-[1.75rem] border border-[#E5E7EB] shadow-2xl"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
            />
            <button onClick={() => move(1)} className="hidden sm:flex w-11 h-11 rounded-full border border-[#E5E7EB] bg-white hover:bg-[#F3F4F6] text-[#1F2937] items-center justify-center flex-shrink-0 shadow-sm" aria-label="Next">
              <ChevronRight size={20} />
            </button>
          </div>
          {items[lightbox].caption && (
            <div className="pb-6 px-6 text-center" onClick={(e) => e.stopPropagation()}>
              <p className="text-sm text-[#6B7280] max-w-lg mx-auto">{items[lightbox].caption}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
