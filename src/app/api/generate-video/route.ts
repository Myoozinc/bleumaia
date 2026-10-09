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

    // 1. POLLINATIONS VIDEO (Cero-Config / Inmediato)
    if (provider === 'pollinations') {
      const encodedPrompt = encodeURIComponent(fullVideoPrompt);
      // Pollinations video endpoint
      const videoUrl = `https://gen.pollinations.ai/video/${encodedPrompt}`;

      return NextResponse.json({
        success: true,
        url: videoUrl,
        provider: 'pollinations',
        model: 'pollinations-video',
        fullPrompt: fullVideoPrompt,
        motion,
      });
    }

    // 2. SILICONFLOW VIDEO (Alibaba Wan 2.1 & CogVideoX)
    if (provider === 'siliconflow') {
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Se requiere API Key de SiliconFlow para generar videos con Alibaba Wan 2.1 / CogVideoX.' },
          { status: 400 }
        );
      }

      const isImageToVideo = Boolean(imageUrl);
      const chosenModel = isImageToVideo 
        ? (model.includes('Wan') ? 'Wan-AI/Wan2.1-I2V-14B' : 'THUDM/CogVideoX-5B')
        : (model || 'Wan-AI/Wan2.1-T2V-14B');

      // Post asynchronous video creation request to SiliconFlow
      const payload: any = {
        model: chosenModel,
        prompt: fullVideoPrompt,
      };

      if (isImageToVideo) {
        payload.image = imageUrl;
      }

      const res = await fetch('https://api.siliconflow.cn/v1/video/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Error en SiliconFlow Video (${res.status}): ${errText.slice(0, 150)}`);
      }

      const data = await res.json();
      // Returns task ID or direct URL
      const taskId = data.requestId || data.task_id || data.id;

      return NextResponse.json({
        success: true,
        taskId: taskId,
        url: data.url || null,
        provider: 'siliconflow',
        model: chosenModel,
        status: data.url ? 'ready' : 'processing',
        fullPrompt: fullVideoPrompt,
      });
    }

    return NextResponse.json(
      { error: `El proveedor ${provider} aún no está implementado para video.` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in /api/generate-video:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al generar video.' },
      { status: 500 }
    );
  }
}
