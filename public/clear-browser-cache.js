// Script para limpar dados mock do localStorage
console.log('Limpando dados mock do localStorage...');

// Limpar todos os dados relacionados a cultivos
localStorage.removeItem('cultivations');
localStorage.removeItem('cultivation-events');
localStorage.removeItem('cultivation-data');

// Limpar outros dados que podem conter informações mock
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('cultivation') || key.includes('mock') || key.includes('test'))) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`Removido: ${key}`);
});

console.log('Dados mock removidos com sucesso!');
console.log('Recarregue a página para ver as mudanças.'); 