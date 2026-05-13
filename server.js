const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';
const publicDir = path.join(__dirname);
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

    callback(new Error('Origem nao permitida pelo CORS'));
  }
}));

app.use(express.json({ limit: '8kb' }));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use(express.static(publicDir, {
  extensions: ['html'],
  maxAge: isProduction ? '7d' : 0,
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

const reviewsCache = {
  data: null,
  timestamp: null,
  TTL: 6 * 60 * 60 * 1000
};

function getGooglePlacesApiKey() {
  return process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY;
}

function anonymizeName(fullName) {
  if (!fullName) return 'Paciente';
  const parts = fullName.split(' ');
  const firstName = parts[0];
  const lastName = parts[parts.length - 1];
  return `${firstName} ${lastName.charAt(0)}.`;
}

app.get('/api/reviews', async (req, res) => {
  try {
    if (reviewsCache.data && reviewsCache.timestamp) {
      const now = Date.now();
      if (now - reviewsCache.timestamp < reviewsCache.TTL) {
        return res.json({ data: reviewsCache.data, fromCache: true });
      }
    }

    const placeId = process.env.GOOGLE_PLACE_ID || 'ChIJS1n4d75ZzpQRinLG5WPTb_M';
    const apiKey = getGooglePlacesApiKey();

    if (!apiKey) {
      return res.status(500).json({
        error: 'API key nao configurada',
        message: 'Configure GOOGLE_PLACES_API_KEY no arquivo .env'
      });
    }

    const response = await axios.post(
      'https://maps.googleapis.com/maps/api/place/details/json',
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

      reviewsCache.data = reviews;
      reviewsCache.timestamp = Date.now();

      return res.json({
        data: reviews,
        fromCache: false,
        totalRatings: response.data.result.user_ratings_total,
        avgRating: response.data.result.rating
      });
    }

    return res.status(404).json({ error: 'Nenhuma avaliacao encontrada' });
  } catch (error) {
    console.error('Erro ao buscar reviews:', error.message);
    return res.status(500).json({
      error: 'Erro ao buscar avaliacoes',
      message: error.message
    });
  }
});

app.get('/api/place', async (req, res) => {
  try {
    const placeId = process.env.GOOGLE_PLACE_ID || 'ChIJS1n4d75ZzpQRinLG5WPTb_M';
    const apiKey = getGooglePlacesApiKey();

    if (!apiKey) {
      return res.status(500).json({
        error: 'API key nao configurada',
        message: 'Configure GOOGLE_PLACES_API_KEY no arquivo .env'
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
      return res.status(404).json({ error: 'Local nao encontrado' });
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
      message: 'Nao foi possivel carregar as informacoes do Google Places'
    });
  }
});

app.get('/api/place/photo/:reference', async (req, res) => {
  try {
    const apiKey = getGooglePlacesApiKey();
    const reference = req.params.reference;

    if (!apiKey || !reference) {
      return res.status(400).json({ error: 'Parametros invalidos' });
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', cache: reviewsCache.data ? 'populated' : 'empty' });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor seguro rodando em http://localhost:${PORT}`);
    console.log(`Endpoint: GET http://localhost:${PORT}/api/reviews`);
  });
}

module.exports = app;
