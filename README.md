# 🌌 Bleumaia - AI Content Studio

Bleumaia es una plataforma de creación de contenido con inteligencia artificial que integra modelos y APIs gratuitas de todo el mundo (Occidente y Oriente), permitiendo generar imágenes en múltiples estilos artísticos y videos cinemáticos.

![Bleumaia Preview](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80)

## ✨ Características Principales

* ⚡ **Acceso Instantáneo sin API Key (Nivel 0):** Genera imágenes y videos de inmediato a través de **Pollinations.ai** (FLUX.1, Realism, Anime, 3D).
* 🌏 **Catálogo Global de Modelos (Oriente & Occidente):**
  * **SiliconFlow (硅基流动):** Alibaba Wan 2.1 Video, CogVideoX, FLUX.1-schnell y DeepSeek.
  * **Hugging Face Inference:** Capa serverless comunitaria para FLUX y Stable Diffusion.
  * **Cloudflare Workers AI:** 10,000 neuronas diarias gratuitas.
  * **Google Gemini AI Studio:** Asistente y director de prompts con 60 RPM gratuitos.
  * **Zhipu AI & Alibaba DashScope:** Modelos CogView, CogVideo y Wanx.
* 🎨 **Estudio de Imágenes Multi-Estilo:**
  * Hiperrealismo 8K, Anime Makoto Shinkai/Ghibli, Cyberpunk Neón, 3D Pixar, Fantasía Oscura, Cine Retro 35mm, Arte Surrealista, Vectorial y más.
  * Aspect Ratios flexibles: `1:1`, `16:9`, `9:16`, `4:3`, `21:9`.
  * Control de semillas (seed), prompt negativo y resolución.
* 🎬 **Estudio de Video:**
  * Generación Text-to-Video e Image-to-Video (anima cualquier imagen generada).
  * Movimientos de cámara cinemáticos: Zoom, Paneo, Órbita, Dron y Slow-Motion.
* 🔐 **Bóveda Segura de Claves (API Key Vault):**
  * Almacenamiento 100% privado en el navegador del usuario (`localStorage`).
  * Enlaces directos en 1 clic para obtener cada API key gratuita.
* 🪄 **Prompt Director:**
  * Transforma ideas simples en español a prompts cinemáticos profesionales en inglés optimizados para modelos de difusión.
* 🖼️ **Galería Multimedia:**
  * Historial local, lightbox de pantalla completa, descarga en alta resolución y reutilización de parámetros.

---

## 🚀 Despliegue en Vercel

Despliega este proyecto en Vercel con un solo clic importando el repositorio:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FMyoozinc%2Fbleumaia)

---

## 🛠️ Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.
