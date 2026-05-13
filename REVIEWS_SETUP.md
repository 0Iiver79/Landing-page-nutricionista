# reviews_setup.md

# Sistema de Avaliações Google — Dra. Ana Beatriz

## Sobre a integração

O site utiliza integração com avaliações do Google Maps para exibir depoimentos reais de pacientes de forma dinâmica e segura, mantendo o visual alinhado com a identidade premium da marca.

A implementação foi pensada para preservar desempenho, privacidade e uma experiência fluida em desktop e mobile.

---

## Como funciona

1. O frontend faz uma requisição para `/api/reviews`
2. O servidor consulta a Google Places API
3. Os dados são tratados antes do envio
4. O frontend renderiza os depoimentos dinamicamente

---

## Instalação

### Instalar dependências

```bash
npm install
```

Dependências utilizadas:

* express
* axios
* cors
* dotenv

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
GOOGLE_API_KEY=sua_chave_aqui
GOOGLE_PLACE_ID=ChIJS1n4d75ZzpQRinLG5WPTb_M

PORT=3001
NODE_ENV=production
```

---

## Configuração da API Google

1. Acesse o Google Cloud Console
2. Ative a Places API
3. Gere uma chave de API
4. Adicione a chave no arquivo `.env`

---

## Executando localmente

```bash
npm start
```

Servidor:

```bash
http://localhost:3001
```

Endpoint:

```bash
GET /api/reviews
```

---

## Segurança

A chave da API não fica exposta no frontend.

O backend atua como intermediador entre o site e a Google Places API, permitindo:

* proteção da chave
* controle das requisições
* cache local temporário
* redução de chamadas desnecessárias

Adicione o `.env` ao `.gitignore`:

```gitignore
.env
```

---

## Privacidade

* Nenhuma informação é armazenada permanentemente
* Os dados são utilizados apenas para exibição das avaliações
* Nomes podem ser parcialmente abreviados quando necessário

---

## Recursos implementados

* Cache local temporário para reduzir requisições repetidas
* Expansão de textos longos com opção de “Ler mais”
* Microinterações suaves nos cards
* Renderização dinâmica das avaliações
* Compatibilidade com desktop e mobile

---

## Deploy

Após publicar o backend, atualize a URL da requisição no frontend:

```javascript
fetch('https://sua-api.com/api/reviews')
```

---

## Considerações finais

A integração foi desenvolvida para manter segurança da API, boa performance e consistência visual sem comprometer a experiência do usuário.
