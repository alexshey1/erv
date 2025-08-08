import ipywidgets as widgets
from IPython.display import display, clear_output
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
import numpy as np
import pandas as pd
from dataclasses import dataclass, asdict
from typing import Dict, Any
from datetime import date, timedelta

# --- PASSO 1: ESTRUTURA DE DADOS MODULAR (COM DATACLASSES) ---
# Usar dataclasses torna a passagem de parâmetros mais limpa e organizada.

@dataclass
class SetupInvestimento:
    """Parâmetros do setup e custos de investimento inicial."""
    area_m2: float = 2.25
    custo_equip_iluminacao: float = 2000.0
    custo_tenda_estrutura: float = 1500.0
    custo_ventilacao_exaustao: float = 800.0
    custo_outros_equipamentos: float = 500.0

@dataclass
class ParametrosCiclo:
    """Parâmetros que definem um ciclo de cultivo."""
    potencia_watts: int = 240
    num_plantas: int = 6
    producao_por_planta_g: int = 50
    dias_vegetativo: int = 50
    horas_luz_veg: int = 16
    dias_floracao: int = 90
    horas_luz_flor: int = 12
    dias_secagem_cura: int = 15

@dataclass
class CustosMercado:
    """Custos operacionais por ciclo e condições de mercado."""
    preco_kwh: float = 0.95
    custo_sementes_clones: float = 500.0
    custo_substrato: float = 420.0
    custo_nutrientes: float = 350.0
    custos_operacionais_misc: float = 100.0
    preco_venda_por_grama: float = 45.0

# --- PASSO 2: O NOVO "MOTOR" DE SIMULAÇÃO ---

class SimuladorCultivoCompleto:
    def __init__(self, setup: SetupInvestimento, ciclo: ParametrosCiclo, mercado: CustosMercado):
        self.setup = setup
        self.ciclo = ciclo
        self.mercado = mercado
    
    def simular(self) -> Dict[str, Any]:
        # --- Custos de Investimento ---
        custo_total_investimento = sum(asdict(self.setup).values()) - self.setup.area_m2
        
        # --- Custos Operacionais por Ciclo ---
        consumo_kwh_veg = (self.ciclo.potencia_watts / 1000) * self.ciclo.horas_luz_veg * self.ciclo.dias_vegetativo
        consumo_kwh_flor = (self.ciclo.potencia_watts / 1000) * self.ciclo.horas_luz_flor * self.ciclo.dias_floracao
        custo_energia = (consumo_kwh_veg + consumo_kwh_flor) * self.mercado.preco_kwh
        
        custos_operacionais_dict = {
            'Energia Elétrica': custo_energia,
            'Sementes/Clones': self.mercado.custo_sementes_clones,
            'Substrato': self.mercado.custo_substrato,
            'Nutrientes': self.mercado.custo_nutrientes,
            'Outros Custos (Ciclo)': self.mercado.custos_operacionais_misc
        }
        custo_operacional_total_ciclo = sum(custos_operacionais_dict.values())
        
        # --- Produção e Receita por Ciclo ---
        producao_total_g = self.ciclo.num_plantas * self.ciclo.producao_por_planta_g
        receita_bruta_ciclo = producao_total_g * self.mercado.preco_venda_por_grama
        lucro_liquido_ciclo = receita_bruta_ciclo - custo_operacional_total_ciclo
        
        # --- Métricas de Eficiência e Negócio ---
        custo_por_grama = custo_operacional_total_ciclo / producao_total_g if producao_total_g > 0 else 0
        gramas_por_watt = producao_total_g / self.ciclo.potencia_watts if self.ciclo.potencia_watts > 0 else 0
        gramas_por_m2 = producao_total_g / self.setup.area_m2 if self.setup.area_m2 > 0 else 0
        
        # --- Análise de Payback e ROI ---
        periodo_payback_ciclos = custo_total_investimento / lucro_liquido_ciclo if lucro_liquido_ciclo > 0 else float('inf')
        roi_investimento_1_ano = ((lucro_liquido_ciclo * (365 / self.get_duracao_total_ciclo())) - custo_total_investimento) / custo_total_investimento * 100 if custo_total_investimento > 0 else float('inf')
        
        return {
            # Resultados Financeiros
            'Custo Total Investimento (R$)': custo_total_investimento,
            'Custo Operacional p/ Ciclo (R$)': custo_operacional_total_ciclo,
            'Receita Bruta p/ Ciclo (R$)': receita_bruta_ciclo,
            'Lucro Líquido p/ Ciclo (R$)': lucro_liquido_ciclo,
            # Métricas de Eficiência
            'Custo por Grama (R$/g)': custo_por_grama,
            'Gramas por Watt (g/W)': gramas_por_watt,
            'Gramas por m² (g/m²)': gramas_por_m2,
            # Métricas de Negócio
            'Período de Payback (ciclos)': periodo_payback_ciclos,
            'ROI sobre Investimento (1º Ano %)': roi_investimento_1_ano,
            # Dicionários para gráficos
            'detalhe_custos_operacionais': custos_operacionais_dict,
            'detalhe_custos_investimento': {k.replace('custo_', '').replace('_', ' ').title(): v for k, v in asdict(self.setup).items() if 'custo' in k},
        }
    
    def get_duracao_total_ciclo(self) -> int:
        return self.ciclo.dias_vegetativo + self.ciclo.dias_floracao + self.ciclo.dias_secagem_cura

