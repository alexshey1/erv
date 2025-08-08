import { Droplet, Leaf, Eye } from 'lucide-react'
import Link from 'next/link'
import { LazyImage } from '@/components/ui/lazy-image'
import { HoverScale, FadeIn } from '@/components/ui/micro-interactions'

interface CardPlantaProps {
  imagem?: string;
  cepa?: string;
  nome?: string;
  idade?: number;
  fase?: string;
  progresso?: number;
  id?: string | null;
  onRegar?: () => void;
  onFertilizar?: () => void;
  onObservar?: () => void;
}

export default function CardPlanta({
  imagem = '/placeholder.jpg',
  cepa = 'Northern Lights',
  nome = 'Planta 01',
  idade = 42,
  fase = 'Floração (Semana 2)',
  progresso = 60, // 0-100
  id = null,
  onRegar = () => {},
  onFertilizar = () => {},
  onObservar = () => {},
}: CardPlantaProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col items-center w-full max-w-xs transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 hover:z-10 hover:shadow-green-200/50 hover:border-green-300 group relative overflow-hidden">
      {/* Efeito de neon verde sutil */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-green-400/5 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="absolute inset-0 rounded-xl ring-1 ring-green-300/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      {/* Efeito de pulso sutil */}
      <div className="absolute inset-0 rounded-xl ring-2 ring-green-400/20 opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300 pointer-events-none" />
      {imagem ? (
        <div className="relative">
          <img src={imagem} alt={nome} className="w-24 h-24 object-cover rounded-lg mb-2 border-2 border-green-500 group-hover:border-green-400 group-hover:shadow-green-200/50 transition-all duration-300" loading="lazy" />
          {/* Brilho sutil na imagem */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-green-400/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      ) : (
        <div className="w-24 h-24 flex items-center justify-center rounded-lg mb-2 border-2 border-green-200 bg-gray-100 text-gray-400 group-hover:border-green-300 group-hover:shadow-green-200/50 transition-all duration-300">
          Sem foto
        </div>
      )}
      <div className="w-full text-center">
        <div className="text-green-600 font-bold text-sm">{cepa}</div>
        {id ? (
          <Link href={`/history/${id}`} className="text-green-700 font-semibold text-lg underline hover:text-green-900 transition-colors block">
            {nome}
          </Link>
        ) : (
          <div className="text-gray-900 font-semibold text-lg">{nome}</div>
        )}
        <div className="text-xs text-gray-500 mt-1 mb-2">
          <span className="font-bold text-green-500">Dia {idade}</span> - <span className="font-bold text-yellow-500">{fase === 'active' ? 'ativo' : fase}</span>
        </div>
        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-3 group-hover:bg-gray-100 transition-colors duration-300">
          <div
            className="bg-gradient-to-r from-green-400 to-emerald-600 h-3 rounded-full transition-all duration-300 group-hover:shadow-sm group-hover:shadow-green-200/50"
            style={{ width: `${progresso}%` }}
          />
        </div>
        {/* Removidos os botões de ação rápida para dar mais espaço à imagem */}
      </div>
    </div>
  )
}