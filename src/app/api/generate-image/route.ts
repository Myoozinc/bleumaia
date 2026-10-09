import { NextRequest, NextResponse } from 'next/server';
import { ASPECT_RATIOS, STYLE_PRESETS } from '@/lib/styles';
import { AspectRatio, ProviderId } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      negativePrompt = '',
      styleId = 'none',
      aspectRatio = '1:1' as AspectRatio,
      seed = Math.floor(Math.random() * 1000000),
      provider = 'pollinations' as ProviderId,
      model = 'flux',
      apiKey = '',
    } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Por favor escribe un prompt para generar tu imagen.' }, { status: 400 });
    }

    // Lookup style and compute full prompts
    const selectedStyle = STYLE_PRESETS.find(s => s.id === styleId) || STYLE_PRESETS[0];
    const fullPrompt = `${prompt.trim()}${selectedStyle.promptSuffix}`;
    const fullNegativePrompt = [negativePrompt, selectedStyle.negativePrompt]
      .filter(Boolean)
      .join(', ');

    // Calculate dimensions
    const ratioConfig = ASPECT_RATIOS.find(r => r.id === aspectRatio) || ASPECT_RATIOS[0];
    const width = ratioConfig.width;
    const height = ratioConfig.height;

    // Determine custom key or environment variables
    const activeKey = apiKey.trim() || 
      (provider === 'siliconflow' ? process.env.SILICONFLOW_API_KEY : '') ||
      (provider === 'huggingface' ? process.env.HUGGINGFACE_API_KEY : '') ||
      (provider === 'cloudflare' ? process.env.CLOUDFLARE_API_KEY : '');

    // 1. SI TIENE KEY PERSONAL CONFIGURADA PARA SILICONFLOW
    if (provider === 'siliconflow' && activeKey) {
      try {
        const siliconModel = model.includes('dev') ? 'black-forest-labs/FLUX.1-dev' : 'black-forest-labs/FLUX.1-schnell';
        const res = await fetch('https://api.siliconflow.cn/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeKey}`,
          },
          body: JSON.stringify({
            model: siliconModel,
            prompt: fullPrompt,
            negative_prompt: fullNegativePrompt || undefined,
            image_size: `${width}x${height}`,
            seed,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const generatedUrl = data?.images?.[0]?.url || data?.data?.[0]?.url;
          if (generatedUrl) {
            return NextResponse.json({
              success: true,
              url: generatedUrl,
              provider: 'siliconflow',
              model: siliconModel,
              seed,
              fullPrompt,
            });
          }
        }
      } catch (err) {
        console.warn('SiliconFlow custom key failed, falling back to auto engine...', err);
      }
    }

    // 2. SI TIENE TOKEN PERSONAL PARA HUGGING FACE
    if (provider === 'huggingface' && activeKey) {
      try {
        const hfModel = 'black-forest-labs/FLUX.1-schnell';
        const res = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${activeKey}`,
          },
          body: JSON.stringify({
            inputs: fullPrompt,
            parameters: { width, height, seed },
          }),
        });

        if (res.ok) {
          const arrayBuffer = await res.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          return NextResponse.json({
            success: true,
            url: `data:image/jpeg;base64,${base64}`,
            provider: 'huggingface',
            model: hfModel,
            seed,
            fullPrompt,
          });
        }
      } catch (err) {
        console.warn('HuggingFace custom key failed, falling back to auto engine...', err);
      }
    }

    // 3. MOTOR UNIVERSAL AUTO-INTEGRADO (FLUX.1 / REALISM / ANIME / 3D / TURBO)
    // 100% Gratuito, cero configuración, genera al instante
    let targetModel = 'flux';
    const cleanModel = (model || '').toLowerCase();

    if (cleanModel.includes('realism') || selectedStyle.id === 'photoreal_8k') {
      targetModel = 'flux-realism';
    } else if (cleanModel.includes('anime') || selectedStyle.id === 'anime_shinkai') {
      targetModel = 'flux-anime';
    } else if (cleanModel.includes('3d') || selectedStyle.id === 'pixar_3d') {
      targetModel = 'flux-3d';
    } else if (cleanModel.includes('turbo') || cleanModel.includes('lightning')) {
      targetModel = 'turbo';
    }

    const encodedPrompt = encodeURIComponent(fullPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${targetModel}&seed=${seed}&nologo=true`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
      provider: provider || 'pollinations',
      model: targetModel,
      seed,
      fullPrompt,
      autoIntegrated: true,
    });

  } catch (error: any) {
    console.error('Error in /api/generate-image:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al generar la imagen.' },
      { status: 500 }
    );
  }
}
