const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function diagnoseSupabaseDB() {
  console.log('🔍 Diagnosticando banco de dados Supabase...\n');

  try {
    // 1. Verificar triggers
    console.log('1️⃣ Verificando triggers...');
    const triggers = await prisma.$queryRaw`
      SELECT 
        trigger_name,
        event_manipulation,
        event_object_table,
        action_statement,
        action_timing
      FROM information_schema.triggers 
      WHERE event_object_schema = 'public' OR event_object_schema = 'auth'
      ORDER BY event_object_table, trigger_name;
    `;
    
    if (triggers.length > 0) {
      console.log(`⚠️  Encontrados ${triggers.length} triggers:`);
      triggers.forEach(trigger => {
        console.log(`   - ${trigger.trigger_name} em ${trigger.event_object_table} (${trigger.event_manipulation})`);
      });
    } else {
      console.log('✅ Nenhum trigger encontrado');
    }

    // 2. Verificar funções customizadas
    console.log('\n2️⃣ Verificando funções customizadas...');
    const functions = await prisma.$queryRaw`
      SELECT 
        routine_name,
        routine_type,
        routine_schema
      FROM information_schema.routines 
      WHERE routine_schema = 'public'
      ORDER BY routine_name;
    `;
    
    if (functions.length > 0) {
      console.log(`⚠️  Encontradas ${functions.length} funções customizadas:`);
      functions.forEach(func => {
        console.log(`   - ${func.routine_name} (${func.routine_type})`);
      });
    } else {
      console.log('✅ Nenhuma função customizada encontrada');
    }

    // 3. Verificar políticas RLS
    console.log('\n3️⃣ Verificando políticas RLS...');
    const policies = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `;
    
    if (policies.length > 0) {
      console.log(`⚠️  Encontradas ${policies.length} políticas RLS:`);
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname} em ${policy.tablename} (${policy.cmd})`);
      });
    } else {
      console.log('✅ Nenhuma política RLS encontrada');
    }

    // 4. Verificar status RLS das tabelas
    console.log('\n4️⃣ Verificando status RLS das tabelas...');
    const tables = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        rowsecurity as rls_enabled,
        hasrls as has_rls
      FROM pg_tables 
      WHERE schemaname = 'public' 
      ORDER BY tablename;
    `;
    
    console.log('📋 Status das tabelas:');
    tables.forEach(table => {
      const status = table.rls_enabled ? '🔒 RLS ON' : '🔓 RLS OFF';
      console.log(`   - ${table.tablename}: ${status}`);
    });

    // 5. Verificar constraints que podem estar causando problema
    console.log('\n5️⃣ Verificando constraints...');
    const constraints = await prisma.$queryRaw`
      SELECT 
        table_name,
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public' AND constraint_type IN ('FOREIGN KEY', 'CHECK', 'UNIQUE')
      ORDER BY table_name, constraint_type;
    `;
    
    if (constraints.length > 0) {
      console.log(`📋 Encontradas ${constraints.length} constraints:`);
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.table_name}.${constraint.constraint_name} (${constraint.constraint_type})`);
      });
    } else {
      console.log('✅ Nenhuma constraint problemática encontrada');
    }

    // 6. Verificar se há extensões que podem interferir
    console.log('\n6️⃣ Verificando extensões...');
    const extensions = await prisma.$queryRaw`
      SELECT extname, extversion 
      FROM pg_extension 
      ORDER BY extname;
    `;
    
    console.log('📋 Extensões instaladas:');
    extensions.forEach(ext => {
      console.log(`   - ${ext.extname} (v${ext.extversion})`);
    });

    // 7. Testar inserção direta na tabela users
    console.log('\n7️⃣ Testando inserção direta na tabela users...');
    try {
      const testUserId = `test-direct-${Date.now()}`;
      const testUser = await prisma.user.create({
        data: {
          id: testUserId,
          email: `direct-test-${Date.now()}@example.com`,
          name: 'Direct Test User',
          role: 'free'
        }
      });
      
      console.log('✅ Inserção direta funcionou!');
      console.log('   ID:', testUser.id);
      
      // Limpar
      await prisma.user.delete({ where: { id: testUser.id } });
      console.log('🧹 Usuário de teste removido');
      
    } catch (dbError) {
      console.error('❌ Erro na inserção direta:', dbError.message);
      if (dbError.code) {
        console.error('   Código:', dbError.code);
      }
    }

  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseSupabaseDB();