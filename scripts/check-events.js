const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEvents() {
  try {
    console.log('=== VERIFICANDO EVENTOS NO BANCO ===');
    
    // Buscar todos os eventos
    const events = await prisma.cultivationEvent.findMany({
      include: {
        cultivation: true
      }
    });
    
    console.log(`Total de eventos encontrados: ${events.length}`);
    
    events.forEach((event, index) => {
      console.log(`\n--- Evento ${index + 1} ---`);
      console.log('ID:', event.id);
      console.log('Tipo:', event.type);
      console.log('Título:', event.title);
      console.log('Descrição:', event.description);
      console.log('Data:', event.date);
      console.log('Photos (JSON):', event.photos);
      
      try {
        const parsedPhotos = JSON.parse(event.photos);
        console.log('Photos parseado:', parsedPhotos);
        console.log('pH:', parsedPhotos.ph);
        console.log('EC:', parsedPhotos.ec);
        console.log('Temperatura:', parsedPhotos.temperatura);
      } catch (error) {
        console.log('Erro ao fazer parse do JSON:', error.message);
      }
      
      console.log('Cultivation ID:', event.cultivationId);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEvents(); 