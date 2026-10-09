import { NextRequest, NextResponse } from 'next/server';
import { ASPECT_RATIOS, STYLE_PRESETS } from '@/lib/styles';
import { AspectRatio, ProviderId } from '@/lib/types';

export const maxDuration = 60; // Allow up to 60 seconds on Vercel

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

    // Normalize dimensions to optimal FLUX/SDXL latents (multiples of 64)
    let width = 1024;
    let height = 1024;
    if (aspectRatio === '16:9') {
      width = 1024;
      height = 576;
    } else if (aspectRatio === '9:16') {
      width = 576;
      height = 1024;
    } else if (aspectRatio === '4:3') {
      width = 1024;
      height = 768;
    } else if (aspectRatio === '21:9') {
      width = 1024;
      height = 448;
    }

    const activeKey = apiKey.trim() || 
      (provider === 'siliconflow' ? process.env.SILICONFLOW_API_KEY : '') ||
      (provider === 'huggingface' ? process.env.HUGGINGFACE_API_KEY : '') ||
      (provider === 'nano_banana' || provider === 'gemini' ? (process.env.NANO_BANANA_API_KEY || process.env.GEMINI_API_KEY || '') : '');

    // 0. NANO BANANA (GOOGLE AI STUDIO / GEMINI IMAGEN)
    if ((provider === 'nano_banana' || provider === 'gemini') && activeKey) {
      try {
        const googleRatio = aspectRatio === '16:9' ? '16:9' : aspectRatio === '9:16' ? '9:16' : aspectRatio === '4:3' ? '4:3' : '1:1';
        const imagenUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${activeKey}`;

        const imgRes = await fetch(imagenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': activeKey,
          },
          body: JSON.stringify({
            instances: [{ prompt: fullPrompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: googleRatio,
              outputMimeType: 'image/jpeg',
            },
          }),
        });

        if (imgRes.ok) {
          const imgData = await imgRes.json();
          const b64 = imgData?.predictions?.[0]?.bytesBase64Encoded;
          if (b64) {
            return NextResponse.json({
              success: true,
              url: `data:image/jpeg;base64,${b64}`,
              provider: 'nano_banana',
              model: model || 'nano-banana-2.1',
              seed,
              fullPrompt,
              autoIntegrated: true,
            });
          }
        }
      } catch (err) {
        console.warn('Nano Banana predict error, continuing to cascade...', err);
      }
    }

    // 1. SI EL USUARIO INTRODUCE SU CLAVE PERSONAL DE SILICONFLOW
    if (provider === 'siliconflow' && activeKey) {
      try {
        const siliconModel = 'black-forest-labs/FLUX.1-schnell';
        const sfRes = await fetch('https://api.siliconflow.cn/v1/images/generations', {
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

        if (sfRes.ok) {
          const sfData = await sfRes.json();
          const imgUrl = sfData?.images?.[0]?.url || sfData?.data?.[0]?.url;
          if (imgUrl) {
            // Fetch image and return as data URL to prevent CORS/broken links
            const imgRes = await fetch(imgUrl);
            if (imgRes.ok) {
              const buf = await imgRes.arrayBuffer();
              const b64 = Buffer.from(buf).toString('base64');
              return NextResponse.json({
                success: true,
                url: `data:image/jpeg;base64,${b64}`,
                provider: 'siliconflow',
                model: siliconModel,
                seed,
                fullPrompt,
              });
            }
          }
        }
      } catch (err) {
        console.warn('SiliconFlow personal key failed, continuing to auto cascade...', err);
      }
    }

    // 2. MOTOR UNIVERSAL AUTO-INTEGRADO CON CASCADA INTELIGENTE
    // Probamos 'flux' (FLUX.1 Schnell) y luego 'turbo' si hay saturación
    const modelsToTry = ['flux', 'turbo'];

    for (const modelCandidate of modelsToTry) {
      try {
        const encodedPrompt = encodeURIComponent(fullPrompt);
        const candidateUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${modelCandidate}&seed=${seed}&nologo=true`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 28000); // 28s timeout

        const response = await fetch(candidateUrl, {
          signal: controller.signal,
          headers: {
            Accept: 'image/jpeg, image/png, image/*',
          },
        });
        clearTimeout(timeoutId);

        const contentType = response.headers.get('content-type') || '';

        // Si el endpoint devuelve una imagen real con 200 OK
        if (response.ok && contentType.startsWith('image/')) {
          const arrayBuffer = await response.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString('base64');
          const dataUrl = `data:${contentType};base64,${base64}`;

          return NextResponse.json({
            success: true,
            url: dataUrl,
            provider: 'pollinations',
            model: modelCandidate,
            seed,
            fullPrompt,
            autoIntegrated: true,
          });
        } else {
          console.warn(`Model ${modelCandidate} returned status ${response.status} (${contentType}), trying next...`);
        }
      } catch (err) {
        console.warn(`Attempt with ${modelCandidate} encountered error, trying next candidate...`, err);
      }
    }

    // Si ambos fallaron por timeout de red extrema, retornamos URL directa de respaldo
    const fallbackEncoded = encodeURIComponent(fullPrompt);
    const directFallbackUrl = `https://image.pollinations.ai/prompt/${fallbackEncoded}?width=${width}&height=${height}&model=flux&seed=${seed}&nologo=true`;

    return NextResponse.json({
      success: true,
      url: directFallbackUrl,
      provider: 'pollinations',
      model: 'flux',
      seed,
      fullPrompt,
      fallback: true,
    });

  } catch (error: any) {
    console.error('Error in /api/generate-image:', error);
    return NextResponse.json(
      { error: error?.message || 'Error al procesar la generación de imagen.' },
      { status: 500 }
    );
  }
}
