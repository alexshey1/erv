import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Leaf, Shield, AlertTriangle, FileText } from "lucide-react"

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50 py-10">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-green-200/80 bg-white/90">
          <CardHeader className="flex flex-col items-center gap-2 pb-2">
            <FileText className="h-10 w-10 text-green-500 mb-1" />
            <h1 className="text-3xl font-bold text-gray-900 text-center">Central de Ajuda</h1>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 mt-2">Atualizado em 20 de julho de 2025</Badge>
            <p className="text-muted-foreground text-center mt-2">Encontre respostas para suas dúvidas sobre o ErvApp</p>
          </CardHeader>
          <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-700 mt-1" />
            <div>
              <span className="font-bold text-lg text-orange-800 flex items-center gap-2 mb-1">Aviso Legal</span>
              <p className="text-orange-800">O ErvApp é uma ferramenta educacional desenvolvida para fins de aprendizado e pesquisa. Não nos responsabilizamos pelo uso inadequado da plataforma.<br/>Sempre consulte profissionais qualificados para decisões relacionadas ao cultivo agrícola.</p>
            </div>
          </div>
          <CardContent className="space-y-8 pt-2">
            {/* Guia Rápido */}
            <section>
              <h2 className="font-semibold text-lg text-green-700 mb-1 flex items-center gap-2"><Leaf className="h-5 w-5 text-green-600" />Guia Rápido</h2>
              <p className="text-gray-700 mb-2">Comece aqui se você é novo no ErvApp</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Primeiros Passos</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Crie sua conta gratuita</li>
                    <li>• Configure seu primeiro cultivo</li>
                    <li>• Explore o dashboard</li>
                    <li>• Registre eventos importantes</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Funcionalidades Principais</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Dashboard inteligente</li>
                    <li>• Histórico de cultivos</li>
                    <li>• Análise de anomalias</li>
                    <li>• Relatórios detalhados</li>
                  </ul>
                </div>
              </div>
            </section>
            <Separator />
            {/* FAQ */}
            <section>
              <h2 className="font-semibold text-lg text-green-700 mb-1 flex items-center gap-2"><FileText className="h-5 w-5 text-green-600" />Perguntas Frequentes</h2>
              <p className="text-gray-700 mb-2">Respostas para as dúvidas mais comuns</p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Como criar meu primeiro cultivo?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>Para criar seu primeiro cultivo:</p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Acesse a seção "Histórico" no menu lateral</li>
                        <li>Clique no botão "Novo Cultivo"</li>
                        <li>Preencha as informações básicas (nome, variedade, data)</li>
                        <li>Salve o cultivo</li>
                        <li>Comece a registrar eventos importantes</li>
                      </ol>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Como funciona a análise de anomalias?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>O sistema de análise de anomalias utiliza IA para:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Detectar padrões incomuns nos dados</li>
                        <li>Identificar possíveis problemas de saúde das plantas</li>
                        <li>Sugerir correções e melhorias</li>
                        <li>Alertar sobre condições subótimas</li>
                      </ul>
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3 inline" />
                        Esta é uma ferramenta educacional. Sempre consulte profissionais para decisões importantes.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>Posso exportar meus dados?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>Atualmente, o ErvApp oferece:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Visualização de dados em tempo real</li>
                        <li>Relatórios detalhados</li>
                        <li>Histórico completo de cultivos</li>
                      </ul>
                      <p className="text-xs text-muted-foreground">
                        Funcionalidades de exportação estão em desenvolvimento.
                      </p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Como funciona o sistema de permissões?</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <p>O ErvApp possui diferentes níveis de acesso:</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">Free</Badge>
                          <span className="text-sm">Acesso básico ao dashboard e histórico</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Basic</Badge>
                          <span className="text-sm">Analytics e relatórios avançados</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">Premium</Badge>
                          <span className="text-sm">Análise de anomalias e recursos avançados</span>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
            <Separator />
            {/* Contato */}
            <section>
              <h2 className="font-semibold text-lg text-green-700 mb-1 flex items-center gap-2"><Shield className="h-5 w-5 text-blue-600" />Suporte e Contato</h2>
              <p className="text-gray-700 mb-2">Entre em contato conosco se precisar de ajuda adicional</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Informações de Contato</h4>
                  <div className="space-y-2 text-sm">
                    <p>📧 Email: contato@ervapp.com</p>
                    <p>📱 WhatsApp: +55 (11) 99999-9999</p>
                    <p>🌐 Website: www.ervapp.com</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Horário de Atendimento</h4>
                  <div className="space-y-2 text-sm">
                    <p>Segunda a Sexta: 9h às 18h</p>
                    <p>Sábado: 9h às 12h</p>
                    <p>Domingo: Fechado</p>
                  </div>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ErvApp. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
} 