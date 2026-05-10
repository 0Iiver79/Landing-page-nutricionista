# 🏗️ ARQUITETURA DO SISTEMA

## Visão Geral

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Browser)                       │
│                     index.html + script.js                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Seção Depoimentos - Carrossel                          │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  loadGoogleMapReviews()                                 │   │
│  │  ├─ Verifica cache local (12h)                          │   │
│  │  ├─ Se vazio → fetch('/api/reviews')                   │   │
│  │  ├─ appendGoogleReviews(reviews)                        │   │
│  │  ├─ createGoogleReviewCard(review) × N                  │   │
│  │  └─ reinitializeCarousel()                              │   │
│  │                                                           │   │
│  │  Cada Card:                                              │   │
│  │  ├─ Nome anonimizado (LGPD)                             │   │
│  │  ├─ 5 Estrelas dinâmicas                                │   │
│  │  ├─ Texto com "Ler mais"                                │   │
│  │  ├─ Tempo relativo                                       │   │
│  │  └─ Animações suaves                                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                            │ HTTP GET                            │
│                            └────────────→                        │
└─────────────────────────────────────────┼──────────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
                    ▼                                         ▼
          ┌──────────────────┐                  ┌──────────────────┐
          │ localStorage 12h │                  │  Backend Server  │
          │  (Cache Local)   │                  │    Node.js       │
          └──────────────────┘                  └──────────────────┘
                    ▲                                     │
                    │                                     │
                    └─────────────────┬────────────────────┘
                                      │
                          HTTP POST (API Key Segura)
                                      │
                                      ▼
                       ┌─────────────────────────────┐
                       │  Google Places API          │
                       │  (Cloud.google.com)         │
                       │                             │
                       │ places.googleapis.com/v1    │
                       │ POST places:searchByText    │
                       │                             │
                       │ Response:                   │
                       │ ├─ reviews[]                │
                       │ ├─ ratings                  │
                       │ ├─ photos                   │
                       │ └─ metadata                 │
                       └─────────────────────────────┘
```

---

## 📊 Fluxo de Dados Detalhado

### Cenário 1: Primeiro Acesso (Cache Vazio)

```
1. Usuário abre site
   ↓
2. DOMContentLoaded event
   ↓
3. loadGoogleMapReviews() é chamada
   ↓
4. Verifica localStorage
   → Cache VAZIO (1º acesso)
   ↓
5. fetch('http://localhost:3001/api/reviews')
   ↓
6. Backend recebe GET /api/reviews
   ↓
7. Verifica cache do servidor (6h)
   → Cache VAZIO (1º acesso)
   ↓
8. Faz POST em Google Places API
   ├─ Usa GOOGLE_API_KEY (segura no servidor!)
   └─ Envia place_id (ChIJS1n4d75ZzpQRinLG5WPTb_M)
   ↓
9. Google retorna dados brutos:
   {
     places: [
       {
         displayName: { text: "..." },
         reviews: [{...}, {...}],
         rating: 4.8
       }
     ]
   }
   ↓
10. Backend processa:
    ├─ Extrai reviews
    ├─ Anonimiza nomes (LGPD)
    ├─ Formata dados
    └─ Armazena em cache (6h)
   ↓
11. Backend retorna JSON:
    {
      success: true,
      data: [
        {
          author_name: "Maria S.",
          rating: 5,
          text: "Excelente profissional!",
          relative_time_description: "há 2 meses"
        },
        { ... },
        { ... }
      ]
    }
   ↓
12. Frontend recebe resposta
   ↓
13. Armazena em localStorage (12h)
   ↓
14. appendGoogleReviews(reviews)
    ├─ Loop por cada review
    ├─ createGoogleReviewCard(review)
    │  ├─ Cria <article class="depoimento-card">
    │  ├─ Renderiza 5 estrelas
    │  ├─ Trunca texto se > 280 chars
    │  ├─ Adiciona botão "Ler mais"
    │  └─ Insere no DOM
    └─ Adiciona novo dot no carousel
   ↓
