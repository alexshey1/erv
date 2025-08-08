import { PageContainer } from "@/components/layout/page-container"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText } from "lucide-react"
import { AlertTriangle } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50 py-10">
      <PageContainer>
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-green-200/80 bg-white/90">
            <CardHeader className="flex flex-col items-center gap-2 pb-2">
              <FileText className="h-10 w-10 text-green-500 mb-1" />
              <h1 className="text-3xl font-bold text-gray-900 text-center">Termos de Uso (Versão Revisada e Unificada)</h1>
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
                <h2 className="font-semibold text-lg text-green-700 mb-1">1. Introdução e Aceitação dos Termos</h2>
                <p className="text-gray-700 mb-2">
                  Bem-vindo! Estes Termos de Uso ("Termos") regem o seu acesso e uso do nosso aplicativo e de todos os serviços relacionados (coletivamente, o "Aplicativo").
                </p>
                <p className="text-gray-700 mb-2">
                  Ao acessar, baixar ou usar o Aplicativo, você concorda em cumprir e estar legalmente vinculado a estes Termos e à nossa <a href="/privacy" className="text-green-700 underline">Política de Privacidade</a>. Este documento constitui um acordo legal vinculativo entre você ("Usuário") e [Nome da Empresa ou do Aplicativo aqui] ("nós", "nosso").
                </p>
                <p className="text-gray-700">
                  Se você não concordar com a totalidade destes Termos, está proibido de usar ou acessar o Aplicativo.
                </p>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">2. Descrição e Propósito do Aplicativo</h2>
                <p className="text-gray-700 mb-2">Nosso Aplicativo é uma ferramenta educacional e de gestão agrícola projetada para auxiliar em:</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Gestão e monitoramento de cultivos agrícolas legais.</li>
                  <li>Análise de dados de sensores e parâmetros ambientais.</li>
                  <li>Otimização de processos de cultivo com sugestões geradas por Inteligência Artificial (IA).</li>
                  <li>Educação e pesquisa no setor agrícola.</li>
                </ul>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">3. Contas de Usuário</h2>
                <p className="text-gray-700 mb-2">Para acessar certas funcionalidades do Aplicativo, você pode ser solicitado a criar uma conta. Você concorda em:</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Fornecer informações verdadeiras, precisas e completas durante o registro.</li>
                  <li>Manter a confidencialidade de sua senha e credenciais de acesso.</li>
                  <li>Assumir total responsabilidade por todas as atividades que ocorram em sua conta.</li>
                </ul>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">4. Licença de Uso do Aplicativo</h2>
                <p className="text-gray-700 mb-2">Concedemos a você uma licença limitada, não exclusiva, intransferível e revogável para baixar e usar o Aplicativo para fins pessoais e não comerciais, estritamente de acordo com estes Termos. Esta é a concessão de uma licença, não uma transferência de título. Sob esta licença, você não pode:</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Modificar, copiar, adaptar ou criar trabalhos derivados do Aplicativo.</li>
                  <li>Usar o Aplicativo para qualquer finalidade comercial ou para exibição pública.</li>
                  <li>Tentar descompilar, fazer engenharia reversa ou de outra forma tentar obter o código-fonte do Aplicativo.</li>
                  <li>Remover quaisquer avisos de direitos autorais, marca registrada ou outras notações de propriedade.</li>
                  <li>Alugar, arrendar, vender, redistribuir ou sublicenciar o Aplicativo.</li>
                  <li>Transferir os materiais para outra pessoa ou 'espelhar' os materiais em qualquer outro servidor.</li>
                </ul>
                <p className="text-gray-700 mt-2">Esta licença será automaticamente rescindida se você violar qualquer uma dessas restrições.</p>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">5. Conduta e Uso Proibido</h2>
                <p className="text-gray-700 mb-2">Você se compromete a fazer uso adequado dos conteúdos e da informação que o Aplicativo oferece. É estritamente proibido usar o Aplicativo para:</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Qualquer atividade ilegal, não autorizada ou que viole leis locais, estaduais ou federais.</li>
                  <li>O cultivo de plantas ou substâncias proibidas pela legislação aplicável.</li>
                  <li>Violar direitos de terceiros, incluindo propriedade intelectual, privacidade ou direitos de publicidade.</li>
                  <li>Transmitir vírus, malware ou qualquer conteúdo de natureza maliciosa.</li>
                  <li>Envolver-se em atividades de natureza racista, xenofóbica, pornográfica, de apologia ao terrorismo ou que atentem contra os direitos humanos.</li>
                </ul>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">6. Responsabilidade do Usuário e Conformidade Legal</h2>
                <p className="text-gray-700 mb-2">Você é o único e exclusivo responsável por suas ações ao usar o Aplicativo. Suas obrigações incluem:</p>
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Verificar e cumprir rigorosamente todas as leis e regulamentos aplicáveis às suas atividades de cultivo.</li>
                  <li>Obter todas as licenças e autorizações necessárias para suas operações.</li>
                  <li>Não usar o Aplicativo para fins fraudulentos, enganosos ou ilegais.</li>
                  <li>Reportar à nossa equipe qualquer uso inadequado ou ilegal da plataforma que você venha a testemunhar.</li>
                </ul>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">7. Isenção de Garantias e Limitação de Responsabilidade</h2>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2">
                  <p className="font-semibold text-red-800 mb-2">DISCLAIMER IMPORTANTE: O Aplicativo e seus materiais são fornecidos "como estão".</p>
                  <ul className="list-disc ml-6 space-y-1 text-red-700">
                    <li>Nós não oferecemos garantias, expressas ou implícitas, e por este meio isentamos e negamos todas as outras garantias, incluindo, sem limitação, garantias de comercialização, adequação a um fim específico ou não violação de propriedade intelectual.</li>
                    <li>As recomendações da IA são sugestões educacionais e não substituem a consultoria de um agrônomo ou outro profissional qualificado. Não garantimos a precisão absoluta, os resultados prováveis ou a confiabilidade dos dados ou análises fornecidas.</li>
                    <li>Em nenhuma circunstância nós ou nossos fornecedores seremos responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados, lucros cessantes ou interrupção de negócios) decorrentes do uso ou da incapacidade de usar o Aplicativo.</li>
                    <li>O usuário é 100% responsável por verificar a conformidade legal de suas atividades. Nós não nos responsabilizamos pelo uso incorreto, inadequado ou ilegal da ferramenta. O uso do Aplicativo é por sua conta e risco.</li>
                  </ul>
                </div>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">8. Propriedade Intelectual</h2>
                <p className="text-gray-700 mb-2">Os materiais contidos neste Aplicativo, incluindo software, texto, gráficos, logotipos e marcas, são de nossa propriedade exclusiva ou de nossos licenciadores e são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.</p>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">9. Links para Sites e Serviços de Terceiros</h2>
                <p className="text-gray-700 mb-2">O Aplicativo pode conter links para sites ou serviços de terceiros que não são operados por nós. Não analisamos e não somos responsáveis pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica nosso endosso. O uso de qualquer site vinculado é por conta e risco do usuário.</p>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">10. Rescisão</h2>
                <p className="text-gray-700 mb-2">Podemos rescindir ou suspender seu acesso ao Aplicativo imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar estes Termos. Ao encerrar o seu acesso, seu direito de usar o Aplicativo cessará imediatamente.</p>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">11. Modificações dos Termos</h2>
                <p className="text-gray-700 mb-2">Reservamo-nos o direito de modificar estes Termos a qualquer momento. Mudanças significativas serão comunicadas através do Aplicativo, por e-mail ou outro meio de contato que você tenha fornecido. O uso continuado do Aplicativo após tais modificações constitui sua aceitação dos novos Termos.</p>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">12. Lei Aplicável e Jurisdição</h2>
                <p className="text-gray-700 mb-2">Estes Termos e condições são regidos e interpretados de acordo com as leis do [Sua Cidade/Estado], [Seu País], e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquela localidade para a resolução de quaisquer disputas.</p>
              </section>
              <Separator />
              <section>
                <h2 className="font-semibold text-lg text-green-700 mb-1">13. Contato</h2>
                <p className="text-gray-700 mb-2">Para dúvidas sobre estes Termos de Uso, entre em contato conosco através da seção de suporte no Aplicativo ou pelo e-mail: [Seu E-mail de Suporte aqui].</p>
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