#!/bin/bash

echo "🔧 Iniciando build para Vercel..."

# Gerar cliente Prisma
echo "📦 Gerando cliente Prisma..."
npx prisma generate

# Verificar se o cliente foi gerado
if [ ! -d "node_modules/.prisma/client" ]; then
  echo "❌ Erro: Cliente Prisma não foi gerado"
  exit 1
fi

echo "✅ Cliente Prisma gerado com sucesso"

# Executar build do Next.js
echo "🏗️ Executando build do Next.js..."
npx next build

echo "✅ Build concluído com sucesso!"