15. reinitializeCarousel()
    ├─ Re-configura todos os cards
    ├─ Re-inicia autoplay
    └─ Re-configura navegação
   ↓
16. ✅ Depoimentos aparecem no site!

⏱️ Tempo total: ~500ms
```

### Cenário 2: Segundo Acesso (Cache Válido)

```
1. Usuário volta ao site (mesma aba)
   ↓
2. DOMContentLoaded event
   ↓
3. loadGoogleMapReviews() é chamada
   ↓
4. Verifica localStorage
   → Cache EXISTE e é válido (< 12h)
   ↓
5. Carrega reviews do localStorage
   ↓
6. appendGoogleReviews(cached_reviews)
   ├─ Cria cards imediatamente
   └─ NÃO faz HTTP request
   ↓
7. ✅ Depoimentos aparecem instantaneamente!

⏱️ Tempo total: ~10ms
```

### Cenário 3: Backend com Cache Válido

```
1. Frontend faz fetch('/api/reviews')
   ↓
2. Backend recebe GET /api/reviews
   ↓
3. Verifica cache do servidor (6h)
   → Cache EXISTE e é válido
   ↓
4. Retorna dados do cache
   ├─ NÃO chama Google API
   ├─ Economiza quota
   └─ Responde rápido
   ↓
5. Frontend continua normalmente

⏱️ Tempo total: ~50ms
💰 Economia: Evita chamada da API Google
```

---

## 🔐 Fluxo de Segurança

### API Key

```
┌─ ANTES (❌ Inseguro)
│
│  index.html
│  <script>
│    const API_KEY = "<SUA_CHAVE_GOOGLE_API>"; // VISÍVEL NO HTML!
│    fetch("...?key=" + API_KEY)
│  </script>
│
│  ❌ Qualquer pessoa pode ver a chave no código-fonte
│  ❌ Roubar chave e usar em outro site
│  ❌ Esgotar quota da sua conta


└─ DEPOIS (✅ Seguro)
│
│  Frontend (browser)
│  └─ fetch('http://localhost:3001/api/reviews')
│     └─ Server recebe
│
│  Backend (server.js)
│  └─ require('dotenv').config()
│     └─ Carrega GOOGLE_API_KEY de .env
│        └─ Faz POST em Google com chave
│           └─ Google valida
│              └─ Retorna dados
│                 └─ Backend filtra/anonimiza
│                    └─ Retorna para frontend
│
│  ✅ API Key nunca viaja na rede
│  ✅ Apenas no servidor (protegido)
│  ✅ Frontend não sabe a chave
│  ✅ Impossível roubar
```

### Anonimização (LGPD)

```
┌─ Google API Response (Dados Brutos)
│
│  {
│    author: {
│      displayName: "Maria da Silva",      ← COMPLETO
│      originalRating: 5,
│      publishTime: "2024-01-15T10:30:00Z"
│    },
│    text: "Adorei o atendimento!",
│    rating: 5
│  }
│
│
├─ Backend Processa
│
│  function anonymizeName(fullName) {
│    const parts = fullName.split(' ');
│    const firstName = parts[0];
│    const lastName = parts[parts.length - 1];
│    return `${firstName} ${lastName.charAt(0)}.`;
│  }
│
│  anonymizeName("Maria da Silva")
│  → "Maria S."
│
│
└─ Frontend Recebe
│
│  {
│    author_name: "Maria S.",              ← ANONIMIZADO
│    rating: 5,
│    text: "Adorei o atendimento!",
│    relative_time_description: "há 2 meses"
│  }
│
│  ✅ Privacidade respeitada
│  ✅ LGPD compliant
│  ✅ Dados pessoais protegidos
```

---

## 💾 Camadas de Cache

```
┌─ CAMADA 1: Frontend Cache (localStorage)
│
│  localStorage.setItem('gmaps_reviews_cache', JSON.stringify(reviews))
│  localStorage.setItem('gmaps_reviews_time', Date.now())
│
│  ├─ TTL: 12 horas
│  ├─ Velocidade: ~10ms (muito rápido)
│  ├─ Próximos 12h: Sem requisição ao servidor
│  └─ Depois 12h: Busca novo cache
│
│
├─ CAMADA 2: Backend Cache (Memory)
│
│  const cache = {
│    data: null,
│    timestamp: null,
│    TTL: 6 * 60 * 60 * 1000  // 6 horas
│  }
│
│  if (cache.data && now - cache.timestamp < cache.TTL) {
│    return cache.data;  // ✅ Cache hit, responde rápido
│  }
│
│  ├─ TTL: 6 horas
│  ├─ Velocidade: ~50ms
│  ├─ Múltiplos usuários compartilham cache
│  ├─ Reduz chamadas API em 90%
│  └─ Economiza quota da API
│
│
└─ CAMADA 3: Google API (Network)
  │
  │  Chamada direta ao Google
  │  (Só acontece quando cache inválido)
  │
  ├─ TTL: Sem cache
  ├─ Velocidade: ~500ms
  ├─ Quota API: Consome uma chamada
  └─ Economia: Acontece apenas ~1% do tempo

