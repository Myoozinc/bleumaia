import { NextRequest, NextResponse } from 'next/server';
import { MotionPreset, ProviderId } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      imageUrl,
      motion = 'orbit' as MotionPreset,
      provider = 'pollinations' as ProviderId,
      model = 'pollinations-video',
      apiKey = '',
    } = body;

    if (!prompt && !imageUrl) {
      return NextResponse.json({ error: 'Se requiere un prompt o una imagen inicial.' }, { status: 400 });
    }

    const motionPrompts: Record<MotionPreset, string> = {
      zoom_in: 'smooth slow camera zoom in, cinematic forward push, 4k 60fps',
      zoom_out: 'smooth slow camera zoom out, wide reveal, 4k 60fps',
      pan_left: 'smooth camera panning to the left, cinematic travel, fluid motion',
      pan_right: 'smooth camera panning to the right, cinematic travel, fluid motion',
      orbit: '360 degree smooth orbital camera rotation around subject, cinematic masterwork',
      drone: 'spectacular dynamic drone fpv flythrough shot, soaring cinematic view',
      slow_motion: 'epic ultra high frame rate slow motion, hyper-detailed fluid physics',
      static: 'steady locked camera shot with gentle ambient atmospheric movement',
    };

    const enhancedMotion = (motion && motion in motionPrompts) 
      ? motionPrompts[motion as MotionPreset] 
      : motionPrompts.orbit;
    const fullVideoPrompt = prompt ? `${prompt}, ${enhancedMotion}` : enhancedMotion;

    const activeKey = apiKey.trim() || process.env.SILICONFLOW_API_KEY || '';

    // 1. SI SE DISPONE DE API KEY DE SILICONFLOW PARA WAN 2.1 / COGVIDEOX
    if (provider === 'siliconflow' && activeKey) {
      try {
        const isImageToVideo = Boolean(imageUrl);
        const chosenModel = isImageToVideo 
          ? (model.includes('Wan') ? 'Wan-AI/Wan2.1-I2V-14B' : 'THUDM/CogVideoX-5B')
          : 'Wan-AI/Wan2.1-T2V-14B';

        const payload: any = {
          model: chosenModel,
          prompt: fullVideoPrompt,
        };
        if (isImageToVideo) payload.image = imageUrl;

        const res = await fetch('https://api.siliconflow.cn/v1/video/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({
            success: true,
            taskId: data.requestId || data.id,
            url: data.url || null,
            provider: 'siliconflow',
            model: chosenModel,
            fullPrompt: fullVideoPrompt,
          });
        }
      } catch (err) {
        console.warn('Siliconflow video failed, falling back to auto video engine...', err);
      }
    }

    // 2. MOTOR DE VIDEO AUTO-INTEGRADO (Cero-Config / Inmediato)
    const encodedPrompt = encodeURIComponent(fullVideoPrompt);
    const videoUrl = `https://gen.pollinations.ai/video/${encodedPrompt}`;

    return NextResponse.json({
      success: true,
      url: videoUrl,
      provider: provider || 'pollinations',
      model: model || 'auto-video-flux',
      fullPrompt: fullVideoPrompt,
      motion,
      autoIntegrated: true,
    });

  } catch (error: any) {
    console.error('Error in /api/generate-video:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al generar video.' },
      { status: 500 }
    );
  }
}
