const http = require('http');

console.log('🔍 Verificando se o servidor está rodando...\n');

// Função para testar a conexão
function testServer(port = 3000) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      console.log(`✅ Servidor respondendo na porta ${port}`);
      console.log(`📊 Status: ${res.statusCode}`);
      console.log(`📋 Headers: ${JSON.stringify(res.headers, null, 2)}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ Erro ao conectar na porta ${port}: ${err.message}`);
      reject(err);
    });

    req.setTimeout(5000, () => {
      console.log(`⏰ Timeout ao conectar na porta ${port}`);
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Testar diferentes portas
async function checkAllPorts() {
  const ports = [3000, 3001, 3002, 8080];
  
  for (const port of ports) {
    try {
      await testServer(port);
      return port;
    } catch (err) {
      console.log(`Porta ${port} não está disponível`);
    }
  }
  
  console.log('\n❌ Nenhuma porta encontrada com servidor rodando');
  return null;
}

// Executar verificação
checkAllPorts().then((port) => {
  if (port) {
    console.log(`\n🎉 Servidor encontrado na porta ${port}`);
    console.log(`🌐 Acesse: http://localhost:${port}`);
    console.log(`📱 Página de teste: http://localhost:${port}/simple-test`);
  } else {
    console.log('\n🔧 Soluções:');
    console.log('1. Execute: npm run dev');
    console.log('2. Verifique se não há outros processos usando a porta');
    console.log('3. Tente uma porta diferente: PORT=3001 npm run dev');
  }
}).catch(console.error); 