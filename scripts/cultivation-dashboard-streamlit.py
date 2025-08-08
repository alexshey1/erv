import streamlit as st
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
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
    custo_substrato: float = 120.0
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

# --- INTERFACE STREAMLIT ---

def main():
    st.set_page_config(
        page_title="Dashboard de Cultivo Indoor",
        page_icon="🌱",
        layout="wide"
    )
    
    st.title("🌱 Análise de Viabilidade do Cultivo Indoor")
    st.markdown("---")
    
    # Sidebar para parâmetros
    st.sidebar.header("⚙️ Configurações")
    
    # Aba 1: Setup e Investimento
    st.sidebar.subheader("💰 Setup e Investimento")
    area_m2 = st.sidebar.slider("Área de Cultivo (m²)", 0.36, 10.0, 2.25, 0.1)
    custo_equip_iluminacao = st.sidebar.number_input("Custo Iluminação (R$)", 500.0, 10000.0, 2000.0, 100.0)
    custo_tenda_estrutura = st.sidebar.number_input("Custo Tenda/Estrutura (R$)", 500.0, 5000.0, 1500.0, 100.0)
    custo_ventilacao_exaustao = st.sidebar.number_input("Custo Ventilação (R$)", 200.0, 2000.0, 800.0, 50.0)
    custo_outros_equipamentos = st.sidebar.number_input("Outros Equipamentos (R$)", 100.0, 2000.0, 500.0, 50.0)
    
    # Aba 2: Parâmetros do Ciclo
    st.sidebar.subheader("🌿 Parâmetros do Ciclo")
    potencia_watts = st.sidebar.slider("Potência Iluminação (W)", 50, 2000, 480, 10)
    num_plantas = st.sidebar.slider("Nº de Plantas", 1, 30, 6, 1)
    producao_por_planta_g = st.sidebar.slider("Produção/Planta (g)", 10, 250, 80, 5)
    dias_vegetativo = st.sidebar.slider("Dias Vegetativo", 15, 120, 60, 1)
    horas_luz_veg = st.sidebar.slider("Horas Luz (Veg)", 12, 24, 18, 1)
    dias_floracao = st.sidebar.slider("Dias Floração", 45, 120, 70, 1)
    horas_luz_flor = st.sidebar.slider("Horas Luz (Flora)", 8, 16, 12, 1)
    dias_secagem_cura = st.sidebar.slider("Dias Secagem/Cura", 7, 40, 20, 1)
    
    # Aba 3: Custos e Mercado
    st.sidebar.subheader("💵 Custos e Mercado")
    preco_kwh = st.sidebar.number_input("Preço kWh (R$)", 0.1, 2.0, 0.95, 0.05)
    custo_sementes_clones = st.sidebar.number_input("Custo Sementes/Clones (R$)", 100.0, 2000.0, 500.0, 50.0)
    custo_substrato = st.sidebar.number_input("Custo Substrato (R$)", 50.0, 500.0, 120.0, 10.0)
    custo_nutrientes = st.sidebar.number_input("Custo Nutrientes (R$)", 100.0, 1000.0, 350.0, 25.0)
    custos_operacionais_misc = st.sidebar.number_input("Outros Custos/Ciclo (R$)", 50.0, 500.0, 100.0, 25.0)
    preco_venda_por_grama = st.sidebar.slider("Preço Venda (R$/g)", 10.0, 100.0, 45.0, 1.0)
    
    # Criar objetos dataclass
    setup = SetupInvestimento(
        area_m2=area_m2,
        custo_equip_iluminacao=custo_equip_iluminacao,
        custo_tenda_estrutura=custo_tenda_estrutura,
        custo_ventilacao_exaustao=custo_ventilacao_exaustao,
        custo_outros_equipamentos=custo_outros_equipamentos
    )
    
    ciclo = ParametrosCiclo(
        potencia_watts=potencia_watts,
        num_plantas=num_plantas,
        producao_por_planta_g=producao_por_planta_g,
        dias_vegetativo=dias_vegetativo,
        horas_luz_veg=horas_luz_veg,
        dias_floracao=dias_floracao,
        horas_luz_flor=horas_luz_flor,
        dias_secagem_cura=dias_secagem_cura
    )
    
    mercado = CustosMercado(
        preco_kwh=preco_kwh,
        custo_sementes_clones=custo_sementes_clones,
        custo_substrato=custo_substrato,
        custo_nutrientes=custo_nutrientes,
        custos_operacionais_misc=custos_operacionais_misc,
        preco_venda_por_grama=preco_venda_por_grama
    )
    
    # Executar simulação
    simulador = SimuladorCultivoCompleto(setup, ciclo, mercado)
    resultados = simulador.simular()
    
    # Exibir métricas principais
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            "💰 Lucro por Ciclo",
            f"R$ {resultados['Lucro Líquido p/ Ciclo (R$)']:.2f}",
            delta=None
        )
    
    with col2:
        st.metric(
            "⏱️ Payback",
            f"{resultados['Período de Payback (ciclos)']:.1f} ciclos",
            delta=None
        )
    
    with col3:
        st.metric(
            "📈 ROI (1º Ano)",
            f"{resultados['ROI sobre Investimento (1º Ano %)']:.1f}%",
            delta=None
        )
    
    with col4:
        st.metric(
            "⚡ Eficiência",
            f"{resultados['Gramas por Watt (g/W)']:.2f} g/W",
            delta=None
        )
    
    st.markdown("---")
    
    # Gráficos
    col1, col2 = st.columns(2)
    
    with col1:
        # Gráfico de custos operacionais
        fig1, ax1 = plt.subplots(figsize=(8, 6))
        custos_op = resultados['detalhe_custos_operacionais']
        ax1.pie(custos_op.values(), labels=custos_op.keys(), autopct='%1.1f%%', startangle=90)
        ax1.set_title('Distribuição dos Custos Operacionais por Ciclo')
        st.pyplot(fig1)
    
    with col2:
        # Gráfico de linha do tempo
        fig2, ax2 = plt.subplots(figsize=(8, 6))
        fases = ['Vegetativo', 'Floração', 'Secagem/Cura']
        duracao = [ciclo.dias_vegetativo, ciclo.dias_floracao, ciclo.dias_secagem_cura]
        cores = ['#4CAF50', '#FFC107', '#795548']
        
        ax2.barh(fases, duracao, color=cores)
        ax2.set_title(f'Linha do Tempo do Ciclo ({simulador.get_duracao_total_ciclo()} dias)')
        ax2.set_xlabel('Dias')
        ax2.grid(axis='x', linestyle=':', alpha=0.7)
        st.pyplot(fig2)
    
    # Tabela de resultados detalhados
    st.subheader("📊 Resultados Detalhados")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.write("**Métricas Financeiras:**")
        st.write(f"• Investimento Total: R$ {resultados['Custo Total Investimento (R$)']:.2f}")
        st.write(f"• Custo Operacional/Ciclo: R$ {resultados['Custo Operacional p/ Ciclo (R$)']:.2f}")
        st.write(f"• Receita Bruta/Ciclo: R$ {resultados['Receita Bruta p/ Ciclo (R$)']:.2f}")
        st.write(f"• Lucro Líquido/Ciclo: R$ {resultados['Lucro Líquido p/ Ciclo (R$)']:.2f}")
    
    with col2:
        st.write("**Métricas de Eficiência:**")
        st.write(f"• Custo por Grama: R$ {resultados['Custo por Grama (R$/g)']:.2f}")
        st.write(f"• Gramas por Watt: {resultados['Gramas por Watt (g/W)']:.2f} g/W")
        st.write(f"• Gramas por m²: {resultados['Gramas por m² (g/m²)']:.0f} g/m²")
        st.write(f"• Duração do Ciclo: {simulador.get_duracao_total_ciclo()} dias")

if __name__ == "__main__":
    main()