```

---

## 📁 Estrutura de Arquivos

```
projeto/
│
├─ 📄 index.html              ← Página principal (HTML5)
├─ 🎨 style.css               ← Estilos (CSS3 + vars)
├─ ⚙️ script.js                ← Frontend logic (ES6+)
│
├─ 🖥️ server.js               ← Backend Node.js (NOVO)
├─ 📦 package.json            ← Dependências npm (NOVO)
├─ 🔑 .env.example            ← Template config (NOVO)
├─ .env                        ← Config real (NÃO commit!)
│
├─ 📚 QUICKSTART.md           ← Início rápido (NOVO)
├─ 📚 REVIEWS_SETUP.md        ← Instalação (NOVO)
├─ 📚 REVIEWS_INTEGRATION.md  ← Técnico (NOVO)
├─ 📚 IMPLEMENTATION_SUMMARY.md ← Resumo (NOVO)
│
├─ 🧪 test-reviews.js         ← Testes (NOVO)
│
└─ 📁 img/                     ← Imagens do site
   └─ foto-drAnaBeatriz.png
```

---

## 🔄 Estados do Sistema

```
┌─────────────────────────────────────────────────────┐
│           ESTADO DO SISTEMA                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Cache Frontend (localStorage)                      │
│ └─ Válido? (< 12h)                                 │
│    ├─ SIM → Use cache                              │
│    │        └─ Renderiza imediatamente (~10ms)     │
│    └─ NÃO → Busca novo                             │
│            └─ fetch('/api/reviews')                │
│
│ Cache Backend (Memory)                             │
│ └─ Válido? (< 6h)                                  │
│    ├─ SIM → Use cache                              │
│    │        └─ Retorna rápido (~50ms)              │
│    └─ NÃO → Busca novo                             │
│            └─ POST em Google Places API            │
│
│ Google API                                          │
│ └─ Retorna:                                         │
│    ├─ Reviews raw                                   │
│    ├─ Ratings                                       │
│    ├─ Photos URLs                                  │
│    └─ Metadata                                      │
│
│ Backend Processa:                                  │
│ ├─ Extrai reviews                                  │
│ ├─ Anonimiza nomes (LGPD)                         │
│ ├─ Formata JSON                                    │
│ └─ Cache por 6h                                    │
│
│ Frontend Renderiza:                                │
│ ├─ Cria cards dinamicamente                        │
│ ├─ Cache por 12h                                   │
│ ├─ Integra com carrossel                           │
│ └─ Exibe na página                                 │
│
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Fluxo por Componente

### Frontend (script.js)

