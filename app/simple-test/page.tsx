export default function SimpleTestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          ✅ Teste Simples
        </h1>
        <p className="text-gray-700 text-lg">
          Se você consegue ver esta página, o Next.js está funcionando!
        </p>
        <div className="mt-8 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="font-semibold">Status: Funcionando</p>
          <p className="text-sm">Tempo de carregamento: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  )
} 