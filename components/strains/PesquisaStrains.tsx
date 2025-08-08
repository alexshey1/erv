"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Strain {
  Strain: string;
  Type: string;
  Flavor: string;
  Description?: string;
  [key: string]: any;
}

interface PesquisaStrainsProps {
  principais: Strain[];
  outras: Strain[];
}

const TIPOS = ["Sativa", "Índica", "Híbrida"];

function normalize(str: string) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[-_]/g, " ") // Substitui hífens e underscores por espaço
    .replace(/[^a-zA-Z0-9 ]/g, "") // Remove outros caracteres especiais
    .toLowerCase()
    .trim();
}

function filtrarStrains(strains: Strain[], termo: string, tipo: string, sabor: string): Strain[] {
  console.log('filtrarStrains', { total: strains.length, termo, tipo, sabor });
  if (strains.length > 0) {
    console.log('Primeiros nomes normalizados:', strains.slice(0, 10).map(s => normalize(s["Strain"])));
  }
  return strains.filter((s: Strain) => {
    const termoNormalizado = normalize(termo);
    const nomeNormalizado = normalize(s["Strain"]);
    const palavras = termoNormalizado.split(" ").filter(Boolean);
    const nomeMatch = !termo || palavras.every(t => nomeNormalizado.includes(t));
    if (termo && nomeNormalizado.includes("jack")) {
      console.log({ termoNormalizado, nomeNormalizado, nomeMatch, original: s["Strain"] });
    }
    const tipoMatch = !tipo || traduzirTipo(s["Type"]).toLowerCase() === tipo.toLowerCase();
    const saboresTraduzidos = (s["Flavor"] || "").split(",").map(f => (SABOR_TRADUCAO[f.trim()] || f.trim()));
    const saborMatch = !sabor || saboresTraduzidos.includes(sabor);
    return nomeMatch && tipoMatch && saborMatch;
  });
}

// Mapeamento de tradução de sabores/aromas
const SABOR_TRADUCAO: Record<string, string> = {
  "Sweet": "Doce",
  "Earthy": "Terroso",
  "Pungent": "Picante",
  "Berry": "Frutado",
  "Pine": "Pinho",
  "Lemon": "Limão",
  "Citrus": "Cítrico",
  "Orange": "Laranja",
  "Woody": "Amadeirado",
  "Flowery": "Floral",
  "Grape": "Uva",
  "Pepper": "Pimenta",
  "Skunk": "Skunk",
  "Diesel": "Diesel",
  "Spicy/Herbal": "Especiarias/Ervas",
  "Apricot": "Damasco",
  "Violet": "Violeta",
  "Cheese": "Queijo",
  "Menthol": "Mentolado",
  "Coffee": "Café",
  "Chocolate": "Chocolate",
  "Tropical": "Tropical",
  "Nutty": "Noz",
  "Apple": "Maçã",
  "Blueberry": "Mirtilo",
  "Banana": "Banana",
  "Mango": "Manga",
  "Strawberry": "Morango",
  "Vanilla": "Baunilha",
  "Pineapple": "Abacaxi",
  "Mint": "Hortelã",
  "Herbal": "Herbal",
  "Sage": "Sálvia",
  "Lavender": "Lavanda",
  "Cherry": "Cereja",
  "Tangerine": "Tangerina",
  "Melon": "Melão",
  "Pear": "Pera",
  "Plum": "Ameixa",
  "Rose": "Rosa",
  "Licorice": "Alcaçuz",
  "Butter": "Manteiga",
  "Grapefruit": "Toranja",
  "Lime": "Limão-taiti",
  "Pinecone": "Pinha",
  "Ammonia": "Amônia",
  "Tobacco": "Tabaco",
  "Tar": "Alcatrão",
  "Blue": "Azul",
  "Other": "Outro"
};

function traduzirSabor(sabor: string): string {
  if (!sabor) return '';
  return sabor.split(',').map(s => SABOR_TRADUCAO[s.trim()] || s.trim()).join(', ');
}

