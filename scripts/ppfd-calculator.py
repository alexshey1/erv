import ipywidgets as widgets
from IPython.display import display, clear_output
import math

# --- BASE DE DADOS EXTRAÍDA DAS SUAS FONTES ---

# Dicionário com dados de cada fase de cultivo
# Usando a média do PPFD para os cálculos, mas exibindo a faixa para o usuário.
fases_data = {
    "Mudas / Clones": {
        "ppfd_min": 200,
        "ppfd_max": 400,
        "fotoperiodo_sugerido": 18
    },
    "Vegetativo": {
        "ppfd_min": 400,
        "ppfd_max": 600,
        "fotoperiodo_sugerido": 18
    },
    "Floração": {
        "ppfd_min": 600,
        "ppfd_max": 1000,
        "fotoperiodo_sugerido": 12
    }
}

# Dicionário com a eficiência (Eficácia de Fótons Fotossintéticos) em µmol/J
# Baseado nos valores: HPS (~1.7), LEDs modernos (~2.8)
eficiencia_data = {
    "LED de Alta Eficiência (Quantum Board/Bar)": 2.7,
    "LED Padrão / COB / Painel Comum": 1.9,
    "Lâmpada HPS (Sódio de Alta Pressão)": 1.7
}

# Tabela de altura recomendada (cm) baseada na potência (W) e na fase
# Estruturada para que possamos encontrar a potência e depois a altura
altura_por_potencia_data = {
    # Potência (W): {Fase: (Altura Min, Altura Max)}
    100: {"Mudas / Clones": (40, 60), "Vegetativo": (20, 40), "Floração": (20, 30)},
    200: {"Mudas / Clones": (50, 70), "Vegetativo": (30, 50), "Floração": (25, 40)},
    400: {"Mudas / Clones": (70, 90), "Vegetativo": (50, 70), "Floração": (35, 55)},
    600: {"Mudas / Clones": (95, 105), "Vegetativo": (75, 95), "Floração": (45, 75)},
    800: {"Mudas / Clones": (105, 120), "Vegetativo": (80, 105), "Floração": (50, 85)},
    1000: {"Mudas / Clones": (115, 130), "Vegetativo": (90, 115), "Floração": (55, 90)}
}


# --- INTERFACE DA CALCULADORA ---

# Estilo para os widgets
style = {'description_width': 'initial'}

# Inputs do Usuário
largura_widget = widgets.FloatText(value=1.0, description='Largura da Tenda (m):', style=style)
profundidade_widget = widgets.FloatText(value=1.0, description='Profundidade da Tenda (m):', style=style)
fase_widget = widgets.Dropdown(options=list(fases_data.keys()), value='Vegetativo', description='Fase de Cultivo:', style=style)
tipo_luz_widget = widgets.Dropdown(options=list(eficiencia_data.keys()), value='LED de Alta Eficiência (Quantum Board/Bar)', description='Tipo de Iluminação:', style=style)
fotoperiodo_widget = widgets.IntSlider(value=18, min=1, max=24, step=1, description='Horas de Luz por Dia:', style=style, continuous_update=False)

# Botão e Output
botao_calcular = widgets.Button(description="Calcular Iluminação Ideal", button_style='success')
out = widgets.Output()

# --- LÓGICA E FUNÇÕES ---

def on_fase_change(change):
    """Atualiza o fotoperíodo sugerido quando a fase muda."""
    fase_selecionada = change['new']
    fotoperiodo_sugerido = fases_data[fase_selecionada]['fotoperiodo_sugerido']
    fotoperiodo_widget.value = fotoperiodo_sugerido

# Observa a mudança na fase para atualizar o fotoperíodo
fase_widget.observe(on_fase_change, names='value')

