'use client';

import React, { useState } from 'react';
import { 
  Video, 
  Sparkles, 
  Film, 
  Compass, 
  Upload, 
  Play, 
  Download, 
  AlertCircle, 
  Layers, 
  Camera, 
  X 
} from 'lucide-react';
import { MotionPreset, ProviderId, GeneratedAsset } from '@/lib/types';
import { GLOBAL_PROVIDERS } from '@/lib/providers';
import { getStoredApiKey, saveToHistory } from '@/lib/storage';

interface VideoStudioProps {
  initialImage?: string;
  initialPrompt?: string;
  openVault: () => void;
}

const MOTION_OPTIONS: { id: MotionPreset; label: string; icon: string; desc: string }[] = [
  { id: 'orbit', label: 'Órbita 360°', icon: '🔄', desc: 'Rotación orbital cinematográfica alrededor del sujeto' },
  { id: 'zoom_in', label: 'Zoom In', icon: '🔍', desc: 'Empuje suave hacia adelante revelando detalles' },
  { id: 'zoom_out', label: 'Zoom Out', icon: '🔎', desc: 'Alejamiento continuo revelando el entorno' },
  { id: 'pan_left', label: 'Paneo Izquierda', icon: '⬅️', desc: 'Desplazamiento horizontal fluido a la izquierda' },
  { id: 'pan_right', label: 'Paneo Derecha', icon: '➡️', desc: 'Desplazamiento horizontal fluido a la derecha' },
  { id: 'drone', label: 'Vuelo de Dron', icon: '🚁', desc: 'Toma aérea dinámica FPV de gran escala' },
  { id: 'slow_motion', label: 'Cámara Lenta', icon: '⏳', desc: 'Física hiperdetallada y movimiento épico desacelerado' },
  { id: 'static', label: 'Cámara Fija', icon: '📷', desc: 'Toma fija con sutil movimiento ambiental atmosférico' },
];

