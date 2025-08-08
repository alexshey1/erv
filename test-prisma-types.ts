import { prisma } from './lib/prisma'

// Teste simples para verificar se os novos campos são reconhecidos
async function testCultivationTypes() {
  const cultivationData = {
    name: 'Teste',
    seedStrain: 'OG Kush',
    startDate: new Date(),
    plant_type: 'auto',
    cycle_preset_id: 'preset1',
    custom_cycle_params: JSON.stringify({ veg: 30, flower: 60 }),
    user: {
      connect: { id: 'user123' }
    }
  }

  // Este comando deve compilar sem erros se os tipos estão corretos
  console.log('Tipos reconhecidos:', typeof cultivationData)
}

export default testCultivationTypes