# --- PASSO 3: CRIAÇÃO DOS WIDGETS ORGANIZADOS POR ABAS ---

style = {'description_width': 'initial'}
layout = widgets.Layout(width='95%')

# Aba 1: Setup e Investimento
w_setup = {
    'area_m2': widgets.FloatSlider(value=1.44, min=0.36, max=10, step=0.1, description='Área de Cultivo (m²):', style=style, layout=layout),
    'custo_equip_iluminacao': widgets.FloatText(value=2000, description='Custo Iluminação (R$):', style=style, layout=layout),
    'custo_tenda_estrutura': widgets.FloatText(value=1500, description='Custo Tenda/Estrutura (R$):', style=style, layout=layout),
    'custo_ventilacao_exaustao': widgets.FloatText(value=800, description='Custo Ventilação (R$):', style=style, layout=layout),
    'custo_outros_equipamentos': widgets.FloatText(value=500, description='Outros Equipamentos (R$):', style=style, layout=layout),
}

# Aba 2: Parâmetros do Ciclo
w_ciclo = {
    'potencia_watts': widgets.IntSlider(value=480, min=50, max=2000, step=10, description='Potência Iluminação (W):', style=style, layout=layout),
    'num_plantas': widgets.IntSlider(value=6, min=1, max=30, step=1, description='Nº de Plantas:', style=style, layout=layout),
    'producao_por_planta_g': widgets.IntSlider(value=80, min=10, max=250, step=5, description='Produção/Planta (g):', style=style, layout=layout),
    'dias_vegetativo': widgets.IntSlider(value=60, min=15, max=120, step=1, description='Dias Vegetativo:', style=style, layout=layout),
    'horas_luz_veg': widgets.IntSlider(value=18, min=12, max=24, step=1, description='Horas Luz (Veg):', style=style, layout=layout),
    'dias_floracao': widgets.IntSlider(value=70, min=45, max=120, step=1, description='Dias Floração:', style=style, layout=layout),
    'horas_luz_flor': widgets.IntSlider(value=12, min=8, max=16, step=1, description='Horas Luz (Flora):', style=style, layout=layout),
    'dias_secagem_cura': widgets.IntSlider(value=20, min=7, max=40, step=1, description='Dias Secagem/Cura:', style=style, layout=layout),
}

# Aba 3: Custos e Mercado
w_mercado = {
    'preco_kwh': widgets.FloatText(value=0.95, description='Preço kWh (R$):', style=style, layout=layout),
    'custo_sementes_clones': widgets.FloatText(value=500, description='Custo Sementes/Clones (R$):', style=style, layout=layout),
    'custo_substrato': widgets.FloatText(value=120, description='Custo Substrato (R$):', style=style, layout=layout),
    'custo_nutrientes': widgets.FloatText(value=350, description='Custo Nutrientes (R$):', style=style, layout=layout),
    'custos_operacionais_misc': widgets.FloatText(value=100, description='Outros Custos/Ciclo (R$):', style=style, layout=layout),
    'preco_venda_por_grama': widgets.FloatSlider(value=45, min=10, max=100, step=1, description='Preço Venda (R$/g):', style=style, layout=layout),
}

# --- PASSO 4: MONTAGEM DA INTERFACE COM ABAS ---

tab_children = [
    widgets.VBox(list(w_setup.values()), layout=widgets.Layout(padding="10px")),
    widgets.VBox(list(w_ciclo.values()), layout=widgets.Layout(padding="10px")),
    widgets.VBox(list(w_mercado.values()), layout=widgets.Layout(padding="10px"))
]

tab_interface = widgets.Tab(children=tab_children)
tab_interface.set_title(0, '1. Setup e Investimento')
tab_interface.set_title(1, '2. Parâmetros do Ciclo')
tab_interface.set_title(2, '3. Custos e Mercado')

output_area = widgets.Output()

# --- PASSO 5: A NOVA FUNÇÃO DE ATUALIZAÇÃO E PLOTAGEM ---

