import React from "react"

export default function TermsContent() {
  return (
    <div className="max-w-2xl w-full mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4 text-left">Termos de Uso</h1>
      <p className="text-base text-muted-foreground mb-2 text-left">
        Este aplicativo tem fins exclusivamente informativos e educacionais.<br/>
        Ele serve apenas como uma ferramenta de registro de dados, simulação técnica e organização pessoal relacionados ao cultivo de plantas.
      </p>
      <p className="text-base text-muted-foreground mb-2 text-left">
        Não promovemos, incentivamos ou nos responsabilizamos por qualquer atividade ilegal.<br/>
        O uso do aplicativo é de responsabilidade exclusiva do usuário, que deve respeitar as leis locais vigentes.
      </p>
      <p className="text-base text-muted-foreground mt-4 font-semibold text-left">
        Ao continuar, você declara estar ciente e de acordo com estes termos.
      </p>
    </div>
  )
} 