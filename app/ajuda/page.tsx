import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, AlertTriangle, FileText, HelpCircle, Mail, Phone, Clock } from "lucide-react";

export default function AjudaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-10">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-green-200/80 bg-white/90">
          <CardHeader className="flex flex-col items-center gap-2 pb-2">
            <HelpCircle className="h-10 w-10 text-green-500 mb-1" />
            <h1 className="text-3xl font-bold text-gray-900 text-center">Central de Ajuda</h1>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 mt-2">Atualizado em 24 de julho de 2025</Badge>
            <p className="text-muted-foreground text-center mt-2">Precisa de suporte? Encontre respostas rápidas e tire suas dúvidas sobre o ErvApp.</p>
          </CardHeader>
          <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-orange-700 mt-1" />
            <div>
              <span className="font-bold text-lg text-orange-800 flex items-center gap-2 mb-1">Aviso Legal</span>
              <p className="text-orange-800">O ErvApp é uma plataforma educacional e de gestão agrícola. Não nos responsabilizamos pelo uso inadequado. Consulte sempre profissionais para decisões importantes.</p>
            </div>
          </div>
          <CardContent className="space-y-8 pt-2">
            {/* Guia Rápido */}
            <section>
              <h2 className="font-semibold text-lg text-green-700 mb-1 flex items-center gap-2"><FileText className="h-5 w-5 text-green-600" />Guia Rápido</h2>
              <p className="text-gray-700 mb-2">Veja como começar a usar o ErvApp em poucos passos:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Primeiros Passos</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Crie sua conta gratuitamente</li>
                    <li>• Complete seu perfil e configure preferências</li>
                    <li>• Cadastre seu primeiro cultivo</li>
                    <li>• Explore o dashboard e funcionalidades</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Funcionalidades em Destaque</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Monitoramento em tempo real</li>
                    <li>• Alertas Inteligentes</li>
                    <li>• Histórico e relatórios</li>
                    <li>• Compartilhamento e exportação de dados</li>
                  </ul>
                </div>
              </div>
            </section>
            <Separator />
            {/* FAQ */}
            <section>
              <h2 className="font-semibold text-lg text-green-700 mb-1 flex items-center gap-2"><HelpCircle className="h-5 w-5 text-green-600" />Perguntas Frequentes</h2>
              <p className="text-gray-700 mb-2">Dúvidas comuns sobre o uso do ErvApp</p>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Como faço login e acesso minha conta?</AccordionTrigger>
                  <AccordionContent>
                    Clique em "Login" no topo da página, insira seu e-mail e senha cadastrados. Se esqueceu a senha, use a opção "Esqueci minha senha" para redefinir.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Como cadastrar um novo cultivo?</AccordionTrigger>
                  <AccordionContent>
                    No menu lateral, acesse "Histórico" ou "Dashboard" e clique em "Novo Cultivo". Preencha as informações solicitadas e salve. Você pode editar ou excluir cultivos a qualquer momento.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>O que são Alertas Inteligentes?</AccordionTrigger>
                  <AccordionContent>
                    São notificações automáticas baseadas em IA que avisam sobre possíveis problemas, anomalias ou oportunidades de melhoria no seu cultivo. Eles ajudam a agir rápido e evitar prejuízos.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>Como funciona a exportação de dados?</AccordionTrigger>
                  <AccordionContent>
                    Usuários dos planos Basic, Premium e Enterprise podem exportar relatórios e históricos em PDF ou CSV. Acesse a seção "Relatórios" e clique em "Exportar".
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>Meus dados estão seguros?</AccordionTrigger>
                  <AccordionContent>
                    Sim! O ErvApp utiliza criptografia, backups automáticos e segue as melhores práticas de segurança para proteger suas informações.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>Como entro em contato com o suporte?</AccordionTrigger>
                  <AccordionContent>
                    Você pode enviar um e-mail para <a href="mailto:contato@ervapp.com" className="text-green-700 underline">contato@ervapp.com</a> ou falar pelo WhatsApp: <a href="https://wa.me/5511999999999" className="text-green-700 underline">(11) 99999-9999</a>. Nosso time responde em até 1 dia útil.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7">
                  <AccordionTrigger>O ErvApp é legal? Posso usar para qualquer tipo de cultivo?</AccordionTrigger>
                  <AccordionContent>
                    O ErvApp é uma ferramenta educacional e de gestão agrícola. O uso para fins ilícitos é proibido. Sempre siga as leis locais e consulte profissionais.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
            <Separator />
            {/* Contato/Suporte */}
            <section>
              <h2 className="font-semibold text-lg text-green-700 mb-1 flex items-center gap-2"><Shield className="h-5 w-5 text-blue-600" />Suporte e Contato</h2>
              <p className="text-gray-700 mb-2">Precisa de mais ajuda? Fale com nosso time:</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Canais de Atendimento</h4>
                  <div className="space-y-2 text-sm">
                    <p><Mail className="inline w-4 h-4 mr-1 text-green-600" /> Email: <a href="mailto:contato@ervapp.com" className="text-green-700 underline">contato@ervapp.com</a></p>
                    <p><Phone className="inline w-4 h-4 mr-1 text-green-600" /> WhatsApp: <a href="https://wa.me/5511999999999" className="text-green-700 underline">(11) 99999-9999</a></p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Horário de Atendimento</h4>
                  <div className="space-y-2 text-sm">
                    <p><Clock className="inline w-4 h-4 mr-1 text-green-600" /> Segunda a Sexta: 9h às 18h</p>
                    <p><Clock className="inline w-4 h-4 mr-1 text-green-600" /> Sábado: 9h às 12h</p>
                    <p><Clock className="inline w-4 h-4 mr-1 text-green-600" /> Domingo: Fechado</p>
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
  );
} 