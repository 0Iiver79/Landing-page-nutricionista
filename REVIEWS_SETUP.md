# Sistema de Avaliações Google Maps - Dra. Ana Beatriz

## 📋 Visão Geral

Este sistema integra avaliações reais do Google Maps de forma segura e elegante na seção de depoimentos do site, mantendo a identidade visual premium.

### ✨ Características

✅ **Segurança**: API key protegida em backend Node.js
✅ **Performance**: Cache local temporário (12 horas)
✅ **Privacidade**: Anonimização de nomes (LGPD)
✅ **UX Premium**: Design integrado, "ler mais" para textos longos
✅ **Responsivo**: Funciona perfeitamente em mobile
✅ **Microinterações**: Hover sofisticado, transições suaves

---

## 🚀 Instalação e Configuração

### 1️⃣ Instalar Dependências Node.js

```bash
npm install
```

Isso instala: `express`, `cors`, `axios`, `dotenv`

### 2️⃣ Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# Copiar do arquivo .env.example
cp .env.example .env
```

Edite `.env` e adicione sua API key do Google:

```env
# Google Places API
GOOGLE_API_KEY=sua_chave_api_aqui
GOOGLE_PLACE_ID=ChIJS1n4d75ZzpQRinLG5WPTb_M

# Configuração
PORT=3001
NODE_ENV=production
```

### 3️⃣ Obter API Key Google

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative a API: **Places API**
4. Vá para **Credenciais** → **Criar Credencial** → **Chave de API**
5. Copie a chave e cole no `.env`

### 4️⃣ Iniciar o Servidor

```bash
npm start
```

Você verá:
```
✅ Servidor seguro rodando em http://localhost:3001
📍 Endpoint: GET http://localhost:3001/api/reviews
```

### 5️⃣ Testar a Integração

O frontend carregará as avaliações automaticamente:
- Busca do endpoint `/api/reviews`
- Cache local por 12 horas
- Atualiza o carrossel dinamicamente

---

## 🔐 Segurança

### Por que Backend?

A API key do Google **NUNCA** deve estar exposta no frontend. Este sistema:

✅ Mantém a chave segura no servidor Node.js
✅ Proxy seguro para requisições da API
✅ Cache inteligente (evita limite de requisições)
✅ Anonimiza dados dos usuários

### LGPD / Privacidade

- ✅ Nomes anonimizados (ex: "Maria S." instead of "Maria Silva")
- ✅ Sem armazenamento de dados pessoais
- ✅ Apenas consumo temporário e renderização
- ✅ Respeita limites da API Google

---

## 📱 Features Implementadas

### 1️⃣ Carregamento Seguro

```javascript
// Frontend busca do backend seguro
fetch('http://localhost:3001/api/reviews')
```

### 2️⃣ Cache Local (12h)

```javascript
// Armazena no localStorage para evitar chamadas excessivas
localStorage.setItem('gmaps_reviews_cache', reviews)
```

### 3️⃣ Sistema "Ler Mais"

- Textos truncados em 280 caracteres
- Botão elegante "Ler mais / Ler menos"
- Transição suave
- Mantém design premium

### 4️⃣ Anonimização de Nomes

```javascript
// "Maria da Silva" → "Maria S."
function anonymizeName(fullName) {
  const parts = fullName.split(' ');
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName} ${lastName.charAt(0)}.`;
}
```

### 5️⃣ Microinterações

- Hover sofisticado no card
- Transições suaves (cubic-bezier)
- Elevação do card ao hover
- Animação de entrada fade + slide

---

## 🎨 Design & UX

### Estrelas

- Renderizadas dinamicamente (1-5 ⭐)
- Cor premium: #C8A45A (ouro suave)
- Alinhadas com design existente

### Textos

- Italic suave, typography premium
- Quase-black para melhor legibilidade
- Anonimização respeitosa

### Cards

- Fundo branco limpo
- Sombra sofisticada
- Border suave
- Espaçamento aéreo

---

## 🔧 Troubleshooting

### ❌ "API key não configurada"

```
✓ Verifique se o arquivo .env existe
✓ Confirme que GOOGLE_API_KEY está preenchida
✓ Reinicie o servidor (npm start)
```

### ❌ "Erro ao buscar avaliações"

```
✓ Verifique a API Key (pode estar expirada)
✓ Confirme que Places API está ativada
✓ Verifique limite de requisições (quotas)
✓ Check console do navegador (DevTools)
```

### ❌ Carrossel não atualiza

```
✓ Verifique se o servidor está rodando (porta 3001)
✓ Abra DevTools → Console → veja logs
✓ Limpe cache (Ctrl+Shift+Del)
✓ Recarregue a página (Ctrl+F5)
```

---

## 📊 Limites da API Google

- **5 reviews** por requisição (máximo)
- **Quota**: Consulte seu plano na Google Cloud
- **Rate limit**: Respeitado automaticamente
- **Cache**: 12 horas (reduz chamadas)

---

## 🚢 Deploy

### Para Produção

1. Gere chave de API restrita (apenas Places API)
2. Implante o servidor Node.js (Heroku, Railway, etc)
3. Atualize URL no `script.js`:

```javascript
// Antes (local):
fetch('http://localhost:3001/api/reviews')

// Depois (produção):
fetch('https://sua-api.com/api/reviews')
```

### Exemplo com Vercel (recomendado para Node.js)

```bash
npm install -g vercel
vercel
```

---

## 📝 Arquivo .env

**⚠️ IMPORTANTE: Nunca commit o `.env` no Git!**

```
# .env (local, não versionar)
GOOGLE_API_KEY=<SUA_CHAVE_GOOGLE_API>
GOOGLE_PLACE_ID=ChIJS1n4d75ZzpQRinLG5WPTb_M
PORT=3001
NODE_ENV=development
```

```
# .env.example (versionar, exemplo)
GOOGLE_API_KEY=sua_chave_api_aqui
GOOGLE_PLACE_ID=ChIJS1n4d75ZzpQRinLG5WPTb_M
PORT=3001
NODE_ENV=production
```

---

## 🎯 Próximos Passos

- ✅ Testar localmente
- ✅ Validar cache
- ✅ Testar "Ler mais"
- ✅ Verificar responsivo (mobile)
- ✅ Deploy para produção
- ✅ Monitorar quotas da API

---

## 📧 Suporte

Qualquer dúvida sobre a integração, verifique:
1. [Google Places API Docs](https://developers.google.com/maps/documentation/places)
2. Console do navegador (DevTools)
3. Logs do servidor Node.js

---

**Design by:** Dra. Ana Beatriz
**Premium Wellness Nutrition** ✨
