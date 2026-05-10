<!-- 
  ╔═══════════════════════════════════════════════════════════╗
  ║   INÍCIO RÁPIDO - Google Maps Reviews                    ║
  ║   5 minutos para integrar avaliações reais               ║
  ╚═══════════════════════════════════════════════════════════╝
-->

# ⚡ INÍCIO RÁPIDO (5 MINUTOS)

## 🎯 Antes de Começar

Você precisa de:
- Node.js instalado
- Google API Key
- 5 minutos de tempo

---

## 📋 Passo 1: Instalar (1 min)

```bash
npm install
```

Isso instala: express, axios, cors, dotenv

---

## 🔑 Passo 2: Obter API Key (2 min)

### No Google Cloud Console:

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto
3. Vá em "APIs e Serviços"
4. Procure por "Places API"
5. Clique em "Ativar"
6. Vá em "Credenciais"
7. Clique em "Criar Credencial" → "Chave de API"
8. Copie a chave

```
Você terá algo como:
<SUA_CHAVE_GOOGLE_API>
```

---

## ⚙️ Passo 3: Configurar (1 min)

Crie arquivo `.env` na pasta do projeto:

```bash
# Windows
echo GOOGLE_API_KEY=sua_chave_aqui > .env
```

Ou abra um editor e crie `.env`:

```
GOOGLE_API_KEY=<SUA_CHAVE_GOOGLE_API>
GOOGLE_PLACE_ID=ChIJS1n4d75ZzpQRinLG5WPTb_M
PORT=3001
NODE_ENV=production
```

---

## 🚀 Passo 4: Iniciar (1 min)

### Terminal 1 - Servidor Node.js

```bash
npm start
```

Você verá:
```
✅ Servidor seguro rodando em http://localhost:3001
```

### Terminal 2 - Site (manter aberto)

```bash
# Use seu servidor web preferido:

# Opção A: Live Server (VS Code)
# Clique em "Go Live" na barra inferior

# Opção B: Python
python -m http.server 8000

# Opção C: Node.js
npx http-server
```

---

## ✅ Pronto!

Abra no navegador:
```
http://localhost:5500
(ou http://localhost:8000 se usar Python)
```

### O site carregará automaticamente com reviews reais!

---

## 🔍 Como Saber se Funcionou

Procure na seção "Depoimentos":

✅ Reviews aparecem?
✅ Tem botão "Ler mais"?
✅ Tem 5 estrelas?
✅ Nomes estão como "Nome S."?

Se SIM → 🎉 Funcionou!

---

## 🐛 Se Não Funcionar

### Erro 1: "Cannot GET /api/reviews"

```
→ Você esqueceu de iniciar o servidor!
npm start (em um terminal separado)
```

### Erro 2: "Invalid API key"

```
→ Sua chave é inválida
1. Verifique se copiou corretamente
2. Acesse Google Cloud Console
3. Crie uma nova chave
4. Cole em .env
5. Reinicie: npm start
```

### Erro 3: "Nada aparece"

```
1. Abra DevTools (F12)
2. Console
3. Procure por mensagens de erro
4. Copie a mensagem
5. Verifique troubleshooting em REVIEWS_SETUP.md
```

---

## 🧪 Testar Rápido

```bash
node test-reviews.js
```

Este script valida tudo automaticamente.

---

## 📚 Documentação Completa

```
REVIEWS_SETUP.md          ← Guia instalação
REVIEWS_INTEGRATION.md    ← Como funciona
IMPLEMENTATION_SUMMARY.md ← O que foi criado
test-reviews.js           ← Testes
```

---

## 🎨 Personalizar

### Mudar número de reviews

Em `script.js`, linha ~280:
```javascript
const topReviews = reviews.slice(0, 4); // Mudar 4 para outro número
```

### Mudar caracteres truncados

Em `script.js`, linha ~307:
```javascript
const MAX_LENGTH = 280; // Mudar 280 para outro número
```

### Mudar cores

Em `style.css`, procure `.review-read-more`:
```css
color: var(--verde-medio); /* mudar a cor aqui */
```

---

## 🚢 Para Produção

```bash
# Deploy do servidor (Vercel, Railway, etc)
vercel

# Depois atualize em script.js a URL do servidor
fetch('https://seu-backend.com/api/reviews')
```

---

## 💾 Importante

**Nunca commit o arquivo `.env`** (contém sua API key!)

Edite `.gitignore`:
```
.env
.env.local
```

---

## 🎯 Próximas Etapas

1. ✅ Confirmar que reviews aparecem
2. ✅ Testar no celular (responsive)
3. ✅ Limpar cache (Ctrl+Shift+Del)
4. ✅ Recarregar (Ctrl+F5)
5. ✅ Verificar nomes anonimizados
6. ✅ Verificar que não há API key no código
7. ✅ Deploy para produção

---

## 📞 Suporte Rápido

| Problema | Solução |
|----------|---------|
| "Cannot GET" | npm start (outro terminal) |
| "API key inválida" | Nova chave no Google Cloud |
| "Sem reviews" | Place ID correto? |
| "CORS error" | URL do servidor correta? |

---

## ⏱️ Resumo

```
npm install           ← 30s
Obter API key         ← 90s
Criar .env            ← 30s
npm start             ← 10s
Abrir site            ← 20s
─────────────────────
Total: ~3 minutos
```

---

## 🎉 Você está pronto!

O sistema de avaliações Google Maps está:

✅ Seguro (API key protegida)
✅ Rápido (cache 12h)
✅ Privado (nomes anonimizados)
✅ Elegante (design premium)
✅ Responsivo (funciona em mobile)

**Bora começar! 🚀**

---

**Perguntas? Veja a documentação completa:**
- REVIEWS_SETUP.md
- REVIEWS_INTEGRATION.md
