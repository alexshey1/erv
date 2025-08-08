# 🌱 ErvApp

**ErvApp** é uma plataforma completa para monitoramento e análise de cultivos indoor de cannabis. O objetivo do aplicativo é oferecer aos cultivadores uma solução intuitiva e baseada em dados para gerenciar ciclos de cultivo, tomar decisões mais informadas e maximizar a eficiência e qualidade do processo.

---

## 🚀 Funcionalidades

- 📘 **Diário de Cultivo**: Registre eventos diários como irrigação, fertilização, poda e observações.
- 📊 **Dashboard Interativo**: Acompanhe o crescimento por planta ou por genética, com gráficos personalizáveis.
- 🌡️ **Monitoramento Ambiental**: Registre manualmente ou integre sensores para temperatura, umidade, fotoperíodo e pH.
- 💰 **Controle Financeiro**: Registre investimentos, gastos e calcule o custo por grama ou por ciclo.
- 📋 **Relatórios PDF**: Exporte resumos dos ciclos com dados técnicos, gráficos e observações.
- 🔔 **Alertas Inteligentes**: Receba recomendações ou avisos com base em desvios dos parâmetros ideais.
- 🧬 **Análise Comparativa**: Compare o desempenho entre os ciclos.
---

## 🖥️ Capturas de Tela *(opcional)*

> Adicione imagens ilustrativas aqui, como prints do dashboard, formulários de entrada ou relatórios PDF.

---

## 🛠️ Tecnologias Utilizadas

| Camada          | Tecnologias                                                             |
|------------------|------------------------------------------------------------------------|
| Frontend         | React.js, Tailwind CSS, shadcn/ui, Framer Motion                       |
| Backend          | Netlify Functions (serverless), Node.js                                |
| Banco de Dados   | PostgreSQL com [Neon](https://neon.tech)                               |
| Autenticação     | Supabase Auth                                                          |
| Deploy           | Netlify com CI/CD a partir do GitHub                                   |
| Versionamento    | Git + GitHub                                                           |

---

## 📦 Instalação Local

Siga os passos abaixo para executar o projeto localmente:

1. **Clone o repositório:**

👤 Autor
Alexandre S Hey

⚠️ Aviso Legal
Este projeto possui finalidade exclusivamente educacional.
Ele não promove, incentiva ou facilita qualquer atividade ilegal relacionada ao cultivo, uso ou comércio de cannabis.
Todas as funcionalidades e exemplos são pensados para contextos onde o cultivo de cannabis é regulamentado por leis locais, como para fins medicinais, científicos ou industriais.
O uso deste software deve obedecer à legislação da jurisdição do usuário.


⭐ Contribuições
Contribuições são bem-vindas!
Sinta-se à vontade para abrir uma issue, sugerir melhorias ou enviar pull requests.

# Configurando o JWT_SECRET

1. Gere um segredo forte:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
   ```
2. Adicione ao arquivo `.env`:
   ```env
   JWT_SECRET=seu_segredo_gerado
   ```
3. Certifique-se de que `.env` está listado no `.gitignore`.
4. Em produção (ex.: Vercel, Netlify, etc), configure a variável no painel de ambiente do serviço de deploy.

---

# 2