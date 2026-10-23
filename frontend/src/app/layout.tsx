import type { Metadata } from 'next';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import './globals.css';

export const metadata: Metadata = {
  title: 'Docker Tienda',
  description: 'Frontend Next.js de la clase de Docker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-4">
            <Link href="/products" className="text-lg font-bold text-blue-700">
              🐳 Docker Tienda
            </Link>
            <Link href="/products" className="text-slate-600 hover:text-slate-900">
              Productos
            </Link>
            <Link href="/categories" className="text-slate-600 hover:text-slate-900">
              Categorías
            </Link>
          </nav>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>

        {/* Muestra a qué backend se conecta: útil para la clase */}
        <footer className="mx-auto max-w-5xl px-4 pb-8 text-xs text-slate-500">
          Next.js :3001 → NestJS <code>{API_URL}</code> → PostgreSQL
        </footer>
      </body>
    </html>
  );
}
