'use client';

import React from 'react';
import { 
  Sparkles, 
  KeyRound, 
  Image as ImageIcon, 
  Video, 
  FolderHeart, 
  Github, 
  Crown, 
  User as UserIcon, 
  LogOut, 
  Zap 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  activeTab: 'image' | 'video' | 'gallery';
  setActiveTab: (tab: 'image' | 'video' | 'gallery') => void;
  openVault: () => void;
  openPricing: () => void;
  openAuth: () => void;
  configuredKeysCount: number;
}

export default function Header({
  activeTab,
  setActiveTab,
  openVault,
  openPricing,
  openAuth,
}: HeaderProps) {
  const { user, profile, logout } = useAuth();

  const isPro = profile?.plan === 'sub_creator' || profile?.plan === 'sub_studio';

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/10 px-4 lg:px-8 py-3 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Sparkles className="w-5 h-5 text-cyan-100 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-200 to-indigo-300">
                BLEUMAIA
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 uppercase tracking-widest">
                AI Studio
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Generación Creativa Global • Autenticación & Pagos
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/5 shadow-inner">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'image'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Imágenes</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'video'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Videos</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'gallery'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <FolderHeart className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Galería</span>
          </button>
        </nav>

        {/* Action Controls & User Account Pill */}
        <div className="flex items-center gap-2.5">
          
          {/* Credits Balance / Buy Button */}
          <button
            onClick={openPricing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950/90 to-indigo-950/90 hover:from-cyan-900/90 hover:to-indigo-900/90 border border-cyan-500/30 text-xs shadow-sm transition-all"
            title="Recargar créditos o suscribirse con PayPal"
          >
            {isPro ? (
              <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="font-bold text-white">
              {isPro ? 'PRO ILIMITADO' : `${profile?.credits || 0} Créditos`}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-semibold hidden md:inline">
              + Recargar
            </span>
          </button>

          {/* AI Engines Vault Button */}
          <button
            onClick={openVault}
            className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-all text-xs"
            title="Configuración de motores de IA"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium hidden lg:inline">Motores</span>
          </button>

          {/* User Auth Controls */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-white/10">
              <div 
                className="flex items-center gap-2 cursor-pointer group"
                onClick={openPricing}
                title={`Conectado como ${profile?.email || 'Usuario'}`}
              >
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt="Avatar"
                    className="w-7 h-7 rounded-full border border-cyan-400/40 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-cyan-900/80 text-cyan-200 border border-cyan-500/30 flex items-center justify-center text-xs font-bold uppercase">
                    {(profile?.displayName || profile?.email || 'U')[0]}
                  </div>
                )}
                <span className="text-xs font-semibold text-slate-200 hidden xl:inline max-w-[100px] truncate">
                  {profile?.displayName || profile?.email?.split('@')[0]}
                </span>
              </div>

              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
                title="Cerrar Sesión"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/30 transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Acceder</span>
            </button>
          )}

          {/* GitHub link */}
          <a
            href="https://github.com/Myoozinc/bleumaia"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 transition-all hidden sm:block"
            title="Ver repositorio en GitHub"
          >
            <Github className="w-4 h-4" />
          </a>

        </div>

      </div>
    </header>
  );
}
