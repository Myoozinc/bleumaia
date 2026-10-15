'use client';

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Zap, 
  Crown, 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import confetti from 'canvas-confetti';
import { CREDIT_PACKAGES, SUBSCRIPTION_PLANS, PAYPAL_CLIENT_ID } from '@/lib/plans';
import { useAuth } from '@/context/AuthContext';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth?: () => void;
}

export default function PricingModal({ isOpen, onClose, onOpenAuth }: PricingModalProps) {
  const [activeTab, setActiveTab] = useState<'packs' | 'subscriptions'>('packs');
  const [selectedPack, setSelectedPack] = useState(CREDIT_PACKAGES[1]); // Default 500 credits
  const [selectedPlan, setSelectedPlan] = useState(SUBSCRIPTION_PLANS[0]); // Default Creador PRO
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  const { profile, addCredits, setSubscriptionPlan, user } = useAuth();

  if (!isOpen) return null;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const handleApprovePack = async (data: any, actions: any) => {
    return actions.order.capture().then(async (details: any) => {
      console.log('Pago completado con éxito:', details);
      await addCredits(selectedPack.credits);
      triggerConfetti();
      setPaymentSuccess(`¡Felicidades! Se han acreditado ${selectedPack.credits} créditos a tu cuenta.`);
      setTimeout(() => {
        setPaymentSuccess(null);
        onClose();
      }, 3500);
    });
  };

  const handleApproveSubscription = async (data: any, actions: any) => {
    return actions.order.capture().then(async (details: any) => {
      console.log('Suscripción activada con éxito:', details);
      await setSubscriptionPlan(selectedPlan.id as any, details.id);
      triggerConfetti();
      setPaymentSuccess(`¡Plan ${selectedPlan.name} activado con éxito! Disfruta de generaciones ilimitadas.`);
      setTimeout(() => {
        setPaymentSuccess(null);
        onClose();
      }, 3500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl shadow-cyan-950/60 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Planes & Recarga de Créditos
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                  PayPal Protegido
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Saldo actual: <strong className="text-cyan-300">{profile?.credits || 0} créditos</strong> • Plan: <strong className="text-indigo-300 capitalize">{profile?.plan === 'free' ? 'Gratuito' : profile?.plan}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Success Banner */}
          {paymentSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center gap-3 text-emerald-200 animate-fadeIn">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-sm text-emerald-100">Transacción Aprobada</p>
                <p className="text-xs">{paymentSuccess}</p>
              </div>
            </div>
          )}

          {/* Tabs (Packs vs Subscriptions) */}
          <div className="flex items-center justify-center">
            <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-white/10 text-xs shadow-inner">
              <button
                type="button"
                onClick={() => setActiveTab('packs')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === 'packs'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Paquetes de Créditos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('subscriptions')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                  activeTab === 'subscriptions'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>Suscripciones Mensuales PRO</span>
              </button>
            </div>
          </div>

          {/* TAB 1: PAQUETES DE CRÉDITOS */}
          {activeTab === 'packs' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CREDIT_PACKAGES.map((pkg) => {
                  const isSelected = selectedPack.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPack(pkg)}
                      className={`relative cursor-pointer rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 shadow-xl shadow-cyan-950/50 ring-2 ring-cyan-400/40'
                          : 'bg-slate-900/50 border-white/5 hover:border-white/20 hover:bg-slate-900/80'
                      }`}
                    >
                      {pkg.badge && (
                        <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                          {pkg.badge}
                        </div>
                      )}

                      <div>
                        <h4 className="text-base font-bold text-white mb-1">{pkg.name}</h4>
                        <div className="flex items-baseline gap-1 my-3">
                          <span className="text-3xl font-extrabold text-white">${pkg.priceUSD}</span>
                          <span className="text-xs text-slate-400">USD único</span>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/60 text-xs font-bold mb-4">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{pkg.credits} Créditos</span>
                        </div>

                        <ul className="space-y-2 text-xs text-slate-300">
                          {pkg.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-5 pt-3 border-t border-white/5">
                        <div className={`w-full py-2 rounded-xl text-center text-xs font-bold transition-all ${
                          isSelected ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {isSelected ? 'Seleccionado' : 'Elegir Paquete'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PayPal Checkout Area for Pack */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300 border-b border-white/10 pb-2">
                  <span>Paquete Seleccionado:</span>
                  <strong className="text-white">{selectedPack.name} ({selectedPack.credits} Créditos)</strong>
                </div>
                <div className="flex items-center justify-between text-sm text-white font-bold">
                  <span>Total a Pagar:</span>
                  <span className="text-cyan-400 text-lg">${selectedPack.priceUSD} USD</span>
                </div>

                <div className="pt-2">
                  <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
                    <PayPalButtons
                      style={{ layout: 'vertical', shape: 'rect', color: 'blue', height: 42 }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          intent: 'CAPTURE',
                          purchase_units: [
                            {
                              description: `Bleumaia - ${selectedPack.name} (${selectedPack.credits} créditos)`,
                              amount: {
                                currency_code: 'USD',
                                value: selectedPack.priceUSD.toFixed(2),
                              },
                            },
                          ],
                        });
                      }}
                      onApprove={handleApprovePack}
                      onError={(err) => {
                        console.error('Error en PayPal:', err);
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUSCRIPCIONES MENSUALES */}
          {activeTab === 'subscriptions' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isSelected = selectedPlan.id === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`relative cursor-pointer rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-400 shadow-xl shadow-indigo-950/50 ring-2 ring-indigo-400/40'
                          : 'bg-slate-900/50 border-white/5 hover:border-white/20 hover:bg-slate-900/80'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                          Recomendado
                        </div>
                      )}

                      <div>
                        <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                        <div className="flex items-baseline gap-1 my-3">
                          <span className="text-4xl font-extrabold text-white">${plan.priceUSD}</span>
                          <span className="text-xs text-slate-400">/ mes</span>
                        </div>

                        <ul className="space-y-2.5 text-xs text-slate-300 my-4">
                          {plan.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5">
                        <div className={`w-full py-2.5 rounded-xl text-center text-xs font-bold transition-all ${
                          isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {isSelected ? 'Plan Seleccionado' : 'Elegir Plan'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PayPal Checkout Area for Subscription */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-500/20 max-w-md mx-auto space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300 border-b border-white/10 pb-2">
                  <span>Plan Seleccionado:</span>
                  <strong className="text-white">{selectedPlan.name}</strong>
                </div>
                <div className="flex items-center justify-between text-sm text-white font-bold">
                  <span>Monto Mensual:</span>
                  <span className="text-indigo-400 text-lg">${selectedPlan.priceUSD} USD / mes</span>
                </div>

                <div className="pt-2">
                  <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'USD' }}>
                    <PayPalButtons
                      style={{ layout: 'vertical', shape: 'rect', color: 'gold', height: 42 }}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          intent: 'CAPTURE',
                          purchase_units: [
                            {
                              description: `Bleumaia - Suscripción ${selectedPlan.name}`,
                              amount: {
                                currency_code: 'USD',
                                value: selectedPlan.priceUSD.toFixed(2),
                              },
                            },
                          ],
                        });
                      }}
                      onApprove={handleApproveSubscription}
                      onError={(err) => {
                        console.error('Error en PayPal:', err);
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pagos procesados y garantizados de forma 100% segura por PayPal Inc.</span>
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