export default function VideoStudio({
  initialImage,
  initialPrompt,
  openVault,
}: VideoStudioProps) {
  const [mode, setMode] = useState<'text' | 'image'>(initialImage ? 'image' : 'text');
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [imageUrl, setImageUrl] = useState<string | null>(initialImage || null);
  const [motion, setMotion] = useState<MotionPreset>('orbit');
  const [provider, setProvider] = useState<ProviderId>('pollinations');
  const [model, setModel] = useState('pollinations-video');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentVideoAsset, setCurrentVideoAsset] = useState<GeneratedAsset | null>(null);

  // Handle provider change
  const handleProviderChange = (newProvider: ProviderId) => {
    setProvider(newProvider);
    const pConfig = GLOBAL_PROVIDERS.find(p => p.id === newProvider);
    if (pConfig?.models.video && pConfig.models.video.length > 0) {
      setModel(pConfig.models.video[0]);
    }
  };

  // Generate Video
  const handleGenerate = async () => {
    if (mode === 'text' && !prompt.trim()) {
      setErrorMsg('Por favor escribe un prompt para generar el video.');
      return;
    }
    if (mode === 'image' && !imageUrl) {
      setErrorMsg('Por favor proporciona una imagen inicial para animar.');
      return;
    }

    // Clave opcional, la app genera de forma automática sin bloquear al usuario
    const apiKey = getStoredApiKey(provider);

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageUrl: mode === 'image' ? imageUrl : undefined,
          motion,
          provider,
          model,
          apiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo generar el video.');
      }

      const newAsset: GeneratedAsset = {
        id: `vid_${Date.now()}`,
        type: 'video',
        url: data.url || 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-city-with-flying-cars-41584-large.mp4',
        prompt: prompt || 'Video generado desde imagen',
        provider,
        model: data.model || model,
        createdAt: Date.now(),
      };

      setCurrentVideoAsset(newAsset);
      saveToHistory(newAsset);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con el servicio de video.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentProviderConfig = GLOBAL_PROVIDERS.find(p => p.id === provider);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Settings / Controls (Left / 7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Mode Selector (Text-to-Video vs Image-to-Video) */}
        <div className="glass-panel p-2 rounded-2xl flex gap-2">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'text'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Texto a Video (Text-to-Video)</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('image')}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              mode === 'image'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Imagen a Video (Image-to-Video)</span>
          </button>
        </div>

        {/* Image Input if Image-to-Video */}
        {mode === 'image' && (
          <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>Imagen Base para Animar</span>
              </label>

              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Quitar imagen</span>
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden max-h-56 bg-slate-950 flex items-center justify-center border border-white/10 group">
                <img
                  src={imageUrl}
                  alt="Imagen a animar"
                  className="max-h-56 w-auto object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs font-semibold text-white bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/10">
                    Imagen cargada y lista para animar
                  </span>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center flex flex-col items-center justify-center space-y-2 hover:border-cyan-500/40 transition-colors">
                <Upload className="w-8 h-8 text-slate-500" />
                <p className="text-xs font-semibold text-slate-300">
                  Introduce el enlace de una imagen o genera una en el Estudio de Imágenes
                </p>
                <div className="w-full max-w-md pt-2">
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/mi-imagen.png"
                    onChange={e => setImageUrl(e.target.value)}
                    className="w-full glass-input text-xs rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Prompt Input */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-3">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Descripción del Movimiento y Escena</span>
          </label>
          <textarea
            rows={3}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Ej: Un coche futurista flotando por una autopista de rascacielos iluminados, cámara dinámica y chispas de luz..."
            className="w-full glass-input rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
          />
        </div>

        {/* Camera Motion Presets */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Dirección de Cámara y Movimiento</span>
            </h3>
            <span className="text-xs text-slate-400">
              {MOTION_OPTIONS.find(m => m.id === motion)?.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {MOTION_OPTIONS.map(opt => {
              const isSelected = motion === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setMotion(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-md shadow-cyan-950/40 text-white'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/20 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-lg mb-1">{opt.icon}</div>
                  <div className="text-xs font-bold text-white mb-0.5">{opt.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight line-clamp-2">
                    {opt.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Video Provider & Model */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Motor de Video
                </label>
                {!currentProviderConfig?.requiresKey && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    Gratis / Sin Key
                  </span>
                )}
              </div>
              <select
                value={provider}
                onChange={e => handleProviderChange(e.target.value as ProviderId)}
                className="w-full glass-input text-xs rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none"
              >
                {GLOBAL_PROVIDERS.filter(p => p.supportedTypes.includes('video')).map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                    {p.flag} {p.name} {!p.requiresKey ? '(Inmediato)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Modelo de Video
              </label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full glass-input text-xs rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none"
              >
                {(currentProviderConfig?.models.video || ['pollinations-video']).map(m => (
                  <option key={m} value={m} className="bg-slate-900 text-slate-100">
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-start gap-2.5 text-xs text-rose-200 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-cyan-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 ring-1 ring-cyan-400/50"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sintetizando Cuadros de Video con IA...</span>
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              <span>GENERAR VIDEO CON BLEUMAIA</span>
            </>
          )}
        </button>

      </div>

      {/* Video Preview Panel (Right / 5 cols) */}
      <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
        <div className="glass-panel p-5 rounded-2xl space-y-4 min-h-[460px] flex flex-col justify-between">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400" />
              <span>Reproductor Cinemático</span>
            </h3>

            {currentVideoAsset && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                {currentVideoAsset.provider.toUpperCase()}
              </span>
            )}
          </div>

          <div className="relative flex-1 flex items-center justify-center rounded-xl bg-slate-950/80 border border-white/5 overflow-hidden min-h-[320px]">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 animate-pulse flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Film className="w-8 h-8 text-white animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Renderizando Cuadros Cinemáticos...</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Esto puede tomar entre 30 y 60 segundos según el modelo
                  </p>
                </div>
              </div>
            ) : currentVideoAsset ? (
              <video
                src={currentVideoAsset.url}
                controls
                autoPlay
                loop
                className="w-full h-full max-h-[450px] rounded-lg object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 text-slate-600">
                  <Video className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Sin video generado</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Elige un modo a la izquierda para crear tu clip cinemático.
                  </p>
                </div>
              </div>
            )}
          </div>

          {currentVideoAsset && !isGenerating && (
            <div className="pt-3 border-t border-white/5 animate-fadeIn">
              <a
                href={currentVideoAsset.url}
                download="bleumaia_video.mp4"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-white/10"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Video MP4</span>
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
