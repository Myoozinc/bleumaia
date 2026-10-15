'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ImageStudio from '@/components/ImageStudio';
import VideoStudio from '@/components/VideoStudio';
import GalleryView from '@/components/GalleryView';
import ApiKeyVaultModal from '@/components/ApiKeyVaultModal';
import AuthModal from '@/components/AuthModal';
import PricingModal from '@/components/PricingModal';
import { GeneratedAsset } from '@/lib/types';
import { getAllStoredApiKeys, getHistory } from '@/lib/storage';
import { Sparkles, Globe2, ShieldCheck, Zap, Crown, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'gallery'>('image');
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [configuredKeysCount, setConfiguredKeysCount] = useState(0);
  const [history, setHistory] = useState<GeneratedAsset[]>([]);
  
  const { user, profile } = useAuth();

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
        openPricing={() => setIsPricingOpen(true)}
        openAuth={() => setIsAuthOpen(true)}
        configuredKeysCount={configuredKeysCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Banner / Subtitle */}
        <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-cyan-500/10 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 text-xs font-semibold">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Plataforma Multimedia con IA • Cuentas & Pagos PayPal</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Crea Imágenes y Videos con los{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
                Mejores Modelos Globales
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Genera con <strong>🍌 Nano Banana</strong>, <strong>Pollinations.ai</strong> o conecta <strong>SiliconFlow (Wan 2.1 Video)</strong>. Inicia sesión con Google o correo y obtén <strong>50 créditos de regalo</strong>.
            </p>

            {/* Quick Action Pills for Auth & Pricing */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {!user && (
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Crear Cuenta Gratis (+50 Créditos)</span>
                </button>
              )}

              <button
                onClick={() => setIsPricingOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 font-bold text-xs transition-all shadow-sm"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Ver Planes PRO & Paquetes PayPal</span>
              </button>
            </div>
          </div>

          {/* Decorative Glowing Orbs */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 -mb-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div 
            onClick={() => setIsPricingOpen(true)}
            className="flex items-center gap-3 p-3.5 rounded-2xl glass-card border border-white/5 cursor-pointer hover:border-cyan-400/30 transition-all"
          >
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/60">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                <span>Tu Saldo: {profile?.credits ?? 50} Créditos</span>
                <span className="text-[10px] text-cyan-400 underline">Recargar</span>
              </p>
              <p className="text-slate-400 text-[11px]">Paquetes desde $4.99 con PayPal</p>
            </div>
          </div>

          <div 
            onClick={() => setIsPricingOpen(true)}
            className="flex items-center gap-3 p-3.5 rounded-2xl glass-card border border-white/5 cursor-pointer hover:border-indigo-400/30 transition-all"
          >
            <div className="p-2 rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800/60">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-white">Suscripción Creador PRO</p>
              <p className="text-slate-400 text-[11px]">$9.99/mes con generaciones ilimitadas</p>
            </div>
          </div>

          <div 
            onClick={() => { if (!user) setIsAuthOpen(true); }}
            className="flex items-center gap-3 p-3.5 rounded-2xl glass-card border border-white/5 cursor-pointer hover:border-emerald-400/30 transition-all"
          >
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">
                {user ? (profile?.displayName || 'Cuenta Conectada') : 'Registro Seguro Firebase'}
              </p>
              <p className="text-slate-400 text-[11px]">Google, Correo y Pagos Protegidos</p>
            </div>
          </div>
        </div>

        {/* Tab View Content */}
        {activeTab === 'image' && (
          <ImageStudio
            onSendToVideo={handleSendToVideo}
            openVault={() => setIsVaultOpen(true)}
            openPricing={() => setIsPricingOpen(true)}
          />
        )}

        {activeTab === 'video' && (
          <VideoStudio
            initialImage={videoBridgeImage}
            initialPrompt={videoBridgePrompt}
            openVault={() => setIsVaultOpen(true)}
            openPricing={() => setIsPricingOpen(true)}
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

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* PayPal Pricing & Checkout Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Footer */}
      <footer className="glass-panel border-t border-white/5 mt-16 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Bleumaia • Estudio de Creación Multimedia con IA</p>
          <p className="text-slate-400">
            Autenticación Firebase & Pagos PayPal • Listo para Vercel
          </p>
        </div>
      </footer>
    </div>
  );
}
