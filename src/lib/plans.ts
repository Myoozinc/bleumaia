export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceUSD: number;
  badge?: string;
  popular?: boolean;
  features: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceUSD: number;
  period: 'month' | 'year';
  creditsMonthly: number;
  popular?: boolean;
  features: string[];
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'pack_starter',
    name: 'Pack Inicial',
    credits: 100,
    priceUSD: 4.99,
    features: [
      '100 Créditos para Imágenes o Videos',
      'Sin fecha de caducidad',
      'Descargas en Máxima Resolución',
      'Acceso a todos los estilos y motores',
    ],
  },
  {
    id: 'pack_pro',
    name: 'Pack Creador PRO',
    credits: 500,
    priceUSD: 14.99,
    badge: 'Ahorra 40%',
    popular: true,
    features: [
      '500 Créditos recargables',
      'Generación prioritaria en servidores',
      'Acceso completo a Wan 2.1 Video & Nano Banana Pro',
      'Soporte técnico preferente',
    ],
  },
  {
    id: 'pack_studio',
    name: 'Pack Studio Ultra',
    credits: 1500,
    priceUSD: 29.99,
    badge: 'Mejor Valor',
    features: [
      '1,500 Créditos inmediatos',
      'Máxima velocidad de renderizado en GPU',
      'Generación de videos ilimitada por lotes',
      'Licencia comercial completa para tus creaciones',
    ],
  },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'sub_creator',
    name: 'Plan Creador PRO',
    priceUSD: 9.99,
    period: 'month',
    creditsMonthly: 400,
    popular: true,
    features: [
      '400 Créditos mensuales renovables',
      'Generaciones rápidas ilimitadas (FLUX.1 Schnell & Turbo)',
      'Acceso a modelos de video Wan 2.1 y CogVideoX',
      'Asistente de Prompts Gemini Ultra ilimitado',
      'Descargas sin marca de agua',
    ],
  },
  {
    id: 'sub_studio',
    name: 'Plan Studio Ilimitado',
    priceUSD: 19.99,
    period: 'month',
    creditsMonthly: 1200,
    features: [
      '1,200 Créditos premium al mes',
      'Cola de procesamiento de máxima prioridad',
      'Acceso exclusivo a Nano Banana Pro & Wan 2.1 Video HD',
      'Almacenamiento en la nube de todas tus creaciones',
      'Soporte prioritario VIP 24/7',
    ],
  },
];

export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb'; // 'sb' = sandbox default
