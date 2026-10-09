import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, tone = 'cinematic', geminiKey = '', siliconKey = '' } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Se requiere un prompt para mejorar.' }, { status: 400 });
    }

    const systemInstruction = `You are an expert AI prompt engineer for image & video models (FLUX.1, Midjourney, Wan 2.1).
Translate the user prompt (if in Spanish or other language) to English and expand it into an extraordinary, vivid, photorealistic or artistic master prompt.
Tone: ${tone}. Include cinematic lighting, camera lens details, textures and atmosphere.
OUTPUT ONLY the enhanced prompt. No commentary, no quotes.`;

    const activeGeminiKey = geminiKey.trim() || process.env.GEMINI_API_KEY || '';
    const activeSiliconKey = siliconKey.trim() || process.env.SILICONFLOW_API_KEY || '';

    // 1. If Gemini key provided
    if (activeGeminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeGeminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nPrompt: "${prompt}"` }] }],
            }),
          }
        );
        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) return NextResponse.json({ success: true, enhancedPrompt: text, source: 'gemini' });
        }
      } catch (err) {
        console.warn('Gemini failed, fallback...');
      }
    }

    // 2. If SiliconFlow key provided
    if (activeSiliconKey) {
      try {
        const sfRes = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeSiliconKey}` },
          body: JSON.stringify({
            model: 'deepseek-ai/DeepSeek-V3',
            messages: [{ role: 'system', content: systemInstruction }, { role: 'user', content: prompt }],
          }),
        });
        if (sfRes.ok) {
          const sfData = await sfRes.json();
          const text = sfData?.choices?.[0]?.message?.content?.trim();
          if (text) return NextResponse.json({ success: true, enhancedPrompt: text, source: 'deepseek' });
        }
      } catch (err) {
        console.warn('DeepSeek failed, fallback...');
      }
    }

    // 3. Auto-Integrated Free LLM endpoint (Text Pollinations - 100% Free, No key)
    try {
      const autoRes = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
          model: 'mistral',
        }),
      });

      if (autoRes.ok) {
        const text = (await autoRes.text()).trim();
        if (text && text.length > 10 && !text.includes('error')) {
          return NextResponse.json({ success: true, enhancedPrompt: text, source: 'auto-llm' });
        }
      }
    } catch (err) {
      console.warn('Auto LLM fetch failed, using smart heuristics...', err);
    }

    // 4. Heuristic Fallback
    const tonesMap: Record<string, string> = {
      cinematic: 'cinematic still, dramatic atmospheric lighting, 35mm film grain, 8k resolution, photorealistic, intricate textures, shallow depth of field, anamorphic lens flares, masterwork',
      fantasy: 'epic dark fantasy concept art, ethereal magical atmosphere, volumetric mist, ornate baroque details, moody lighting, masterpiece, trending on ArtStation',
      anime: 'Makoto Shinkai and Studio Ghibli inspired visual, radiant golden clouds, pristine vivid color grading, intricate hand-drawn anime aesthetic, ultra-detailed key visual',
      cyberpunk: 'futuristic neon metropolis, rain-slicked reflective surfaces, glowing cyan and magenta illumination, high-tech dystopian atmosphere, volumetric fog, octane render 8k',
    };
    const toneDetails = tonesMap[tone] || tonesMap.cinematic;
    const fallback = `${prompt.trim()}, stunning hyper-detailed composition, ${toneDetails}`;

    return NextResponse.json({ success: true, enhancedPrompt: fallback, source: 'heuristic' });

  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Error al mejorar el prompt.' }, { status: 500 });
  }
}
