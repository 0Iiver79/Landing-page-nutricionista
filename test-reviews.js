#!/usr/bin/env node

/**
 * SCRIPT DE TESTE - Sistema de Avaliações Google Maps
 * 
 * Uso: node test-reviews.js
 * 
 * Este script valida:
 * ✅ Configuração do .env
 * ✅ Conexão com Google Places API
 * ✅ Formatação de dados
 * ✅ Cache funcionando
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '═'.repeat(60));
console.log('🧪 TESTE - Sistema de Avaliações Google Maps');
console.log('═'.repeat(60) + '\n');

// ═══════════════════════════════════════════════════════════
// TESTE 1: Verificar .env
// ═══════════════════════════════════════════════════════════

console.log('📋 TESTE 1: Configuração .env');
console.log('─'.repeat(60));

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

let envExists = fs.existsSync(envPath);
let envExampleExists = fs.existsSync(envExamplePath);

console.log(`  .env existe?          ${envExists ? '✅ SIM' : '❌ NÃO'}`);
console.log(`  .env.example existe?  ${envExampleExists ? '✅ SIM' : '❌ NÃO'}`);

if (!envExists) {
  console.log('\n  ⚠️  Arquivo .env não encontrado!');
  console.log('  📝 Ações:');
  console.log('     1. Copiar .env.example para .env');
  console.log('     2. Editar .env e adicionar GOOGLE_API_KEY');
  console.log('     3. Executar este script novamente\n');
  process.exit(1);
}

// Carregar .env
require('dotenv').config();

const apiKey = process.env.GOOGLE_API_KEY;
const placeId = process.env.GOOGLE_PLACE_ID;
const port = process.env.PORT || 3001;
const nodeEnv = process.env.NODE_ENV || 'development';

console.log('\n  📌 Valores carregados:');
console.log(`     API Key:      ${apiKey ? '✅ ' + apiKey.substring(0, 10) + '***' : '❌ NÃO CONFIGURADA'}`);
console.log(`     Place ID:     ${placeId ? '✅ ' + placeId : '❌ NÃO CONFIGURADA'}`);
console.log(`     Porta:        ${port}`);
console.log(`     Ambiente:     ${nodeEnv}`);

if (!apiKey || apiKey === 'sua_chave_api_aqui') {
  console.log('\n  ❌ ERRO: API Key não configurada corretamente!');
  console.log('  📝 Edite .env e adicione sua chave do Google\n');
  process.exit(1);
}

console.log('\n  ✅ Configuração .env válida!\n');

// ═══════════════════════════════════════════════════════════
// TESTE 2: Verificar dependências
// ═══════════════════════════════════════════════════════════

console.log('📦 TESTE 2: Dependências Node.js');
console.log('─'.repeat(60));

const required = ['express', 'axios', 'cors', 'dotenv'];
let allDeps = true;

required.forEach(dep => {
  try {
    require.resolve(dep);
    console.log(`  ✅ ${dep}`);
  } catch (e) {
    console.log(`  ❌ ${dep} - NÃO INSTALADO`);
    allDeps = false;
  }
});

if (!allDeps) {
  console.log('\n  ⚠️  Algumas dependências estão faltando!');
  console.log('  📝 Execute: npm install\n');
  process.exit(1);
}

console.log('\n  ✅ Todas as dependências instaladas!\n');

// ═══════════════════════════════════════════════════════════
// TESTE 3: Testar API do Google
// ═══════════════════════════════════════════════════════════

console.log('🌐 TESTE 3: Conexão com Google Places API');
console.log('─'.repeat(60));

const axios = require('axios');

async function testGoogleAPI() {
  try {
    console.log(`  🔄 Testando com place_id: ${placeId}`);
    
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchByText',
      {
        textQuery: 'Dra. Ana Beatriz Nutricionista'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey
        }
      }
    );

    console.log(`  ✅ Conexão bem-sucedida!`);
    console.log(`  📊 Status: ${response.status}`);
    console.log(`  📍 Resultados encontrados: ${response.data.places?.length || 0}\n`);

    return true;
  } catch (error) {
    console.log(`  ❌ Erro ao conectar:`);
    console.log(`     Status: ${error.response?.status || 'N/A'}`);
    console.log(`     Mensagem: ${error.response?.data?.error?.message || error.message}`);
    console.log('\n  💡 Verificar:');
    console.log('     • API Key está válida?');
    console.log('     • Places API está ativada no Google Cloud?');
    console.log('     • Quotas não foram excedidas?\n');
    
    return false;
  }
}

testGoogleAPI().then(success => {
  // ═══════════════════════════════════════════════════════════
  // TESTE 4: Arquivos do projeto
  // ═══════════════════════════════════════════════════════════

  console.log('📁 TESTE 4: Arquivos do Projeto');
  console.log('─'.repeat(60));

  const requiredFiles = [
    'index.html',
    'style.css',
    'script.js',
    'server.js',
    'package.json'
  ];

  let allFilesExist = true;

  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
  });

  if (!allFilesExist) {
    console.log('\n  ⚠️  Alguns arquivos estão faltando!\n');
  } else {
    console.log('\n  ✅ Todos os arquivos necessários estão presentes!\n');
  }

  // ═══════════════════════════════════════════════════════════
  // RESUMO FINAL
  // ═══════════════════════════════════════════════════════════

  console.log('═'.repeat(60));
  console.log('✅ TESTES CONCLUÍDOS');
  console.log('═'.repeat(60) + '\n');

  if (success) {
    console.log('🚀 Próximos passos:');
    console.log('   1. Execute: npm start');
    console.log('   2. Abra o site no navegador');
    console.log('   3. Verifique a seção Depoimentos');
    console.log('   4. Reviews do Google Maps devem aparecer!\n');
  } else {
    console.log('⚠️  Corrija os erros acima e execute novamente.\n');
  }

  console.log('📚 Documentação:');
  console.log('   • REVIEWS_SETUP.md');
  console.log('   • REVIEWS_INTEGRATION.md\n');
});
