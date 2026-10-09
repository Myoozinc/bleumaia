'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Download, 
  Video, 
  Copy, 
  Check, 
  Dices, 
  Maximize2, 
  AlertCircle, 
  Layers, 
  Sliders, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { STYLE_PRESETS, ASPECT_RATIOS } from '@/lib/styles';
import { GLOBAL_PROVIDERS } from '@/lib/providers';
import { AspectRatio, GeneratedAsset, ProviderId } from '@/lib/types';
import { getStoredApiKey, saveToHistory } from '@/lib/storage';

interface ImageStudioProps {
  onSendToVideo: (imageUrl: string, prompt: string) => void;
  openVault: () => void;
}

export default function ImageStudio({ onSendToVideo, openVault }: ImageStudioProps) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showNegative, setShowNegative] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('photoreal_8k');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [provider, setProvider] = useState<ProviderId>('pollinations');
  const [model, setModel] = useState('flux');
  const [seed, setSeed] = useState<number>(() => Math.floor(Math.random() * 899999) + 100000);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentAsset, setCurrentAsset] = useState<GeneratedAsset | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Randomize Seed
  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 899999) + 100000);
  };

  // Enhance Prompt
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    setIsEnhancing(true);
    setErrorMsg(null);

    try {
      const geminiKey = getStoredApiKey('gemini');
      const siliconKey = getStoredApiKey('siliconflow');

      const res = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          geminiKey,
          siliconKey,
          tone: selectedStyle === 'anime_shinkai' ? 'anime' : selectedStyle === 'cyberpunk_neon' ? 'cyberpunk' : 'cinematic',
        }),
      });

      const data = await res.json();
      if (data.success && data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Handle Provider Change
  const handleProviderChange = (newProvider: ProviderId) => {
    setProvider(newProvider);
    const pConfig = GLOBAL_PROVIDERS.find(p => p.id === newProvider);
    if (pConfig?.models.image && pConfig.models.image.length > 0) {
      setModel(pConfig.models.image[0]);
    }
  };

  // Generate Image
  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) {
      setErrorMsg('Por favor escribe una descripción para tu imagen.');
      return;
    }

    // Check if key is required
    const pConfig = GLOBAL_PROVIDERS.find(p => p.id === provider);
    const apiKey = getStoredApiKey(provider);
    if (pConfig?.requiresKey && !apiKey.trim()) {
      setErrorMsg(`El proveedor ${pConfig.name} requiere una API Key configurada.`);
      openVault();
      return;
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          negativePrompt,
          styleId: selectedStyle,
          aspectRatio,
          seed,
          provider,
          model,
          apiKey,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo generar la imagen.');
      }

      const newAsset: GeneratedAsset = {
        id: `img_${Date.now()}`,
        type: 'image',
        url: data.url,
        prompt: prompt.trim(),
        negativePrompt: negativePrompt.trim() || undefined,
        styleId: selectedStyle,
        provider,
        model: data.model || model,
        aspectRatio,
        seed: data.seed || seed,
        createdAt: Date.now(),
      };

      setCurrentAsset(newAsset);
      saveToHistory(newAsset);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado al conectar con el motor de IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const currentProviderConfig = GLOBAL_PROVIDERS.find(p => p.id === provider);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Controls & Creation Panel (Left / 7 cols) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Prompt Input Card */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Describe tu Visión Creativa</span>
            </label>

            <button
              type="button"
              onClick={handleEnhancePrompt}
              disabled={isEnhancing || !prompt.trim()}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-600/30 to-indigo-600/30 hover:from-cyan-600/50 hover:to-indigo-600/50 text-cyan-300 border border-cyan-500/30 text-xs font-semibold disabled:opacity-50 transition-all shadow-sm"
              title="Convierte tu idea en un prompt cinematográfico profesional en inglés"
            >
              <Wand2 className={`w-3.5 h-3.5 ${isEnhancing ? 'animate-spin' : ''}`} />
              <span>{isEnhancing ? 'Mejorando...' : 'Mejorar Prompt 🪄'}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ej: Un samurái cyberpunk en una azotea de Neo Tokio bajo la lluvia de neón, reflejos dorados y humo volumétrico..."
              className="w-full glass-input rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
            />
          </div>

          {/* Negative Prompt Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowNegative(!showNegative)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
            >
              {showNegative ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              <span>{showNegative ? 'Ocultar Prompt Negativo' : '+ Añadir Prompt Negativo (cosas a evitar)'}</span>
            </button>

            {showNegative && (
              <div className="mt-2 animate-fadeIn">
                <input
                  type="text"
                  value={negativePrompt}
                  onChange={e => setNegativePrompt(e.target.value)}
                  placeholder="Ej: borroso, deforme, texto, baja calidad, artefactos"
                  className="w-full glass-input text-xs rounded-lg px-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Style Presets Carousel / Grid */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Estilo Visual</span>
            </h3>
            <span className="text-xs text-slate-400">
              {STYLE_PRESETS.find(s => s.id === selectedStyle)?.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {STYLE_PRESETS.map(style => {
              const isSelected = selectedStyle === style.id;
              return (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  className={`group relative overflow-hidden rounded-xl p-2.5 text-left transition-all border ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-400/50'
                      : 'bg-slate-900/60 border-white/5 hover:border-white/20 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {style.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-cyan-300 font-medium">
                      {style.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {style.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Aspect Ratio Selector */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Formato / Relación de Aspecto</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {ASPECT_RATIOS.map(ratio => {
              const isSelected = aspectRatio === ratio.id;
              return (
                <button
                  key={ratio.id}
                  type="button"
                  onClick={() => setAspectRatio(ratio.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md shadow-cyan-950/40'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-lg mb-1">{ratio.icon}</span>
                  <span className="text-xs font-bold">{ratio.label}</span>
                  <span className="text-[10px] text-slate-400 mt-0.5 truncate w-full">
                    {ratio.width}x{ratio.height}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Provider & Seed Controls */}
        <div className="glass-panel p-5 sm:p-6 rounded-2xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Provider Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Proveedor de IA
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
                {GLOBAL_PROVIDERS.filter(p => p.supportedTypes.includes('image')).map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                    {p.flag} {p.name} {!p.requiresKey ? '(Inmediato)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Model Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Modelo Específico
              </label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full glass-input text-xs rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none"
              >
                {(currentProviderConfig?.models.image || ['flux']).map(m => (
                  <option key={m} value={m} className="bg-slate-900 text-slate-100">
                    {m}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Seed Control */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Semilla (Seed):</span>
              <input
                type="number"
                value={seed}
                onChange={e => setSeed(Number(e.target.value))}
                className="w-28 glass-input text-xs rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleRandomSeed}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Aleatoria</span>
            </button>
          </div>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-start gap-2.5 text-xs text-rose-200 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Primary Generate Button */}
        <button
          type="button"
          onClick={() => handleGenerate()}
          disabled={isGenerating}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-cyan-600/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 ring-1 ring-cyan-400/50"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generando Obra de Arte con IA...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>GENERAR IMAGEN CON BLEUMAIA</span>
            </>
          )}
        </button>

      </div>

      {/* Result Display Panel (Right / 5 cols) */}
      <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
        <div className="glass-panel p-5 rounded-2xl space-y-4 min-h-[460px] flex flex-col justify-between">
          
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Lienzo de Resultado</span>
            </h3>

            {currentAsset && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                {currentAsset.provider.toUpperCase()} • {currentAsset.aspectRatio}
              </span>
            )}
          </div>

          {/* Visual Container */}
          <div className="relative flex-1 flex items-center justify-center rounded-xl bg-slate-950/80 border border-white/5 overflow-hidden group min-h-[320px]">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 animate-pulse flex items-center justify-center shadow-lg shadow-cyan-500/30">
                    <Sparkles className="w-8 h-8 text-white animate-spin" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Sintetizando Pixeles...</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Conectando con {currentProviderConfig?.name || 'motor de difusión'}
                  </p>
                </div>
              </div>
            ) : currentAsset ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={currentAsset.url}
                  alt={currentAsset.prompt}
                  className="max-h-[450px] w-auto max-w-full rounded-lg object-contain shadow-2xl transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-3">
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 text-slate-600">
                  <Sparkles className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-300">Sin imagen generada aún</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Escribe tu descripción a la izquierda y presiona Generar.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action toolbar if image exists */}
          {currentAsset && !isGenerating && (
            <div className="space-y-3 pt-3 border-t border-white/5 animate-fadeIn">
              
              {/* Direct Actions */}
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={currentAsset.url}
                  download={`bleumaia_${currentAsset.seed}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-all border border-white/10"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar HD</span>
                </a>

                <button
                  type="button"
                  onClick={() => onSendToVideo(currentAsset.url, currentAsset.prompt)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-md shadow-cyan-600/30"
                  title="Enviar esta imagen al estudio de video para animarla"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Animar en Video 🎬</span>
                </button>
              </div>

              {/* Copy prompt / seed bar */}
              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-white/5">
                <div className="truncate max-w-[240px] text-[11px]">
                  <span className="text-slate-500 font-mono">Seed: {currentAsset.seed}</span> • {currentAsset.prompt}
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(currentAsset.prompt)}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 shrink-0 font-medium ml-2 text-[11px]"
                >
                  {copiedPrompt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPrompt ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
