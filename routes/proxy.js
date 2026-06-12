// API-Football 代理路由 — 绕过微信域名白名单限制
const express = require('express');
const router = express.Router();

const API_CONFIG = {
  baseUrl: 'https://v3.football.api-sports.io',
  key: process.env.API_FOOTBALL_KEY || '',  // 通过环境变量注入
};

// 本地内存缓存（服务端侧，30分钟TTL）
const _serverCache = {};
const CACHE_TTL = 30 * 60 * 1000; // 30分钟

function getCached(key) {
  const entry = _serverCache[key];
  if (entry && entry.expires > Date.now()) return entry.data;
  return null;
}

function setCache(key, data) {
  _serverCache[key] = { data, expires: Date.now() + CACHE_TTL };
}

// 代理请求到 API-Football
async function proxyToApiFootball(endpoint, params = {}) {
  const cacheKey = `af_${endpoint}_${JSON.stringify(params)}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = new URL(endpoint, API_CONFIG.baseUrl);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));

  try {
    const resp = await fetch(url.toString(), {
      headers: {
        'x-apisports-key': API_CONFIG.key,
        'Accept': 'application/json',
      },
    });

    if (!resp.ok) {
      console.error(`[Proxy] API-Football ${endpoint} → ${resp.status}`);
      return null;
    }

    const data = await resp.json();
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error(`[Proxy] API-Football 错误:`, data.errors);
      return null;
    }

    setCache(cacheKey, data);
    console.log(`[Proxy] ${endpoint} → ${data.results}条记录`);
    return data;
  } catch (err) {
    console.error(`[Proxy] ${endpoint} 请求失败:`, err.message);
    return null;
  }
}

// GET /api/proxy/teams
router.get('/teams', async (req, res) => {
  const data = await proxyToApiFootball('/teams', {
    league: req.query.league || 1,
    season: req.query.season || 2026,
  });
  res.json({ code: data ? 0 : -1, data: data?.response || [], results: data?.results || 0 });
});

// GET /api/proxy/fixtures
router.get('/fixtures', async (req, res) => {
  const data = await proxyToApiFootball('/fixtures', {
    league: req.query.league || 1,
    season: req.query.season || 2026,
    ...(req.query.date ? { date: req.query.date } : {}),
    ...(req.query.team ? { team: req.query.team } : {}),
  });
  res.json({ code: data ? 0 : -1, data: data?.response || [], results: data?.results || 0 });
});

// GET /api/proxy/standings
router.get('/standings', async (req, res) => {
  const data = await proxyToApiFootball('/standings', {
    league: req.query.league || 1,
    season: req.query.season || 2026,
  });
  res.json({ code: data ? 0 : -1, data: data?.response || [], results: data?.results || 0 });
});

// GET /api/proxy/fixtures/events/:id
router.get('/fixtures/events/:id', async (req, res) => {
  const data = await proxyToApiFootball('/fixtures/events', {
    fixture: req.params.id,
  });
  res.json({ code: data ? 0 : -1, data: data?.response || [], results: data?.results || 0 });
});

// 缓存状态
router.get('/cache-status', (req, res) => {
  const keys = Object.keys(_serverCache);
  const entries = keys.map(k => ({
    key: k,
    expires: new Date(_serverCache[k].expires).toISOString(),
    expired: _serverCache[k].expires < Date.now(),
  }));
  res.json({ code: 0, data: { total: keys.length, entries } });
});

module.exports = router;
