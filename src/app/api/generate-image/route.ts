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
      return NextResponse.json({ error: 'El prompt es requerido.' }, { status: 400 });
    }

    // Lookup style and compute full prompts
    const selectedStyle = STYLE_PRESETS.find(s => s.id === styleId) || STYLE_PRESETS[0];
    const fullPrompt = `${prompt.trim()}${selectedStyle.promptSuffix}`;
    const fullNegativePrompt = [negativePrompt, selectedStyle.negativePrompt]
      .filter(Boolean)
      .join(', ');

    // Calculate width & height according to aspect ratio
    const ratioConfig = ASPECT_RATIOS.find(r => r.id === aspectRatio) || ASPECT_RATIOS[0];
    const width = ratioConfig.width;
    const height = ratioConfig.height;

    // 1. POLLINATIONS (Cero-Config / Inmediato)
    if (provider === 'pollinations') {
      const sanitizedModel = model || 'flux';
      const encodedPrompt = encodeURIComponent(fullPrompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${sanitizedModel}&seed=${seed}&nologo=true`;

      return NextResponse.json({
        success: true,
        url: imageUrl,
        provider: 'pollinations',
        model: sanitizedModel,
        seed,
        fullPrompt,
      });
    }

    // 2. SILICONFLOW (Asia / China)
    if (provider === 'siliconflow') {
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Se requiere una API Key de SiliconFlow. Configúrala en la Bóveda de Claves.' },
          { status: 400 }
        );
      }

      const siliconModel = model || 'black-forest-labs/FLUX.1-schnell';
      const sizeString = `${width}x${height}`;

      const res = await fetch('https://api.siliconflow.cn/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: siliconModel,
          prompt: fullPrompt,
          negative_prompt: fullNegativePrompt || undefined,
          image_size: sizeString,
          seed,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error de SiliconFlow (${res.status})`);
      }

      const data = await res.json();
      const generatedUrl = data?.images?.[0]?.url || data?.data?.[0]?.url;

      if (!generatedUrl) {
        throw new Error('No se recibió la URL de la imagen generada por SiliconFlow.');
      }

      return NextResponse.json({
        success: true,
        url: generatedUrl,
        provider: 'siliconflow',
        model: siliconModel,
        seed,
        fullPrompt,
      });
    }

    // 3. HUGGING FACE INFERENCE (Europa / Global)
    if (provider === 'huggingface') {
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Se requiere un Token de Hugging Face (hf_...). Configúralo en la Bóveda de Claves.' },
          { status: 400 }
        );
      }

      const hfModel = model || 'black-forest-labs/FLUX.1-schnell';
      const endpoint = `https://api-inference.huggingface.co/models/${hfModel}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters: {
            negative_prompt: fullNegativePrompt || undefined,
            width,
            height,
            seed,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Error de Hugging Face (${res.status}): ${errText.slice(0, 150)}`);
      }

      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        provider: 'huggingface',
        model: hfModel,
        seed,
        fullPrompt,
      });
    }

    // 4. CLOUDFLARE WORKERS AI
    if (provider === 'cloudflare') {
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Se requiere un Token de Cloudflare Workers AI. Configúralo en la Bóveda de Claves.' },
          { status: 400 }
        );
      }

      // Format expected: ACCOUNT_ID:API_TOKEN or bearer token
      const parts = apiKey.split(':');
      const accountId = parts.length > 1 ? parts[0] : process.env.CLOUDFLARE_ACCOUNT_ID;
      const token = parts.length > 1 ? parts[1] : parts[0];

      if (!accountId) {
        return NextResponse.json(
          { error: 'Para Cloudflare introduce tu formato: ID_DE_CUENTA:API_TOKEN' },
          { status: 400 }
        );
      }

      const cfModel = model || '@cf/black-forest-labs/flux-1-schnell';
      const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${cfModel}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: fullPrompt,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Error de Cloudflare (${res.status}): ${errText.slice(0, 150)}`);
      }

      const arrayBuffer = await res.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        provider: 'cloudflare',
        model: cfModel,
        seed,
        fullPrompt,
      });
    }

    return NextResponse.json(
      { error: `El proveedor ${provider} aún no está implementado para imagen.` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error in /api/generate-image:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al generar la imagen.' },
      { status: 500 }
    );
  }
}
