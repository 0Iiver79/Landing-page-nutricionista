<!-- ============================================================
     INSTRUÇÕES DE INTEGRAÇÃO GOOGLE REVIEWS
     Seção de Depoimentos 
     ============================================================ -->

# 🎯 Como Usar o Sistema de Avaliações Google Maps

## 📍 O que foi criado?

### 3 Arquivos Principais:

1. **server.js** - Backend Node.js seguro
2. **package.json** - Dependências npm
3. **.env.example** - Template de configuração

### Mudanças no Frontend:

1. **script.js** - Adicionadas funções para carregar reviews
2. **style.css** - Estilos para botão "Ler mais"

---

## 🔑 Passo a Passo Rápido

### 1. Instalar dependências

```bash
cd "d:\Gustavo Dev\Projeto Freela01"
npm install
```

### 2. Criar arquivo .env

```bash
# Copiar o template
copy .env.example .env
```

### 3. Adicionar sua API key

Edite `.env` e adicione:

```
GOOGLE_API_KEY=sua_chave_aqui
GOOGLE_PLACE_ID=ChIJS1n4d75ZzpQRinLG5WPTb_M
PORT=3001
NODE_ENV=production
```

### 4. Iniciar servidor

```bash
npm start
```

### 5. Abrir site normalmente

O site buscará reviews automaticamente do endpoint.

---

## ✨ Como Funciona?

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                    │
│                                                          │
│  1. Página carrega → loadGoogleMapReviews()            │
│  2. Verifica cache local (12 horas)                    │
│  3. Se vazio → fetch('/api/reviews')                   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP Request
                       ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Node.js server.js)                │
│                                                          │
│  4. Recebe requisição GET /api/reviews                 │
│  5. Verifica cache do servidor (6 horas)              │
│  6. Se vazio → Chama Google Places API                │
│  7. Anonimiza nomes (LGPD)                            │
│  8. Retorna JSON com avaliações                       │
└──────────────────────┬──────────────────────────────────┘
                       │ JSON Response
                       ▼
┌─────────────────────────────────────────────────────────┐
│           FRONTEND (Browser - Continuação)              │
│                                                          │
│  9. Armazena no localStorage                           │
│  10. Cria cards de reviews dinamicamente               │
│  11. Exibe no carrossel da seção "Depoimentos"        │
└─────────────────────────────────────────────────────────┘
```

---

## 🛡️ Segurança

### ✅ API Key Protegida

```
❌ ERRADO: Chave no HTML/JavaScript
✅ CORRETO: Chave no servidor Node.js
```

### ✅ Dados Privados Protegidos

```javascript
// Antes (dados completos):
{
  author_name: "Maria da Silva",
  rating: 5,
  text: "Melhor nutricionista!"
}

// Depois (anonimizado):
{
  author_name: "Maria S.",
  rating: 5,
  text: "Melhor nutricionista!"
}
```

---

## 📦 O que cada arquivo faz?

### `server.js` (Backend Express)

```javascript
// ✅ Protege API key
// ✅ Implementa cache (6 horas)
// ✅ Anonimiza nomes
// ✅ Trata erros
// ✅ Retorna JSON limpo

GET /api/reviews → {
  success: true,
  data: [
    {
      author_name: "Nome A.",
      rating: 5,
      text: "...",
      relative_time_description: "há 2 meses"
    }
  ]
}
```

### `package.json` (Dependências)

```json
{
  "dependencies": {
    "express": "4.18.2",      // Servidor web
    "axios": "1.6.0",         // HTTP client
    "cors": "2.8.5",          // Permite requisições do site
    "dotenv": "16.3.1"        // Carrega .env
  }
}
```

### `.env.example` (Template)

```bash
# Copiar → .env antes de usar
GOOGLE_API_KEY=sua_chave_aqui
GOOGLE_PLACE_ID=ChIJS1n4d75ZzpQRinLG5WPTb_M
PORT=3001
NODE_ENV=production
```

### `script.js` (Frontend JavaScript)

```javascript
loadGoogleMapReviews()
├─ Verifica cache local
├─ fetch('/api/reviews')
├─ appendGoogleReviews()
├─ createGoogleReviewCard()
└─ reinitializeCarousel()

// Cada card tem:
✅ Texto com "Ler mais"
✅ 5 estrelas dinâmicas
✅ Nome anonimizado
✅ Tempo relativo
```

### `style.css` (Estilos)

```css
/* Novo */
.review-read-more {
  /* Botão "Ler mais" elegante */
  color: var(--verde-medio);
  font-weight: 500;
  cursor: pointer;
  transition: color var(--transition-base);
}

/* Existente - sem mudanças */
.depoimento-card { ... }
.stars { ... }
.depoimento-text { ... }
```

---

## 🚀 Usando Localmente (Desenvolvimento)

### Terminal 1 (Servidor Node.js)

```bash
npm start
# Output:
# ✅ Servidor seguro rodando em http://localhost:3001
```

### Terminal 2 (Servidor Web)

```bash
# Opção 1: Live Server (VS Code)
# Clique em "Go Live" ou F5

