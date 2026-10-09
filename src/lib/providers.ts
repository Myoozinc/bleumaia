import { ProviderConfig, ProviderId } from './types';

export const GLOBAL_PROVIDERS: ProviderConfig[] = [
  {
    id: 'pollinations',
    name: 'Pollinations.ai',
    flag: '🌐',
    region: 'Global / Open Source',
    requiresKey: false,
    freeTierDescription: '100% Gratuito y sin registro. Funciona al instante para imagen y video.',
    signupUrl: 'https://pollinations.ai',
    supportedTypes: ['image', 'video'],
    models: {
      image: ['flux', 'flux-realism', 'flux-anime', 'flux-3d', 'turbo'],
      video: ['pollinations-video', 'seedance'],
    },
  },
  {
    id: 'siliconflow',
    name: 'SiliconFlow (硅基流动)',
    flag: '🇨🇳',
    region: 'China / Asia',
    requiresKey: true,
    freeTierDescription: 'Créditos de bienvenida gratuitos + modelos serverless: Alibaba Wan 2.1 Video, FLUX.1, CogVideoX.',
    signupUrl: 'https://cloud.siliconflow.cn/account/ak',
    supportedTypes: ['image', 'video', 'text'],
    models: {
      image: [
        'black-forest-labs/FLUX.1-schnell',
        'stabilityai/stable-diffusion-3-medium',
        'black-forest-labs/FLUX.1-dev',
      ],
      video: [
        'Wan-AI/Wan2.1-T2V-14B',
        'Wan-AI/Wan2.1-I2V-14B',
        'THUDM/CogVideoX-5B',
      ],
      text: ['deepseek-ai/DeepSeek-V3', 'deepseek-ai/DeepSeek-R1'],
    },
  },
  {
    id: 'huggingface',
    name: 'Hugging Face Inference',
    flag: '🇪🇺',
    region: 'Europa / Global',
    requiresKey: true,
    freeTierDescription: 'Capa Serverless gratuita con token de usuario. FLUX.1-schnell, SD 3.5, SDXL.',
    signupUrl: 'https://huggingface.co/settings/tokens',
    supportedTypes: ['image'],
    models: {
      image: [
        'black-forest-labs/FLUX.1-schnell',
        'stabilityai/stable-diffusion-3.5-large',
        'stabilityai/stable-diffusion-xl-base-1.0',
      ],
    },
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Workers AI',
    flag: '🇺🇸',
    region: 'Global / Cloudflare Edge',
    requiresKey: true,
    freeTierDescription: '10,000 Neuronas gratuitas por día para siempre. FLUX y SDXL en el Edge.',
    signupUrl: 'https://dash.cloudflare.com/profile/api-tokens',
    supportedTypes: ['image'],
    models: {
      image: [
        '@cf/black-forest-labs/flux-1-schnell',
        '@cf/stabilityai/stable-diffusion-xl-base-1.0',
        '@cf/bytedance/stable-diffusion-xl-lightning',
      ],
    },
  },
  {
    id: 'gemini',
    name: 'Google Gemini (AI Studio)',
    flag: '🇺🇸',
    region: 'Global / Google AI',
    requiresKey: true,
    freeTierDescription: '60 solicitudes por minuto gratis sin tarjeta. Director de prompts y visión multimodal.',
    signupUrl: 'https://aistudio.google.com/app/apikey',
    supportedTypes: ['text'],
    models: {
      text: ['gemini-2.0-flash', 'gemini-1.5-flash'],
    },
  },
  {
    id: 'zhipu',
    name: 'Zhipu AI (智谱 BigModel)',
    flag: '🇨🇳',
    region: 'China',
    requiresKey: true,
    freeTierDescription: 'Creadores de CogVideoX y CogView-3. Cuotas de inicio para desarrolladores.',
    signupUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
    supportedTypes: ['image', 'video', 'text'],
    models: {
      image: ['cogview-3-flash'],
      video: ['cogvideox-flash'],
      text: ['glm-4-flash'],
    },
  },
  {
    id: 'dashscope',
    name: 'Alibaba Cloud DashScope (百炼)',
    flag: '🇨🇳',
    region: 'China / Alibaba',
    requiresKey: true,
    freeTierDescription: 'Modelos Tongyi Wanxiang (Wanx) de imagen y video, y modelos de lenguaje Qwen.',
    signupUrl: 'https://dashscope.console.aliyun.com/apiKey',
    supportedTypes: ['image', 'video', 'text'],
    models: {
      image: ['wanx-v1', 'wanx-style-repaint-v1'],
      video: ['wanx-video-t2v-v1'],
      text: ['qwen-plus', 'qwen-turbo'],
    },
  },
];

export function getProviderById(id: ProviderId): ProviderConfig | undefined {
  return GLOBAL_PROVIDERS.find(p => p.id === id);
}
