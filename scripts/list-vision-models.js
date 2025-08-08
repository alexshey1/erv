require('dotenv').config();

async function listOpenRouterModels() {
  console.log('📋 Listando modelos disponíveis no OpenRouter...');
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENTOUTER_API_KEY_TRICHO}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Erro ao listar modelos:', response.status);
      return;
    }
    
    const models = await response.json();
    
    // Filtrar modelos que suportam visão (imagens)
    const visionModels = models.data.filter(model => 
      model.architecture?.modality?.includes('image') || 
      model.top_provider?.modality?.includes('image') ||
      model.name.toLowerCase().includes('vision') ||
      model.name.toLowerCase().includes('gemini') ||
      model.name.toLowerCase().includes('gpt-4') ||
      model.id.includes('vision')
    );
    
    console.log('🔍 Modelos com suporte a imagens encontrados:');
    console.log('=====================================');
    
    visionModels.forEach(model => {
      console.log(`📷 ${model.id}`);
      console.log(`   Nome: ${model.name}`);
      console.log(`   Preço: $${model.pricing?.prompt || 'N/A'} / $${model.pricing?.completion || 'N/A'}`);
      console.log(`   Contexto: ${model.context_length || 'N/A'} tokens`);
      if (model.description) {
        console.log(`   Descrição: ${model.description.substring(0, 100)}...`);
      }
      console.log('   ---');
    });
    
    // Mostrar modelos gratuitos
    const freeVisionModels = visionModels.filter(model => 
      model.pricing?.prompt === '0' || 
      model.id.includes(':free') ||
      model.pricing?.prompt < 0.001
    );
    
    console.log('💰 Modelos GRATUITOS com suporte a imagens:');
    console.log('==========================================');
    
    freeVisionModels.forEach(model => {
      console.log(`🆓 ${model.id}`);
      console.log(`   Nome: ${model.name}`);
      console.log(`   Contexto: ${model.context_length || 'N/A'} tokens`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

listOpenRouterModels();