# Opção 2: Python
python -m http.server 8000

# Opção 3: Node.js http-server
npx http-server
```

### Acessar

```
Browser: http://localhost:5500 (ou sua porta)

O site carregará reviews automaticamente!
```

---

## 🧪 Testando

### No Console do Navegador (F12)

```javascript
// Ver reviews no cache
const cache = localStorage.getItem('gmaps_reviews_cache');
console.log(JSON.parse(cache));

// Ver logs do carregamento
// Abra DevTools → Console
```

### Verificar Rede

```
DevTools → Network → Filtrar por "reviews"
Deve ver: GET http://localhost:3001/api/reviews
Status: 200 OK
```

### Verificar Cache

```
Tempo 1º acesso: Carrega da API (~500ms)
Tempo 2º acesso: Carrega do localStorage (~10ms)
Cada 12 horas: Recarrega da API automaticamente
```

---

## ⚠️ Erros Comuns

### ❌ "Cannot GET /api/reviews"

```
Causa: Servidor Node não está rodando
Solução: npm start (em outro terminal)
```

### ❌ "CORS error"

```
Causa: Frontend e backend em portas diferentes sem CORS
Solução: server.js já tem cors(), verifique se está rodando
```

### ❌ "Invalid API key"

```
Causa: GOOGLE_API_KEY inválida ou não ativada
Solução:
1. Verifique .env tem a chave correta
2. Acesse Google Cloud Console
3. Confirme Places API está ativada
4. Gere nova chave se necessário
```

### ❌ "No reviews found"

```
Causa: Google Place ID inválido ou sem reviews
Solução:
1. Verifique GOOGLE_PLACE_ID no .env
2. Confirme no Google Maps que o local tem reviews
3. Teste o place_id em outro lugar
```

---

## 📊 Monitorando

### Logs do Servidor

```bash
✅ GET /api/reviews - Cache hit (retorna cache)
✅ GET /api/reviews - Cache miss (busca API)
❌ Error: Invalid API key
❌ Error: Place not found
```

### Frontend Logs

```javascript
// Em script.js há console.warn() para erros:
console.warn('Reviews do Google Maps não disponíveis:', error.message)

// Se houver erro, continua com depoimentos estáticos
```

---

## 🎯 Para Produção

### 1. Deploy do Backend

**Opção A: Vercel (recomendado)**
```bash
npm install -g vercel
vercel
```

**Opção B: Railway.app**
```bash
# Conectar repositório Git
# Railway faz deploy automático
```

**Opção C: Seu servidor**
```bash
# Copiar arquivos
# npm install
# npm start (ou pm2)
```

### 2. Atualizar Frontend

```javascript
// Em script.js, linha ~248:

// LOCAL:
fetch('http://localhost:3001/api/reviews')

// PRODUÇÃO:
fetch('https://seu-backend.com/api/reviews')
```

### 3. Environment Variables

```bash
# .env em produção:
GOOGLE_API_KEY=sua_chave
GOOGLE_PLACE_ID=ChIJS1n4d75ZzpQRinLG5WPTb_M
PORT=3001
NODE_ENV=production
```

---

## 📋 Checklist Final

- [ ] npm install (dependências instaladas)
- [ ] .env criado com API key válida
- [ ] npm start (servidor rodando na porta 3001)
- [ ] Site carrega (http://localhost:5500)
- [ ] Reviews aparecem na seção Depoimentos
- [ ] "Ler mais" funciona ao clicar
- [ ] Cache funciona (2º acesso mais rápido)
- [ ] Responsive em mobile
- [ ] Nomes estão anonimizados
- [ ] Sem erros no console

---

## 💡 Dicas Extras

### Para Testar Rápido

```bash
# Terminal 1
npm start

# Terminal 2
npm install -g http-server
http-server

# Browser: http://localhost:8080
```

### Para Debug Avançado

```javascript
// Em script.js, adicione antes de fetch:
console.log('Carregando reviews...');

const response = await fetch('http://localhost:3001/api/reviews');
console.log('Status:', response.status);
console.log('Response:', response);

const data = await response.json();
console.log('Data:', data);
```

### Para Limpar Cache

```javascript
// No console do navegador:
localStorage.removeItem('gmaps_reviews_cache');
localStorage.removeItem('gmaps_reviews_time');
location.reload();
```

---

## 🎨 Personalizações

### Mudar Limite de Reviews

```javascript
// Em script.js, função appendGoogleReviews():
const topReviews = reviews.slice(0, 4); // Mudar de 4 para outro número
```

### Mudar Caracteres Truncados

```javascript
// Em script.js, função createGoogleReviewCard():
const MAX_LENGTH = 280; // Mudar truncagem
```

### Mudar Cor das Estrelas

```css
/* Em style.css */
.star {
  fill: /* mudar para outra cor */
}
```

---

**✨ Sistema pronto para produção!**
Qualquer dúvida, verifique os logs do servidor e do navegador.
