'use client'

import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="text-6xl mb-6">🌱</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ErvApp
        </h1>
        <p className="text-gray-600 mb-6 max-w-md">
          Você está offline. Algumas funcionalidades podem não estar disponíveis. 
          Conecte-se à internet para acessar todos os recursos.
        </p>
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Tentar Novamente
          </button>
          <div>
            <Link 
              href="/dashboard"
              className="text-green-600 hover:text-green-700 underline"
            >
              Ir para Dashboard (Cache)
            </Link>
          </div>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Funcionalidades disponíveis offline:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Visualizar dados em cache</li>
            <li>Navegar por páginas visitadas</li>
            <li>Acessar configurações básicas</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
