from flask import Flask, request, jsonify
import importlib.util
import os

# Caminho absoluto para o script
script_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cultivation-dashboard-streamlit.py')

spec = importlib.util.spec_from_file_location('cultivation_dashboard_streamlit', script_path)
cds = importlib.util.module_from_spec(spec)
spec.loader.exec_module(cds)

SetupInvestimento = cds.SetupInvestimento
ParametrosCiclo = cds.ParametrosCiclo
CustosMercado = cds.CustosMercado
SimuladorCultivoCompleto = cds.SimuladorCultivoCompleto

app = Flask(__name__)

@app.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.json
    setup = SetupInvestimento(**data['setup'])
    ciclo = ParametrosCiclo(**data['cycle'])
    mercado = CustosMercado(**data['market'])
    simulador = SimuladorCultivoCompleto(setup, ciclo, mercado)
    resultados = simulador.simular()
    return jsonify(resultados)

if __name__ == '__main__':
    app.run(port=5001, debug=True) 