def atualizar_dashboard_completo(**kwargs):
    output_area.clear_output(wait=True)
    
    # Coleta e organiza os parâmetros dos widgets nas dataclasses
    setup_params = SetupInvestimento(**{k: v for k, v in kwargs.items() if k in w_setup})
    ciclo_params = ParametrosCiclo(**{k: v for k, v in kwargs.items() if k in w_ciclo})
    mercado_params = CustosMercado(**{k: v for k, v in kwargs.items() if k in w_mercado})
    
    simulador = SimuladorCultivoCompleto(setup_params, ciclo_params, mercado_params)
    resultados = simulador.simular()
    
    with output_area:
        # Layout de plots 2x2
        fig, ax = plt.subplots(2, 2, figsize=(16, 12))
        fig.suptitle('Análise Completa de Viabilidade do Cultivo Indoor', fontsize=18, weight='bold')
        
        # --- Gráfico 1: KPIs de Negócio ---
        ax[0, 0].text(0.5, 0.85, f"R$ {resultados['Lucro Líquido p/ Ciclo (R$)']:.2f}", fontsize=22, weight='bold', ha='center', color='green')
        ax[0, 0].text(0.5, 0.78, "Lucro Líquido por Ciclo", fontsize=12, ha='center')
        ax[0, 0].text(0.5, 0.55, f"{resultados['Período de Payback (ciclos)']:.1f} ciclos", fontsize=16, ha='center')
        ax[0, 0].text(0.5, 0.48, "Payback do Investimento", fontsize=12, ha='center')
        ax[0, 0].text(0.5, 0.25, f"{resultados['ROI sobre Investimento (1º Ano %)']:.1f} %", fontsize=16, ha='center', color='blue')
        ax[0, 0].text(0.5, 0.18, "ROI Estimado (1º Ano)", fontsize=12, ha='center')
        ax[0, 0].set_title('Principais Métricas de Negócio', fontsize=14)
        ax[0, 0].axis('off')
        
        # --- Gráfico 2: KPIs de Eficiência ---
        ax[0, 1].text(0.5, 0.85, f"{resultados['Gramas por Watt (g/W)']:.2f} g/W", fontsize=18, weight='bold', ha='center')
        ax[0, 1].text(0.5, 0.78, "Eficiência da Iluminação", fontsize=12, ha='center')
        ax[0, 1].text(0.5, 0.55, f"R$ {resultados['Custo por Grama (R$/g)']:.2f} /g", fontsize=18, weight='bold', ha='center', color='red')
        ax[0, 1].text(0.5, 0.48, "Custo de Produção por Grama", fontsize=12, ha='center')
        ax[0, 1].text(0.5, 0.25, f"{resultados['Gramas por m² (g/m²)']:.0f} g/m²", fontsize=18, weight='bold', ha='center')
        ax[0, 1].text(0.5, 0.18, "Produtividade por Área", fontsize=12, ha='center')
        ax[0, 1].set_title('Métricas de Eficiência Operacional', fontsize=14)
        ax[0, 1].axis('off')
        
        # --- Gráfico 3: Linha do Tempo do Ciclo ---
        duracao_total = simulador.get_duracao_total_ciclo()
        fases = {
            'Vegetativo': (0, ciclo_params.dias_vegetativo),
            'Floração': (ciclo_params.dias_vegetativo, ciclo_params.dias_floracao),
            'Secagem/Cura': (ciclo_params.dias_vegetativo + ciclo_params.dias_floracao, ciclo_params.dias_secagem_cura),
        }
        cores_fases = ['#4CAF50', '#FFC107', '#795548']
        ax[1, 0].barh(list(fases.keys()), [d[1] for d in fases.values()], left=[d[0] for d in fases.values()], color=cores_fases)
        ax[1, 0].set_title(f'Linha do Tempo do Ciclo ({duracao_total} dias)', fontsize=14)
        ax[1, 0].set_xlabel('Dias')
        ax[1, 0].grid(axis='x', linestyle=':')
        ax[1, 0].invert_yaxis()
        
        # --- Gráfico 4: Custos (Investimento vs. Operacional) ---
        labels = ['Investimento Inicial', 'Custo por 1 Ciclo']
        valores = [resultados['Custo Total Investimento (R$)'], resultados['Custo Operacional p/ Ciclo (R$)']]
        barras = ax[1, 1].bar(labels, valores, color=['#03A9F4', '#F44336'])
        ax[1, 1].set_title('Estrutura de Custos', fontsize=14)
        ax[1, 1].set_ylabel('Valor (R$)')
        ax[1, 1].bar_label(barras, fmt='R$ %.2f')
        
        plt.tight_layout(rect=[0, 0, 1, 0.96])
        plt.show()

# --- PASSO 6: CONECTAR TUDO E EXIBIR ---

# Junta todos os dicionários de widgets em um só para a conexão
todos_widgets = {**w_setup, **w_ciclo, **w_mercado}

# Conecta a função de atualização aos widgets
out = widgets.interactive_output(atualizar_dashboard_completo, todos_widgets)

# Exibe a interface
display(tab_interface, output_area)

# Chama a função uma vez para carregar o dashboard inicial
atualizar_dashboard_completo(**{k: v.value for k, v in todos_widgets.items()})
