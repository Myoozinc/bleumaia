'use client';

import React, { useState } from 'react';
import { 
  FolderHeart, 
  Download, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  Copy, 
  Check, 
  X, 
  Sparkles, 
  Eye 
} from 'lucide-react';
import { GeneratedAsset } from '@/lib/types';
import { clearHistory, deleteHistoryItem } from '@/lib/storage';

interface GalleryViewProps {
  history: GeneratedAsset[];
  onHistoryUpdated: () => void;
  onSendToVideo: (imageUrl: string, prompt: string) => void;
}

export default function GalleryView({
  history,
  onHistoryUpdated,
  onSendToVideo,
}: GalleryViewProps) {
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [activeModalAsset, setActiveModalAsset] = useState<GeneratedAsset | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = history.filter(item => {
    if (filter === 'image') return item.type === 'image';
    if (filter === 'video') return item.type === 'video';
    return true;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteHistoryItem(id);
    onHistoryUpdated();
    if (activeModalAsset?.id === id) {
      setActiveModalAsset(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('¿Seguro que deseas vaciar todo el historial local?')) {
      clearHistory();
      onHistoryUpdated();
      setActiveModalAsset(null);
    }
  };

  const copyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            <FolderHeart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              Galería de Creaciones ({history.length})
            </h2>
            <p className="text-xs text-slate-400">
              Tus contenidos generados almacenados localmente en este dispositivo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filters */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-white/5 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('image')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === 'image'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Imágenes
            </button>
            <button
              onClick={() => setFilter('video')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                filter === 'video'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Videos
            </button>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl border border-rose-900/30 transition-all text-xs flex items-center gap-1.5"
              title="Borrar historial"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Vaciar</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of assets */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-16 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-900 flex items-center justify-center text-slate-600 border border-white/5">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-300">
            No hay creaciones en esta categoría
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Genera imágenes o videos en los estudios para que aparezcan aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveModalAsset(item)}
              className="group relative rounded-2xl glass-card overflow-hidden cursor-pointer border border-white/5 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/30 flex flex-col"
            >
              {/* Media preview */}
              <div className="relative aspect-square bg-slate-950 overflow-hidden flex items-center justify-center">
                {item.type === 'video' ? (
                  <video
                    src={item.url}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    muted
                    loop
                  />
                ) : (
                  <img
                    src={item.url}
                    alt={item.prompt}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                {/* Badge top-left */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-cyan-300 border border-cyan-800/40">
                  {item.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                  <span>{item.provider.toUpperCase()}</span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <span className="p-2 rounded-xl bg-cyan-600 text-white shadow-lg">
                    <Eye className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Caption & Actions */}
              <div className="p-3 bg-slate-900/80 flex-1 flex flex-col justify-between border-t border-white/5">
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-[10px] text-slate-400">
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        copyPrompt(item.prompt, item.id);
                      }}
                      className="p-1 hover:text-cyan-300"
                      title="Copiar prompt"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={e => handleDelete(item.id, e)}
                      className="p-1 hover:text-rose-400"
                      title="Eliminar de galería"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Full detail modal */}
      {activeModalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl glass-panel border border-cyan-500/20 shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold uppercase">
                  {activeModalAsset.type} • {activeModalAsset.provider}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(activeModalAsset.createdAt).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => setActiveModalAsset(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media viewer */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-slate-950/70">
              {activeModalAsset.type === 'video' ? (
                <video
                  src={activeModalAsset.url}
                  controls
                  autoPlay
                  loop
                  className="max-h-[60vh] max-w-full rounded-xl shadow-2xl"
                />
              ) : (
                <img
                  src={activeModalAsset.url}
                  alt={activeModalAsset.prompt}
                  className="max-h-[60vh] max-w-full rounded-xl object-contain shadow-2xl"
                />
              )}

              {/* Prompt description */}
              <div className="w-full mt-4 p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">Prompt:</span>
                  <button
                    onClick={() => copyPrompt(activeModalAsset.prompt, 'modal')}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    {copiedId === 'modal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === 'modal' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-mono">
                  {activeModalAsset.prompt}
                </p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between gap-3">
              <a
                href={activeModalAsset.url}
                download={`bleumaia_${activeModalAsset.id}.${activeModalAsset.type === 'video' ? 'mp4' : 'png'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-white/10 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Archivo</span>
              </a>

              {activeModalAsset.type === 'image' && (
                <button
                  onClick={() => {
                    onSendToVideo(activeModalAsset.url, activeModalAsset.prompt);
                    setActiveModalAsset(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all"
                >
                  <Video className="w-4 h-4" />
                  <span>Animar en Estudio de Video</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