export default function PesquisaStrains({ principais, outras }: PesquisaStrainsProps) {
  const [termo, setTermo] = useState("");
  const [tipo, setTipo] = useState("");
  const [sabor, setSabor] = useState("");
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [selectedStrain, setSelectedStrain] = useState<Strain | null>(null);
  const [translated, setTranslated] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);

  // Carregar favoritos do localStorage ao montar
  useEffect(() => {
    const favs = localStorage.getItem("strains_favoritas");
    if (favs) {
      try {
        setFavoritos(JSON.parse(favs));
      } catch (e) {
        setFavoritos([]);
      }
    }
  }, []);

  // Salvar favoritos no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem("strains_favoritas", JSON.stringify(favoritos));
  }, [favoritos]);

  function toggleFavorito(strain: string) {
    setFavoritos(favs =>
      favs.includes(strain)
        ? favs.filter(s => s !== strain)
        : [...favs, strain]
    );
  }

  async function traduzirDescricao(desc: string) {
    setTranslating(true);
    setTranslated(null);
    let errorMsg = '';
    try {
      // Tenta o endpoint principal
      let res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: desc,
          source: "auto",
          target: "pt"
        })
      });
      let data = await res.json();
      if (res.ok && (data.translatedText || (Array.isArray(data) && data[0]?.translatedText))) {
        setTranslated(Array.isArray(data) ? data[0].translatedText : data.translatedText);
        setTranslating(false);
        return;
      } else {
        errorMsg = data?.error || res.statusText || 'Erro desconhecido';
      }
      // Fallback: tenta outro endpoint
      res = await fetch("https://libretranslate.de/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: desc,
          source: "auto",
          target: "pt",
          format: "text"
        })
      });
      data = await res.json();
      if (res.ok && data.translatedText) {
        setTranslated(data.translatedText);
      } else {
        setTranslated("Erro ao traduzir: " + (data?.error || res.statusText || errorMsg));
      }
    } catch (e: any) {
      setTranslated("Erro ao traduzir: " + (e?.message || errorMsg || 'Erro desconhecido.'));
    } finally {
      setTranslating(false);
    }
  }

  // Garantir que Jack-Herer e Ak-47 estejam sempre presentes nos principais exibidos
  let principaisExibidas = principais.slice(0, 20);
  const extras = [
    principais.find(s => s["Strain"] === "Jack-Herer"),
    principais.find(s => s["Strain"] === "Ak-47")
  ].filter((s): s is Strain => Boolean(s)); // Remove undefined, garante tipo
  // Adiciona no início se não estiverem já presentes
  principaisExibidas = [
    ...extras.filter(e => !principaisExibidas.some(s => s["Strain"] === e["Strain"])),
    ...principaisExibidas
  ];
  // Garante pelo menos 12 cards
  if (principaisExibidas.length < 12) {
    principaisExibidas = [...principaisExibidas, ...outras.slice(0, 12 - principaisExibidas.length)];
  }

  const resultados = termo || tipo || sabor
    ? filtrarStrains([...principais, ...outras], termo, tipo, sabor)
    : principaisExibidas;

  // Listar sabores únicos para filtro (traduzidos, ordenados, sem duplicatas)
  const saboresUnicos = Array.from(new Set(
    [...principais, ...outras]
      .flatMap(s => (s["Flavor"] || "").split(",").map(f => traduzirSabor(f.trim())))
      .filter(Boolean)
  )).sort((a, b) => a.localeCompare(b));

  // Ordenar favoritos no topo
  const listaFinal = [
    ...resultados.filter(s => favoritos.includes(s.Strain)),
    ...resultados.filter(s => !favoritos.includes(s.Strain)),
  ];

  return (
    <div className="w-full">
      <Dialog open={!!selectedStrain} onOpenChange={open => { if (!open) { setSelectedStrain(null); setTranslated(null); } }}>
        <DialogContent className="max-w-lg">
          {selectedStrain && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-green-800 font-bold">{selectedStrain.Strain}</DialogTitle>
              </DialogHeader>
              <div className="mt-2 flex flex-col gap-2">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow ${getTipoColor(selectedStrain["Type"])}`}>{traduzirTipo(selectedStrain["Type"])}</span>
                </div>
                <div className="text-sm text-gray-700"><b>Sabor/Aroma:</b> {traduzirSabor(selectedStrain["Flavor"])}</div>
                {selectedStrain.Description && (
                  <div className="text-gray-800 text-base mt-2">
                    <b>Descrição:</b> {selectedStrain.Description}
                    <button
                      className="ml-3 px-3 py-1 rounded bg-green-600 text-white text-xs font-semibold shadow hover:bg-green-700 transition-all"
                      onClick={() => traduzirDescricao(selectedStrain.Description!)}
                      disabled={translating}
                    >
                      {translating ? 'Traduzindo...' : 'Traduzir'}
                    </button>
                    {translated && (
                      <div className="mt-2 p-2 bg-green-50 border-l-4 border-green-400 rounded text-green-900 text-sm">
                        <b>Tradução:</b> {translated}
                      </div>
                    )}
                  </div>
                )}
                {/* Exibir todos os campos extras */}
                <div className="mt-2 grid grid-cols-1 gap-1">
                  {Object.entries(selectedStrain).map(([key, value]) => (
                    ["Strain", "Type", "Flavor", "Description"].includes(key) ? null : (
                      <div key={key} className="text-xs text-gray-500"><b>{key}:</b> {String(value)}</div>
                    )
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <div className="max-w-6xl mx-auto w-full">
        {/* Filtros avançados (desktop) */}
        <div className="mb-6 w-full hidden md:flex items-center gap-4">
          {/* Esquerda: Tags */}
          <div className="flex gap-2 flex-wrap min-w-[180px] justify-start">
            {TIPOS.map(t => (
              <button
                key={t}
                className={`px-3 py-1 rounded-full border text-sm font-semibold transition-all duration-150 ${tipo === t ? 'bg-green-600 text-white border-green-700 shadow-lg' : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}`}
                onClick={() => setTipo(tipo === t ? "" : t)}
                type="button"
              >
                {t}
              </button>
            ))}
          </div>
          {/* Centro: Busca */}
          <div className="flex-1 flex justify-center">
            <input
              type="text"
              placeholder="Pesquisar por nome... (+2300 strains)"
              value={termo}
              onChange={e => setTermo(e.target.value)}
              className="w-full max-w-md px-5 py-3 border border-green-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900 placeholder-gray-500 bg-white text-base"
            />
          </div>
          {/* Direita: Filtro */}
          <div className="flex justify-end min-w-[220px]">
            <select
              value={sabor}
              onChange={e => setSabor(e.target.value)}
              className="w-80 px-5 py-3 border border-green-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900 bg-white text-base"
            >
              <option value="">Filtrar por sabor/aroma</option>
              {saboresUnicos.map((s, idx) => (
                <option key={idx} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        {/* Mobile: filtros empilhados */}
        <div className="mb-6 w-full flex flex-col gap-3 md:hidden">
          <div className="flex gap-2 flex-wrap justify-start">
            {TIPOS.map(t => (
              <button
                key={t}
                className={`px-3 py-1 rounded-full border text-sm font-semibold transition-all duration-150 ${tipo === t ? 'bg-green-600 text-white border-green-700 shadow-lg' : 'bg-white text-green-700 border-green-300 hover:bg-green-50'}`}
                onClick={() => setTipo(tipo === t ? "" : t)}
                type="button"
              >
                {t}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Pesquisar por nome... (+2300 strains)"
            value={termo}
            onChange={e => setTermo(e.target.value)}
            className="w-full px-5 py-3 border border-green-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900 placeholder-gray-500 bg-white text-base"
          />
          <select
            value={sabor}
            onChange={e => setSabor(e.target.value)}
            className="w-full px-5 py-3 border border-green-300 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-900 bg-white text-base"
          >
            <option value="">Filtrar por sabor/aroma</option>
            {saboresUnicos.map((s, idx) => (
              <option key={idx} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {/* Grid de cards centralizado */}
        <div className="w-full flex justify-center">
          <div className="grid gap-6 w-full"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              display: 'grid',
              alignItems: 'stretch',
              justifyItems: 'center',
              maxWidth: '100%'
            }}
          >
            {listaFinal.length === 0 && (
              <div className="col-span-full text-center text-gray-500 py-12 text-lg">Nenhuma genética encontrada.</div>
            )}
            {listaFinal.map((strain: Strain, idx: number) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-green-100 w-full max-w-md px-8 py-3 h-56 flex flex-col gap-1 shadow-lg hover:shadow-2xl hover:scale-[1.03] transition-all duration-200 group cursor-pointer relative overflow-hidden justify-between"
                onClick={() => setSelectedStrain(strain)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow ${getTipoColor(strain["Type"])}`}>{traduzirTipo(strain["Type"])}</span>
                  <button
                    aria-label={favoritos.includes(strain.Strain) ? 'Desfavoritar' : 'Favoritar'}
                    onClick={e => { e.stopPropagation(); toggleFavorito(strain.Strain); }}
                    className="ml-auto text-xl focus:outline-none"
                  >
                    {favoritos.includes(strain.Strain)
                      ? <span className="text-yellow-400">★</span>
                      : <span className="text-gray-300 hover:text-yellow-400">☆</span>
                    }
                  </button>
                </div>
                <div className="font-bold text-lg text-green-800 mb-1 truncate" title={strain["Strain"]}>{strain["Strain"]}</div>
                <div className="text-sm text-gray-600">Sabor/Aroma: <span className="text-gray-800">{traduzirSabor(strain["Flavor"])}</span></div>
                <div className="text-xs text-gray-400 mt-1 truncate">{(strain["Description"] ?? '').slice(0, 90)}{(strain["Description"] ?? '').length > 90 ? '...' : ''}</div>
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-20 transition-all duration-200 bg-green-200 rounded-2xl blur-lg z-0" />
              </div>
            ))}
         </div>
        </div>
      </div>
    </div>
  );
}

function traduzirTipo(tipo: string): string {
  if (!tipo) return '';
  const t = tipo.toLowerCase();
  if (t.includes('indica')) return 'Índica';
  if (t.includes('sativa')) return 'Sativa';
  if (t.includes('hybrid')) return 'Híbrida';
  return tipo;
}

function getTipoColor(tipo: string): string {
  if (!tipo) return 'bg-gray-200 text-gray-700';
  const t = tipo.toLowerCase();
  if (t.includes('indica')) return 'bg-purple-100 text-purple-700';
  if (t.includes('sativa')) return 'bg-yellow-100 text-yellow-700';
  if (t.includes('hybrid')) return 'bg-green-100 text-green-700';
  return 'bg-gray-200 text-gray-700';
} 