import { useEffect, useState } from "react"
import { Cloud, MapPin, Droplet, Wind, Thermometer, Clock, Sun, CloudRain, CloudLightning } from "lucide-react"

interface WeatherWidgetProps {
  defaultCity?: string
}

const cidades = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Brasília",
  "Curitiba",
  "Porto Alegre",
  "Salvador",
  "Recife",
  "Fortaleza",
  "Manaus",
  "Campinas",
  "Goiânia",
  "Belém",
  "Florianópolis",
  "Vitória"
]

// Função para obter ícone baseado na condição do clima
function getWeatherIcon(condition: string) {
  const conditionLower = condition.toLowerCase()
  
  console.log('🔍 Condição do clima:', conditionLower)
  
  // Fallback baseado na condição
  if (conditionLower.includes('sol') || conditionLower.includes('clear') || conditionLower.includes('sunny')) {
    return <Sun className="w-12 h-12 text-yellow-500" />
  } else if (conditionLower.includes('nublado') || conditionLower.includes('cloudy') || conditionLower.includes('overcast') || conditionLower.includes('parcial')) {
    return <Cloud className="w-12 h-12 text-gray-500" />
  } else if (conditionLower.includes('chuva') || conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
    return <CloudRain className="w-12 h-12 text-blue-500" />
  } else if (conditionLower.includes('tempestade') || conditionLower.includes('storm') || conditionLower.includes('thunder')) {
    return <CloudLightning className="w-12 h-12 text-purple-500" />
  } else {
    return <Cloud className="w-12 h-12 text-gray-400" />
  }
}

export function WeatherWidget({ defaultCity = "São Paulo" }: WeatherWidgetProps) {
  const [city, setCity] = useState(defaultCity)
  const [inputCity, setInputCity] = useState(defaultCity)
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Persistência localStorage
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem("weather_city") : null
    if (saved) {
      setCity(saved)
      setInputCity(saved)
    }
  }, [])
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("weather_city", city)
    }
  }, [city])

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true)
      setError(null)
      try {
        // Agora busca da rota local segura
        const url = `/api/weather?city=${encodeURIComponent(city)}`
        const res = await fetch(url)
        if (!res.ok) throw new Error("Erro ao buscar clima")
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        console.log('🌤️ Dados do clima recebidos:', data)
        setWeather(data)
      } catch (err) {
        setError("Não foi possível obter o clima.")
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [city])

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setInputCity(e.target.value)
    setCity(e.target.value)
  }
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputCity(e.target.value)
  }
  function handleInputBlur() {
    if (inputCity.trim()) setCity(inputCity.trim())
  }
  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && inputCity.trim()) setCity(inputCity.trim())
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col justify-between w-full min-w-[220px] max-w-full min-h-[320px] transition-all duration-200 hover:shadow-xl hover:scale-105 hover:z-10 cursor-pointer">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm">
            <Cloud className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Previsão do Tempo</h3>
            <p className="text-xs text-gray-500">Condições climáticas atuais</p>
          </div>
        </div>
        <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse shadow-lg"></div>
      </div>

      {/* Seleção de Cidade */}
      <div className="flex gap-2 mb-4 w-full">
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={inputCity}
          onChange={handleSelectChange}
        >
          {cidades.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
          <option value={inputCity}>{inputCity}</option>
        </select>
        <input
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          type="text"
          value={inputCity}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder="Digite a cidade"
        />
      </div>
      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">Carregando clima...</div>
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : error || !weather ? (
          <div className="text-center">
            <div className="text-sm text-red-500 mb-2">{error || "Não foi possível obter o clima."}</div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Cloud className="w-6 h-6 text-red-500" />
            </div>
          </div>
        ) : (
          <>
            {/* Temperatura Principal */}
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="p-2 bg-blue-50 rounded-xl">
                {getWeatherIcon(weather.current?.condition?.text ?? "")}
              </div>
              <div className="text-4xl font-bold text-gray-900">{weather.current?.temp_c !== undefined ? Math.round(weather.current.temp_c) : "-"}°C</div>
            </div>
            
            {/* Condição e Localização */}
            <div className="text-center mb-4">
              <div className="text-base capitalize font-semibold text-gray-800 mb-1">{weather.current?.condition?.text ?? ""}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                <MapPin className="w-3 h-3" />
                <span>{weather.location?.country ? (weather.location.country === 'Brazil' ? 'Brasil' : weather.location.country) : ""}</span>
              </div>
            </div>
            
            {/* Detalhes do Clima */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Droplet className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-700">Umidade</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{weather.current?.humidity ?? "-"}%</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-medium text-gray-700">Vento</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{weather.current?.wind_kph ?? "-"} km/h</span>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-orange-600" />
                  <span className="text-xs font-medium text-orange-700">Sensação</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{weather.current?.feelslike_c !== undefined ? Math.round(weather.current.feelslike_c) : "-"}°C</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Timestamp */}
      {weather && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
          <Clock className="w-3 h-3" />
          <span>Atualizado: {weather.current?.last_updated ?? "--"}</span>
        </div>
      )}
    </div>
  )
} 