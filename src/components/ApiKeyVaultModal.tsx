'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Check, 
  Key, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { GLOBAL_PROVIDERS } from '@/lib/providers';
import { ProviderId } from '@/lib/types';
import { getAllStoredApiKeys, saveStoredApiKey } from '@/lib/storage';

interface ApiKeyVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeysUpdated: () => void;
}

export default function ApiKeyVaultModal({
  isOpen,
  onClose,
  onKeysUpdated,
}: ApiKeyVaultModalProps) {
  const [keys, setKeys] = useState<Record<ProviderId, string>>({} as any);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setKeys(getAllStoredApiKeys());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyChange = (provider: ProviderId, val: string) => {
    setKeys(prev => ({ ...prev, [provider]: val }));
  };

  const handleSave = (provider: ProviderId) => {
    saveStoredApiKey(provider, keys[provider] || '');
    onKeysUpdated();
    setSavedSuccess(provider);
    setTimeout(() => setSavedSuccess(null), 2500);
  };

  const toggleShow = (provider: string) => {
    setShowKey(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl glass-panel border border-cyan-500/20 shadow-2xl shadow-cyan-950/50 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Bóveda Global de API Keys
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  Privacidad 100% Local
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Tus claves se guardan únicamente en el navegador de tu dispositivo. No pasan por servidores intermediarios.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-start gap-3 text-xs text-cyan-200">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-cyan-100 mb-0.5">
                Acceso Instantáneo sin configuración
              </p>
              <p className="text-slate-300">
                Bleumaia incluye <strong>Pollinations.ai</strong> activo por defecto para que generes imágenes (FLUX, Anime, Realismo) y videos sin necesidad de crear cuentas ni colocar tarjetas. Si deseas desbloquear modelos avanzados (Alibaba Wan 2.1, CogVideoX, SD 3.5), añade tus claves abajo.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {GLOBAL_PROVIDERS.map(provider => {
              const currentVal = keys[provider.id] || '';
              const isConfigured = Boolean(currentVal.trim());

              return (
                <div
                  key={provider.id}
                  className={`p-4 rounded-xl border transition-all ${
                    !provider.requiresKey
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : isConfigured
                      ? 'bg-slate-900/80 border-cyan-500/30'
                      : 'bg-slate-950/40 border-white/5'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{provider.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">
                            {provider.name}
                          </h3>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {provider.region}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {provider.freeTierDescription}
                        </p>
                      </div>
                    </div>

                    <a
                      href={provider.signupUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 transition-colors self-start sm:self-center font-medium"
                    >
                      <span>Obtener Key Gratis</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {provider.requiresKey ? (
                    <div className="flex items-center gap-2 mt-3">
                      <div className="relative flex-1">
                        <input
                          type={showKey[provider.id] ? 'text' : 'password'}
                          placeholder={
                            provider.id === 'cloudflare'
                              ? 'Formato: ID_CUENTA:API_TOKEN'
                              : provider.id === 'huggingface'
                              ? 'hf_...'
                              : 'sk-... o clave del proveedor'
                          }
                          value={currentVal}
                          onChange={e => handleKeyChange(provider.id, e.target.value)}
                          className="w-full glass-input text-xs rounded-lg px-3 py-2 pr-9 text-slate-100 placeholder-slate-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShow(provider.id)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                        >
                          {showKey[provider.id] ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <button
                        onClick={() => handleSave(provider.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          savedSuccess === provider.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/30'
                        }`}
                      >
                        {savedSuccess === provider.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Guardado</span>
                          </>
                        ) : (
                          <span>Guardar</span>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-emerald-500/20 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Habilitado automáticamente sin necesidad de clave o tarjeta.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tus datos y credenciales nunca salen de tu dispositivo local.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
