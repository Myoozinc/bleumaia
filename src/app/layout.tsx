import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bleumaia | AI Content Studio (Imágenes & Videos)',
  description: 'Estudio de creación multimedia con IA que unifica modelos gratuitos globales (Pollinations, SiliconFlow Wan 2.1, Hugging Face, Cloudflare, Gemini).',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
