'use client'

import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-6">
          <div className="bg-white border border-green-100 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-green-700 mb-2">Ops! Erro inesperado</h1>
            <p className="text-gray-600 mb-4">{error?.message || 'Tente novamente em instantes.'}</p>
            <div className="flex gap-2 justify-center">
              <button onClick={reset} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Recarregar</button>
              <Link href="/" className="px-4 py-2 rounded-lg border border-green-200 text-green-700 hover:bg-green-50">Home</Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
} 