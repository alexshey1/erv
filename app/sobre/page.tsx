import Image from "next/image";

const origem = `O ErvApp nasceu da experiência pessoal de um engenheiro agrônomo e cultivador apaixonado. Ao perceber que as ferramentas digitais disponíveis eram limitadas, pouco inteligentes e, em sua maioria, em inglês, ele decidiu criar uma solução feita sob medida para a comunidade brasileira. Unindo sua paixão pelo cultivo, conhecimento técnico e tecnologia, surgiu o ErvApp: um diário de cultivo inteligente, pensado para ser parceiro do cultivador em cada etapa.`;

const missao = `Empoderar o cultivador brasileiro com uma ferramenta poderosa, intuitiva e em seu próprio idioma, utilizando tecnologia e conhecimento agronômico para que cada colheita seja um sucesso.`;
const visao = `Ser líderes em inovação, transformando dados de cultivo em resultados de excelência para nossos usuários através de inteligência artificial.`;

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-green-700 mb-4 tracking-tight">Sobre Nós</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">Tecnologia, paixão e ciência para transformar o cultivo brasileiro.</p>
        </div>
        <section className="mb-12">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-green-300 p-8 flex flex-col gap-4 items-center text-center mb-8 transition-all duration-300 hover:shadow-green-200 hover:-translate-y-1">
            <h2 className="text-2xl font-bold text-green-700 mb-2 text-center">Como surgiu?</h2>
            <p className="text-gray-800 text-lg leading-relaxed">{origem}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border-2 border-green-300 p-8 flex flex-col gap-4 items-center text-center mb-8 transition-all duration-300 hover:shadow-green-200 hover:-translate-y-1">
            <h2 className="text-2xl font-bold text-green-700 mb-2 text-center">Nossa Missão</h2>
            <p className="text-gray-800 text-lg leading-relaxed">{missao}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl border-2 border-green-300 p-8 flex flex-col gap-4 items-center text-center transition-all duration-300 hover:shadow-green-200 hover:-translate-y-1">
            <h2 className="text-2xl font-bold text-green-700 mb-2 text-center">Nossa Visão</h2>
            <p className="text-gray-800 text-lg leading-relaxed">{visao}</p>
          </div>
        </section>
        <section className="mb-12">
          <div className="bg-white/90 rounded-2xl shadow-lg border border-green-100 p-8 flex flex-col items-center transition-transform duration-300 hover:scale-105 cursor-pointer">
            <h2 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-2">
              <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" /></svg>
              Fundador
            </h2>
            <div className="relative mb-4">
              <Image
                src="/founder.png"
                alt="Alexandre Hey"
                width={140}
                height={140}
                className="rounded-full border-4 border-green-400 shadow-lg object-cover bg-green-50"
              />
            </div>
            <span className="font-bold text-green-700 text-xl">Alexandre Hey</span>
            <span className="text-gray-500 text-base mb-2">Engenheiro Agrônomo & Fundador</span>
            <p className="text-gray-700 text-center max-w-md">Apaixonado por cultivo, Alexandre uniu ciência, tecnologia e experiência prática para criar o ErvApp e ajudar cultivadores a irem além do básico.</p>
          </div>
        </section>
      </div>
    </main>
  );
} 