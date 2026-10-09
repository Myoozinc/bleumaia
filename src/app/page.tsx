'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ImageStudio from '@/components/ImageStudio';
import VideoStudio from '@/components/VideoStudio';
import GalleryView from '@/components/GalleryView';
import ApiKeyVaultModal from '@/components/ApiKeyVaultModal';
import { GeneratedAsset } from '@/lib/types';
import { getAllStoredApiKeys, getHistory } from '@/lib/storage';
import { Sparkles, Globe2, ShieldCheck, Zap } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'gallery'>('image');
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [configuredKeysCount, setConfiguredKeysCount] = useState(0);
  const [history, setHistory] = useState<GeneratedAsset[]>([]);
  
  // State for image-to-video bridging
  const [videoBridgeImage, setVideoBridgeImage] = useState<string | undefined>(undefined);
  const [videoBridgePrompt, setVideoBridgePrompt] = useState<string | undefined>(undefined);

  // Sync keys and history on load
  const syncState = () => {
    const keys = getAllStoredApiKeys();
    const count = Object.values(keys).filter(k => Boolean(k && k.trim())).length;
    setConfiguredKeysCount(count);
    setHistory(getHistory());
  };

  useEffect(() => {
    syncState();
  }, []);

  const handleSendToVideo = (imageUrl: string, prompt: string) => {
    setVideoBridgeImage(imageUrl);
    setVideoBridgePrompt(prompt);
    setActiveTab('video');
  };

  return (
    <div className="min-h-screen flex flex-col bg-radial-gradient text-slate-100">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openVault={() => setIsVaultOpen(true)}
        configuredKeysCount={configuredKeysCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Banner / Subtitle */}
        <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/10 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 text-xs font-semibold">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Plataforma Universal de Modelos de IA Gratuitos</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Crea Imágenes y Videos con los{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                Mejores Modelos Globales
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Sin restricciones. Genera al instante con <strong>Pollinations.ai</strong> o conecta tus claves de <strong>SiliconFlow (Alibaba Wan 2.1 Video & FLUX.1)</strong>, <strong>Hugging Face</strong>, <strong>Cloudflare Workers AI</strong> y <strong>Google Gemini</strong>.
            </p>
          </div>

          {/* Decorative Glowing Orbs */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 -mb-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-3 p-3.5 rounded-2xl glass-card border border-white/5">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">Generación Instantánea</p>
              <p className="text-slate-400 text-[11px]">FLUX.1 y SDXL sin registros obligatorios</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl glass-card border border-white/5">
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">Poder de Asia & Occidente</p>
              <p className="text-slate-400 text-[11px]">Wan 2.1, CogVideoX, DeepSeek y FLUX</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-2xl glass-card border border-white/5">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">Privacidad 100% Local</p>
              <p className="text-slate-400 text-[11px]">Tus claves nunca salen de tu navegador</p>
            </div>
          </div>
        </div>

        {/* Tab View Content */}
        {activeTab === 'image' && (
          <ImageStudio
            onSendToVideo={handleSendToVideo}
            openVault={() => setIsVaultOpen(true)}
          />
        )}

        {activeTab === 'video' && (
          <VideoStudio
            initialImage={videoBridgeImage}
            initialPrompt={videoBridgePrompt}
            openVault={() => setIsVaultOpen(true)}
          />
        )}

        {activeTab === 'gallery' && (
          <GalleryView
            history={history}
            onHistoryUpdated={syncState}
            onSendToVideo={handleSendToVideo}
          />
        )}

      </main>

      {/* Global API Key Vault Modal */}
      <ApiKeyVaultModal
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        onKeysUpdated={syncState}
      />

      {/* Footer */}
      <footer className="glass-panel border-t border-white/5 mt-16 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Bleumaia • Estudio de Creación Multimedia con IA</p>
          <p className="text-slate-400">
            Desarrollado para creadores globales • Listo para Vercel
          </p>
        </div>
      </footer>
    </div>
  );
}
