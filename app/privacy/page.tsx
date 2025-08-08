import { PageContainer } from "@/components/layout/page-container"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShieldCheck } from "lucide-react"
import { AlertTriangle } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50 py-10">
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-green-200/80 bg-white/90">
            <CardHeader className="flex flex-col items-center gap-2 pb-2">
              <ShieldCheck className="h-10 w-10 text-green-500 mb-1" />
              <h1 className="text-3xl font-bold text-gray-900 text-center">Política de Privacidade</h1>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 mt-2">Última atualização: 20 de julho de 2025</Badge>
            </CardHeader>
            <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-700 mt-1" />
              <div>
                <span className="font-bold text-lg text-orange-800 flex items-center gap-2 mb-1">Aviso Legal</span>
                <p className="text-orange-800">O ErvApp é uma ferramenta educacional desenvolvida para fins de aprendizado e pesquisa. Não nos responsabilizamos pelo uso inadequado da plataforma.<br/>Sempre consulte profissionais qualificados para decisões relacionadas ao cultivo agrícola.</p>
              </div>
            </div>
            <CardContent className="space-y-8 pt-2">
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">1. Nosso Compromisso com a Privacidade</h2>
                <p className="text-gray-700 mb-2">
                  A sua privacidade é importante para nós. É política do nosso aplicativo respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar em nossos serviços.
                </p>
                <p className="text-gray-700 mb-2">
                  Esta política descreve como coletamos, usamos, protegemos e compartilhamos suas informações pessoais. Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço, fazendo-o por meios justos e legais, com o seu conhecimento e consentimento.
                </p>
                <p className="text-gray-700">
                  O uso continuado de nosso aplicativo será considerado como aceitação de nossas práticas em torno de privacidade e informações pessoais.
                </p>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">2. Informações que Coletamos</h2>
                <p className="text-gray-700 mb-2">Coletamos diferentes tipos de informações para operar e melhorar nossos serviços:</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li><strong>Dados de Conta:</strong> Nome e endereço de e-mail. Informações de perfil que você decide fornecer. Histórico de login e informações do dispositivo para segurança.</li>
                  <li><strong>Dados de Cultivo:</strong> Informações e configurações dos seus cultivos. Dados de sensores (temperatura, umidade, etc.). Eventos, registros de atividades e anotações.</li>
                </ul>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">3. Como Usamos Suas Informações</h2>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Fornecer, operar e melhorar nossos serviços.</li>
                  <li>Personalizar sua experiência de usuário.</li>
                  <li>Gerar análises e insights anônimos com o auxílio de Inteligência Artificial (IA) para oferecer recomendações.</li>
                  <li>Enviar notificações importantes sobre sua conta ou serviços.</li>
                  <li>Garantir a segurança da plataforma e prevenir atividades fraudulentas.</li>
                </ul>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">4. Compartilhamento e Divulgação de Dados</h2>
                <p className="text-gray-700 mb-2">Não vendemos, alugamos ou compartilhamos suas informações de identificação pessoal publicamente ou com terceiros, exceto nas seguintes situações:</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li><strong>Com seu consentimento explícito:</strong> Quando você nos autoriza a compartilhar suas informações.</li>
                  <li><strong>Para cumprimento legal:</strong> Quando exigido por lei, intimação ou outro processo legal.</li>
                  <li><strong>Com prestadores de serviços:</strong> Compartilhamos informações com parceiros essenciais que nos auxiliam a operar o serviço, como provedores de infraestrutura e a API de Inteligência Artificial (Google Gemini AI). Esses parceiros são contratualmente obrigados a proteger seus dados e a usá-los apenas para os fins para os quais foram contratados.</li>
                  <li><strong>Para proteger nossos direitos:</strong> Para proteger a segurança e os direitos do nosso aplicativo, de nossos usuários e do público.</li>
                </ul>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">5. Segurança dos Dados</h2>
                <p className="text-gray-700 mb-2">Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso, divulgação, alteração e destruição não autorizados. Nossas medidas incluem:</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Criptografia de dados: Seus dados são criptografados tanto em trânsito (usando TLS/SSL) quanto em repouso.</li>
                  <li>Controle de acesso rigoroso: O acesso às suas informações pessoais é restrito a funcionários e prestadores de serviços que precisam delas para operar.</li>
                  <li>Monitoramento contínuo: Nossos sistemas são monitorados continuamente para detectar vulnerabilidades e ataques.</li>
                  <li>Backups regulares e seguros: Realizamos backups periódicos dos dados para prevenir perdas.</li>
                </ul>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">6. Seus Direitos sobre Seus Dados</h2>
                <p className="text-gray-700 mb-2">Você tem total controle sobre suas informações pessoais. De acordo com a lei, você tem o direito de:</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Acessar suas informações pessoais que mantemos.</li>
                  <li>Corrigir dados que estejam imprecisos ou incompletos.</li>
                  <li>Solicitar a exclusão de sua conta e de todos os dados associados.</li>
                  <li>Revogar consentimentos que você nos deu anteriormente.</li>
                  <li>Exportar seus dados em um formato legível por máquina.</li>
                </ul>
                <p className="text-gray-700 mt-2">Para exercer qualquer um desses direitos, entre em contato conosco através dos canais listados na seção "Contato".</p>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">7. Retenção e Exclusão de Dados</h2>
                <p className="text-gray-700 mb-2">Reteremos suas informações apenas pelo tempo necessário para fornecer os serviços solicitados e para cumprir nossas obrigações legais.</p>
                <p className="text-gray-700">Oferecemos um caminho claro e acessível para que você possa solicitar a exclusão da sua conta e dos dados associados diretamente pelo aplicativo ou através do nosso e-mail de contato. Após a solicitação, os dados serão removidos de nossos sistemas de produção de acordo com nossos procedimentos internos.</p>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">8. Cookies, Publicidade e Tecnologias Similares</h2>
                <p className="text-gray-700 mb-2">Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do nosso aplicativo e personalizar conteúdo.</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li><strong>Cookies Essenciais:</strong> Necessários para o funcionamento do serviço.</li>
                  <li><strong>Cookies de Publicidade:</strong> [MANTER APENAS SE APLICÁVEL] O serviço Google AdSense que usamos pode usar um cookie DoubleClick para veicular anúncios mais relevantes. Os cookies de publicidade comportamental rastreiam anonimamente seus interesses para apresentar anúncios que possam ser do seu interesse.</li>
                  <li><strong>Cookies de Afiliados:</strong> [MANTER APENAS SE APLICÁVEL] Cookies de rastreamento de afiliados nos permitem ver se nossos clientes acessaram o site através de um de nossos parceiros, para que possamos creditá-los adequadamente.</li>
                </ul>
                <p className="text-gray-700 mt-2">Você pode controlar o uso de cookies através das configurações do seu navegador ou dispositivo.</p>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">9. Links para Sites Externos</h2>
                <p className="text-gray-700">Nosso aplicativo pode conter links para sites externos que não são operados por nós. Esteja ciente de que não temos controle sobre o conteúdo e práticas desses sites e não podemos aceitar responsabilidade por suas respectivas políticas de privacidade.</p>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">10. Alterações a Esta Política de Privacidade</h2>
                <p className="text-gray-700">Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos você sobre quaisquer alterações, publicando a nova política nesta página e/ou através de um aviso no aplicativo. Recomendamos que você revise esta política periodicamente para quaisquer alterações.</p>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">11. Contato</h2>
                <p className="text-gray-700 mb-2">Se você tiver alguma dúvida sobre esta política ou sobre como lidamos com seus dados, ou para exercer seus direitos, entre em contato conosco:</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li><strong>E-mail:</strong> [Inserir seu e-mail de contato aqui]</li>
                  <li><strong>Através do Aplicativo:</strong> Pela seção de ajuda ou contato.</li>
                </ul>
              </section>
            </CardContent>
          </Card>
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ErvApp. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </PageContainer>
    </div>
  )
} 