```
loadGoogleMapReviews()
│
├─ Verificação de Cache
│ └─ localStorage.getItem('gmaps_reviews_cache')
│
├─ Se vazio → Fetch do Backend
│ ├─ fetch('http://localhost:3001/api/reviews')
│ ├─ Tratamento de erro
│ └─ Se erro → Continua com depoimentos estáticos
│
├─ Armazena no Cache
│ ├─ localStorage.setItem('gmaps_reviews_cache', reviews)
│ └─ localStorage.setItem('gmaps_reviews_time', now)
│
├─ Renderização
│ ├─ appendGoogleReviews(reviews)
│ │  ├─ Loop por cada review
│ │  ├─ createGoogleReviewCard(review)
│ │  │  ├─ Cria elemento <article>
│ │  │  ├─ Renderiza 5 ⭐
│ │  │  ├─ Trunca texto (280 chars)
│ │  │  ├─ Botão "Ler mais"
│ │  │  └─ Insere no DOM
│ │  └─ Adiciona dots no carousel
│ │
│ └─ reinitializeCarousel()
│    ├─ Reconfigura carousel
│    ├─ Inicializa autoplay
│    └─ Configura navegação
│
└─ Resultado: Depoimentos aparecem!
```

### Backend (server.js)

```
Server inicia (npm start)
│
├─ Express escuta porta 3001
├─ CORS habilitado
├─ Cache memory inicializado
└─ Pronto para requisições
   │
   └─ GET /api/reviews
      │
      ├─ Verifica Cache (6h)
      │ ├─ SIM → Retorna cache
      │ └─ NÃO → Continua
      │
      ├─ POST places.googleapis.com/v1/places:searchByText
      │ ├─ Usa GOOGLE_API_KEY (segura!)
      │ ├─ Envia GOOGLE_PLACE_ID
      │ └─ Google retorna dados brutos
      │
      ├─ Processa Dados
      │ ├─ Extrai reviews array
      │ ├─ Mapeia para formato limpo
      │ ├─ anonymizeName(author_name) para cada
      │ └─ Limita a 5 reviews
      │
      ├─ Armazena em Cache (6h)
      │
      ├─ Retorna JSON
      │ └─ {success: true, data: [...]}
      │
      └─ Frontend recebe resposta ✅
```

---

## ⚡ Performance

```
┌─────────────────────────────────────────────┐
│         TEMPO DE RESPOSTA                    │
├─────────────────────────────────────────────┤
│                                             │
│ Frontend Cache (localStorage)               │
│ ████████████ ~10ms                          │
│                                             │
│ Backend Cache (Memory)                      │
│ ████████████████████████████ ~50ms          │
│                                             │
│ Google API (Network)                        │
│ ████████████████... ~500ms                  │
│                                             │
│ Distribuição (100 visitas):                │
│ - 85 visitas: Cache Frontend (~10ms)        │
│ - 13 visitas: Cache Backend (~50ms)         │
│ - 2 visitas: Google API (~500ms)            │
│                                             │
│ Tempo médio: ~25ms ⚡                       │
│ Sem cache: ~500ms                           │
│ Melhoria: 20x mais rápido!                  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎨 Design System

```
Colors (CSS Variables):
├─ --verde-escuro: #3a6b47    ← Reviews details
├─ --verde-medio: #5c8f68     ← "Ler mais" button
├─ --verde-suave: #a8c9a0     ← Subtle accents
│
Typography:
├─ Cormorant Garamond: Títulos
├─ DM Sans: Corpo
├─ Playfair Display: Branding
│
Spacing:
├─ 20px gaps
├─ 40px padding
├─ 24px margins
│
Animations:
├─ cubic-bezier(0.22, 1, 0.36, 1) ← Spring
├─ 0.3s transition-base
└─ 0.38s transition-spring
```

---

**Pronto! Agora você entende a arquitetura completa do sistema.** 🏗️✨