def calcular_iluminacao(b):
    """Função principal que realiza os cálculos e exibe os resultados."""
    with out:
        clear_output(wait=True)

        # Coleta de dados da interface
        largura = largura_widget.value
        profundidade = profundidade_widget.value
        fase = fase_widget.value
        tipo_luz = tipo_luz_widget.value
        fotoperiodo = fotoperiodo_widget.value

        # Validação de entrada
        if largura <= 0 or profundidade <= 0:
            print("❌ Erro: A largura e a profundidade devem ser maiores que zero.")
            return

        # --- CÁLCULOS PRINCIPAIS ---
        area_m2 = largura * profundidade

        # Pega os dados da fase selecionada
        dados_fase = fases_data[fase]
        ppfd_min = dados_fase['ppfd_min']
        ppfd_max = dados_fase['ppfd_max']
        ppfd_medio_alvo = (ppfd_min + ppfd_max) / 2

        # Pega a eficiência do tipo de luz
        eficiencia = eficiencia_data[tipo_luz]

        # 1. PPF (Fluxo de Fótons Fotossintéticos) Total Necessário
        # PPF (µmol/s) = PPFD Médio (µmol/s/m²) * Área (m²)
        ppf_total_necessario = ppfd_medio_alvo * area_m2

        # 2. Potência Elétrica Estimada (Watts Reais)
        # Potência (W) = PPF Total (µmol/s) / Eficiência (µmol/J)
        # 1 Joule (J) = 1 Watt-segundo (W*s), então µmol/J é a métrica correta.
        potencia_watts = ppf_total_necessario / eficiencia

        # 3. DLI (Integral de Luz Diária)
        # DLI (mol/m²/dia) = (PPFD * horas_de_luz * 3600 segundos/hora) / 1,000,000 µmol/mol
        dli = (ppfd_medio_alvo * fotoperiodo * 3600) / 1_000_000

        # 4. Determinar a Altura Recomendada
        potencias_disponiveis = sorted(altura_por_potencia_data.keys())
        potencia_adequada = 0
        for p in potencias_disponiveis:
            if p >= potencia_watts:
                potencia_adequada = p
                break

        altura_str = "Não encontrado na tabela (potência muito alta ou baixa)."
        if potencia_adequada > 0:
            alturas = altura_por_potencia_data[potencia_adequada][fase]
            altura_str = f"{alturas[0]} a {alturas[1]} cm do topo das plantas"
        elif potencia_watts > max(potencias_disponiveis):
             altura_str = f"Acima de {max(potencias_disponiveis)}W. Considere usar múltiplas luminárias."


        # --- EXIBIÇÃO DOS RESULTADOS ---
        print("💡 === RESULTADO DA ANÁLISE DE ILUMINAÇÃO === 💡\n")
        print(f"✔️ Área de Cultivo: {area_m2:.2f} m² ({largura}m x {profundidade}m)")
        print(f"🌿 Fase de Cultivo Selecionada: {fase}")
        print("-" * 50)

        print("🎯 PARÂMETROS ALVO:")
        print(f"  - PPFD Alvo: {ppfd_min}-{ppfd_max} µmol/m²/s (usando {ppfd_medio_alvo:.0f} como média para o cálculo)")
        print(f"  - DLI Estimado: {dli:.2f} mol/m²/dia (dose diária de luz)")
        print(f"  - PPF Total Necessário: {ppf_total_necessario:.0f} µmol/s (fluxo total de luz que a(s) lâmpada(s) deve(m) emitir)")

        print("\n⚡ RECOMENDAÇÃO DE EQUIPAMENTO:")
        print(f"  - Eficiência do Sistema: {eficiencia:.2f} µmol/J (para '{tipo_luz}')")
        print(f"  - 🔌 Potência Real Estimada: {potencia_watts:.0f} Watts")

        print("\n📏 RECOMENDAÇÃO DE ALTURA:")
        print(f"  - Para uma luminária de ~{potencia_adequada if potencia_adequada > 0 else int(math.ceil(potencia_watts/100.0))*100}W, a altura ideal é:")
        print(f"  - 👉 {altura_str}")

        print("\n" + "="*50)
        print("⚠️ AVISO IMPORTANTE:")
        print("  - Este é um cálculo de referência. A qualidade da luminária, a refletividade da tenda e a genética da planta influenciam no resultado real.")
        print("  - Sempre observe suas plantas! Sinais como folhas amareladas, queimadas ou estiolamento (esticamento) indicam que a altura da luz precisa ser ajustada.")

# Liga a função ao botão
botao_calcular.on_click(calcular_iluminacao)

# Organiza os widgets na tela
inputs = widgets.VBox([largura_widget, profundidade_widget, fase_widget, tipo_luz_widget, fotoperiodo_widget])
app = widgets.VBox([inputs, botao_calcular, out])

# Exibe a aplicação
display(app) 