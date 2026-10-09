export type ProviderId = 
  | 'pollinations'
  | 'siliconflow'
  | 'huggingface'
  | 'cloudflare'
  | 'gemini'
  | 'zhipu'
  | 'dashscope';

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  flag: string;
  region: string;
  requiresKey: boolean;
  freeTierDescription: string;
  signupUrl: string;
  models: {
    image?: string[];
    video?: string[];
    text?: string[];
  };
  supportedTypes: ('image' | 'video' | 'text')[];
}

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '21:9';

export interface StylePreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  thumbnail: string;
  promptSuffix: string;
  negativePrompt: string;
}

export interface GeneratedAsset {
  id: string;
  type: 'image' | 'video';
  url: string;
  prompt: string;
  negativePrompt?: string;
  styleId?: string;
  provider: ProviderId;
  model: string;
  aspectRatio?: AspectRatio;
  seed?: number;
  createdAt: number;
}

export type MotionPreset = 
  | 'zoom_in' 
  | 'zoom_out' 
  | 'pan_left' 
  | 'pan_right' 
  | 'orbit' 
  | 'drone' 
  | 'slow_motion'
  | 'static';

export interface VideoGenerationParams {
  prompt: string;
  imageUrl?: string;
  motion?: MotionPreset;
  duration?: number;
  provider: ProviderId;
  model: string;
}

export interface ImageGenerationParams {
  prompt: string;
  negativePrompt?: string;
  styleId: string;
  aspectRatio: AspectRatio;
  seed?: number;
  steps?: number;
  provider: ProviderId;
  model?: string;
}
