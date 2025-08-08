import matplotlib.pyplot as plt
import numpy as np
from dataclasses import dataclass, asdict
from typing import Dict, Any

# --- ESTRUTURA DE DADOS MODULAR (COM DATACLASSES) ---

@dataclass
class SetupInvestimento:
    """Parâmetros do setup e custos de investimento inicial."""
    area_m2: float = 1.00
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

# --- MOTOR DE SIMULAÇÃO ---

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

# --- EXEMPLO DE USO ---

def exemplo_analise():
    """Exemplo de como usar o simulador com diferentes cenários."""
    
    print("🌱 SIMULADOR DE CULTIVO INDOOR - ANÁLISE DE VIABILIDADE")
    print("=" * 60)
    
    # Cenário padrão
    setup = SetupInvestimento()
    ciclo = ParametrosCiclo()
    mercado = CustosMercado()
    
    simulador = SimuladorCultivoCompleto(setup, ciclo, mercado)
    resultados = simulador.simular()
    
    print("\n📊 RESULTADOS FINANCEIROS:")
    print(f"• Investimento Total: R$ {resultados['Custo Total Investimento (R$)']:.2f}")
    print(f"• Custo Operacional/Ciclo: R$ {resultados['Custo Operacional p/ Ciclo (R$)']:.2f}")
    print(f"• Receita Bruta/Ciclo: R$ {resultados['Receita Bruta p/ Ciclo (R$)']:.2f}")
    print(f"• Lucro Líquido/Ciclo: R$ {resultados['Lucro Líquido p/ Ciclo (R$)']:.2f}")
    
    print("\n⚡ MÉTRICAS DE EFICIÊNCIA:")
    print(f"• Custo por Grama: R$ {resultados['Custo por Grama (R$/g)']:.2f}")
    print(f"• Gramas por Watt: {resultados['Gramas por Watt (g/W)']:.2f} g/W")
    print(f"• Gramas por m²: {resultados['Gramas por m² (g/m²)']:.0f} g/m²")
    
    print("\n💼 MÉTRICAS DE NEGÓCIO:")
    print(f"• Período de Payback: {resultados['Período de Payback (ciclos)']:.1f} ciclos")
    print(f"• ROI (1º Ano): {resultados['ROI sobre Investimento (1º Ano %)']:.1f}%")
    print(f"• Duração do Ciclo: {simulador.get_duracao_total_ciclo()} dias")
    
    # Criar visualizações
    fig, ((ax1, ax2), (ax3, ax4)) = plt.subplots(2, 2, figsize=(15, 10))
    fig.suptitle('Análise Completa de Viabilidade do Cultivo Indoor', fontsize=16, weight='bold')
    
    # Gráfico 1: KPIs de Negócio
    ax1.text(0.5, 0.8, f"R$ {resultados['Lucro Líquido p/ Ciclo (R$)']:.2f}", 
             fontsize=20, weight='bold', ha='center', color='green', transform=ax1.transAxes)
    ax1.text(0.5, 0.7, "Lucro Líquido por Ciclo", fontsize=12, ha='center', transform=ax1.transAxes)
    ax1.text(0.5, 0.5, f"{resultados['Período de Payback (ciclos)']:.1f} ciclos", 
             fontsize=16, ha='center', transform=ax1.transAxes)
    ax1.text(0.5, 0.4, "Payback do Investimento", fontsize=12, ha='center', transform=ax1.transAxes)
    ax1.text(0.5, 0.2, f"{resultados['ROI sobre Investimento (1º Ano %)']:.1f}%", 
             fontsize=16, ha='center', color='blue', transform=ax1.transAxes)
    ax1.text(0.5, 0.1, "ROI Estimado (1º Ano)", fontsize=12, ha='center', transform=ax1.transAxes)
    ax1.set_title('Principais Métricas de Negócio')
    ax1.axis('off')
    
    # Gráfico 2: KPIs de Eficiência
    ax2.text(0.5, 0.8, f"{resultados['Gramas por Watt (g/W)']:.2f} g/W", 
             fontsize=16, weight='bold', ha='center', transform=ax2.transAxes)
    ax2.text(0.5, 0.7, "Eficiência da Iluminação", fontsize=12, ha='center', transform=ax2.transAxes)
    ax2.text(0.5, 0.5, f"R$ {resultados['Custo por Grama (R$/g)']:.2f}/g", 
             fontsize=16, weight='bold', ha='center', color='red', transform=ax2.transAxes)
    ax2.text(0.5, 0.4, "Custo de Produção por Grama", fontsize=12, ha='center', transform=ax2.transAxes)
    ax2.text(0.5, 0.2, f"{resultados['Gramas por m² (g/m²)']:.0f} g/m²", 
             fontsize=16, weight='bold', ha='center', transform=ax2.transAxes)
    ax2.text(0.5, 0.1, "Produtividade por Área", fontsize=12, ha='center', transform=ax2.transAxes)
    ax2.set_title('Métricas de Eficiência Operacional')
    ax2.axis('off')
    
    # Gráfico 3: Custos Operacionais
    custos_op = resultados['detalhe_custos_operacionais']
    ax3.pie(custos_op.values(), labels=custos_op.keys(), autopct='%1.1f%%', startangle=90)
    ax3.set_title('Distribuição dos Custos Operacionais')
    
    # Gráfico 4: Linha do Tempo
    fases = ['Vegetativo', 'Floração', 'Secagem/Cura']
    duracao = [ciclo.dias_vegetativo, ciclo.dias_floracao, ciclo.dias_secagem_cura]
    cores = ['#4CAF50', '#FFC107', '#795548']
    
    ax4.barh(fases, duracao, color=cores)
    ax4.set_title(f'Linha do Tempo do Ciclo ({simulador.get_duracao_total_ciclo()} dias)')
    ax4.set_xlabel('Dias')
    ax4.grid(axis='x', linestyle=':', alpha=0.7)
    ax4.invert_yaxis()
    
    plt.tight_layout()
    plt.show()
    
    print("\n" + "=" * 60)
    print("✅ Análise concluída! Ajuste os parâmetros para diferentes cenários.")

if __name__ == "__main__":
    exemplo_analise()
