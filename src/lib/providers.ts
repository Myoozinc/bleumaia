import { ProviderConfig, ProviderId } from './types';

export const GLOBAL_PROVIDERS: ProviderConfig[] = [
  {
    id: 'pollinations',
    name: 'Motor Universal Auto (FLUX & SDXL)',
    flag: '⚡',
    region: 'Auto-Integrado / Global',
    requiresKey: false,
    freeTierDescription: '100% Integrado y automático. Genera al instante sin necesidad de claves ni registro.',
    signupUrl: 'https://pollinations.ai',
    supportedTypes: ['image', 'video'],
    models: {
      image: [
        'flux (FLUX.1 Schnell)',
        'flux-realism (Fotografía Realista)',
        'flux-anime (Anime & Ilustración)',
        'flux-3d (Render 3D Octane)',
        'turbo (SDXL Ultra-Rápido)',
      ],
      video: ['pollinations-video (Cinemático Auto)'],
    },
  },
  {
    id: 'siliconflow',
    name: 'SiliconFlow (Asia / Wan 2.1 & DeepSeek)',
    flag: '🇨🇳',
    region: 'China / Asia (Auto-Fallback)',
    requiresKey: false,
    freeTierDescription: 'Integrado automáticamente. Modos Alibaba Wan 2.1 Video, CogVideoX y DeepSeek.',
    signupUrl: 'https://cloud.siliconflow.cn',
    supportedTypes: ['image', 'video', 'text'],
    models: {
      image: [
        'black-forest-labs/FLUX.1-schnell',
        'stabilityai/stable-diffusion-3-medium',
      ],
      video: [
        'Wan-AI/Wan2.1-T2V-14B (Alibaba Video)',
        'THUDM/CogVideoX-5B (Zhipu Video)',
      ],
      text: ['deepseek-ai/DeepSeek-V3'],
    },
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Community AI',
    flag: '🇪🇺',
    region: 'Europa / Open Source',
    requiresKey: false,
    freeTierDescription: 'Integrado automáticamente con los checkpoints abiertos de la comunidad.',
    signupUrl: 'https://huggingface.co',
    supportedTypes: ['image'],
    models: {
      image: [
        'black-forest-labs/FLUX.1-schnell',
        'stabilityai/stable-diffusion-3.5-large',
      ],
    },
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Edge AI',
    flag: '🇺🇸',
    region: 'Global Edge',
    requiresKey: false,
    freeTierDescription: 'Integrado con 10,000 neuronas diarias automáticas en la red Cloudflare.',
    signupUrl: 'https://dash.cloudflare.com',
    supportedTypes: ['image'],
    models: {
      image: [
        '@cf/black-forest-labs/flux-1-schnell',
        '@cf/stabilityai/stable-diffusion-xl-base-1.0',
      ],
    },
  },
  {
    id: 'gemini',
    name: 'Google Gemini Studio AI',
    flag: '🇺🇸',
    region: 'Google AI / Auto Director',
    requiresKey: false,
    freeTierDescription: 'Director y optimizador de prompts inteligente 100% activo de forma nativa.',
    signupUrl: 'https://aistudio.google.com',
    supportedTypes: ['text'],
    models: {
      text: ['gemini-2.0-flash'],
    },
  },
];

export function getProviderById(id: ProviderId): ProviderConfig | undefined {
  return GLOBAL_PROVIDERS.find(p => p.id === id);
}
