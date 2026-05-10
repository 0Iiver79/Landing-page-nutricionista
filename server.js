const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!isProduction || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Origem não permitida pelo CORS'));
  }
}));

app.use(express.json({ limit: '8kb' }));
app.use(express.static(__dirname, {
  extensions: ['html'],
  maxAge: isProduction ? '7d' : 0,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Cache simples em memória
let reviewsCache = {
  data: null,
  timestamp: null,
  TTL: 6 * 60 * 60 * 1000 // 6 horas
};

// Função para anonimizar nomes
function anonymizeName(fullName) {
  if (!fullName) return 'Paciente';
  const parts = fullName.split(' ');
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName} ${lastName.charAt(0)}.`;
}

// Endpoint para buscar reviews do Google Places
app.get('/api/reviews', async (req, res) => {
  try {
    // Verifica cache
    if (reviewsCache.data && reviewsCache.timestamp) {
      const now = Date.now();
      if (now - reviewsCache.timestamp < reviewsCache.TTL) {
        return res.json({ data: reviewsCache.data, fromCache: true });
      }
    }

    const placeId = process.env.GOOGLE_PLACE_ID || 'ChIJS1n4d75ZzpQRinLG5WPTb_M';
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        error: 'API key não configurada',
        message: 'Configure GOOGLE_API_KEY no arquivo .env'
      });
    }

    const response = await axios.post(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {},
      {
        params: {
          place_id: placeId,
          key: apiKey,
          fields: 'reviews,rating,user_ratings_total'
        }
      }
    );

    if (response.data.result && response.data.result.reviews) {
      const reviews = response.data.result.reviews.map(review => ({
        author_name: anonymizeName(review.author_name),
        rating: review.rating,
        relative_time_description: review.relative_time_description,
        text: review.text,
        time: review.time
      }));

      // Atualiza cache
      reviewsCache.data = reviews;
      reviewsCache.timestamp = Date.now();

      return res.json({ 
        data: reviews,
        fromCache: false,
        totalRatings: response.data.result.user_ratings_total,
        avgRating: response.data.result.rating
      });
    } else {
      return res.status(404).json({ error: 'Nenhuma avaliação encontrada' });
    }

  } catch (error) {
    console.error('Erro ao buscar reviews:', error.message);
    return res.status(500).json({ 
      error: 'Erro ao buscar avaliações',
      message: error.message 
    });
  }
});

// Endpoint seguro para dados públicos do local, sem expor a API key no frontend
app.get('/api/place', async (req, res) => {
  try {
    const placeId = process.env.GOOGLE_PLACE_ID || 'ChIJS1n4d75ZzpQRinLG5WPTb_M';
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'API key não configurada',
        message: 'Configure GOOGLE_API_KEY no arquivo .env'
      });
    }

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          key: apiKey,
          fields: 'name,formatted_address,photos,url'
        },
        timeout: 8000
      }
    );

    const result = response.data.result;

    if (!result) {
      return res.status(404).json({ error: 'Local não encontrado' });
    }

    const photos = (result.photos || []).slice(0, 3).map(photo => ({
      reference: photo.photo_reference,
      width: photo.width,
      height: photo.height
    }));

    return res.json({
      data: {
        name: result.name,
        formatted_address: result.formatted_address,
        url: result.url,
        photos
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados do local:', error.message);
    return res.status(500).json({
      error: 'Erro ao buscar dados do local',
      message: 'Não foi possível carregar as informações do Google Places'
    });
  }
});

app.get('/api/place/photo/:reference', async (req, res) => {
  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const reference = req.params.reference;

    if (!apiKey || !reference) {
      return res.status(400).json({ error: 'Parâmetros inválidos' });
    }

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/photo',
      {
        params: {
          maxwidth: 1200,
          photo_reference: reference,
          key: apiKey
        },
        responseType: 'stream',
        timeout: 10000
      }
    );

    res.setHeader('Cache-Control', 'public, max-age=86400');
    response.data.pipe(res);
  } catch (error) {
    console.error('Erro ao buscar foto do local:', error.message);
    return res.status(500).json({ error: 'Erro ao buscar foto do local' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', cache: reviewsCache.data ? 'populated' : 'empty' });
});

app.listen(PORT, () => {
  console.log(`Servidor seguro rodando em http://localhost:${PORT}`);
  console.log(`Endpoint: GET http://localhost:${PORT}/api/reviews`);
});
