import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, tone = 'cinematic', geminiKey = '', siliconKey = '' } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Se requiere un prompt para mejorar.' }, { status: 400 });
    }

    const systemInstruction = `You are the master creative director for world-class AI generative models (FLUX.1, Midjourney, Stable Diffusion, Wan 2.1).
Translate the user's idea (which might be in Spanish) into an extraordinary, ultra-detailed, vivid English master prompt.
Enhance with:
- Main subject with detailed attire/appearance
- Cinematic lighting (golden hour, volumetric fog, rim light, subsurface scattering)
- Camera & lens optics (shot on Hasselblad, 85mm f/1.4, shallow depth of field, 8k resolution)
- Texture and environmental atmosphere
- Artistic tone: ${tone}.
IMPORTANT: Output ONLY the improved prompt text. Do not include markdown quotes, explanations, or prefixes.`;

    // 1. If user configured Gemini Key
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemInstruction}\n\nUser input: "${prompt}"` }],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 250,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const enhanced = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (enhanced) {
            return NextResponse.json({ success: true, enhancedPrompt: enhanced, source: 'gemini' });
          }
        }
      } catch (err) {
        console.warn('Gemini enhancement failed, falling back...', err);
      }
    }

    // 2. If user configured SiliconFlow Key (DeepSeek-V3)
    if (siliconKey) {
      try {
        const sfRes = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${siliconKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-ai/DeepSeek-V3',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: prompt },
            ],
            max_tokens: 250,
          }),
        });

        if (sfRes.ok) {
          const sfData = await sfRes.json();
          const enhanced = sfData?.choices?.[0]?.message?.content?.trim();
          if (enhanced) {
            return NextResponse.json({ success: true, enhancedPrompt: enhanced, source: 'deepseek' });
          }
        }
      } catch (err) {
        console.warn('SiliconFlow enhancement failed, falling back...', err);
      }
    }

    // 3. Fallback Heuristic AI Enhancer (Instant & 100% Free Zero-Config)
    const tonesMap: Record<string, string> = {
      cinematic: 'cinematic still, dramatic atmospheric lighting, 35mm film grain, 8k resolution, photorealistic, intricate textures, shallow depth of field, anamorphic lens flares, masterwork',
      fantasy: 'epic dark fantasy concept art, ethereal magical atmosphere, volumetric mist, ornate baroque details, moody lighting, masterpiece, trending on ArtStation',
      anime: 'Makoto Shinkai and Studio Ghibli inspired visual, radiant golden clouds, pristine vivid color grading, intricate hand-drawn anime aesthetic, ultra-detailed key visual',
      cyberpunk: 'futuristic neon metropolis, rain-slicked reflective surfaces, glowing cyan and magenta illumination, high-tech dystopian atmosphere, volumetric fog, octane render 8k',
    };

    const toneDetails = tonesMap[tone] || tonesMap.cinematic;
    const cleanPrompt = prompt.trim();
    const fallbackEnhanced = `${cleanPrompt}, stunning hyper-detailed composition, ${toneDetails}`;

    return NextResponse.json({
      success: true,
      enhancedPrompt: fallbackEnhanced,
      source: 'heuristic',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error al mejorar el prompt.' },
      { status: 500 }
    );
  }
}
