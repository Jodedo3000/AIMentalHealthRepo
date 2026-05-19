'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader as Loader2, Link } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ImageUploadProps {
  onUploaded: (url: string) => void;
  accept?: string;
}

export function ImageUpload({ onUploaded, accept = 'image/jpeg,image/png,image/webp,image/gif' }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [urlMode, setUrlMode] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = useCallback(async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from('screenshots').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from('screenshots').getPublicUrl(path);
      onUploaded(data.publicUrl);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, [onUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      upload(file);
    } else {
      setError('Please drop an image file');
    }
  }, [upload]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    e.target.value = '';
  };

  const handleManualUrl = () => {
    if (manualUrl.trim()) {
      onUploaded(manualUrl.trim());
      setManualUrl('');
      setUrlMode(false);
    }
  };

  if (urlMode) {
    return (
      <div className="flex gap-2">
        <input
          type="url"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleManualUrl(); } }}
          className="flex-1 px-3 py-2 text-sm border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#A3B18A] focus:ring-2 focus:ring-[#A3B18A]/20 text-[#1F2937] placeholder:text-[#9CA3AF]"
          placeholder="https://..."
          autoFocus
        />
        <button
          type="button"
          onClick={handleManualUrl}
          className="px-3 py-2 bg-[#3A5A40] text-white text-sm rounded-lg hover:bg-[#2d4731] transition-colors"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => { setUrlMode(false); setManualUrl(''); }}
          className="px-2 py-2 text-[#9CA3AF] hover:text-[#1F2937] transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-5 px-4 transition-all cursor-pointer ${
          isDragging
            ? 'border-[#3A5A40] bg-[#3A5A40]/5'
            : 'border-[#D1D5DB] bg-[#F9FAFB] hover:border-[#A3B18A] hover:bg-[#F3F4F6]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
        />
        {uploading ? (
          <>
            <Loader2 size={20} className="text-[#3A5A40] animate-spin" />
            <p className="text-xs text-[#6B7280]">Uploading...</p>
          </>
        ) : (
          <>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${isDragging ? 'bg-[#3A5A40]/10' : 'bg-[#E5E7EB]'}`}>
              <Upload size={16} className={isDragging ? 'text-[#3A5A40]' : 'text-[#9CA3AF]'} />
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-[#4B5563]">
                {isDragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-[10px] text-[#9CA3AF] mt-0.5">JPEG, PNG, WebP, GIF - max 10MB</p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-[11px] text-red-500">{error}</p>
      )}

      <button
        type="button"
        onClick={() => setUrlMode(true)}
        className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF] hover:text-[#3A5A40] transition-colors"
      >
        <Link size={11} />
        Or add image via URL instead
      </button>
    </div>
  );
}
