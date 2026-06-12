// 2026世界杯小程序后端 API v4.1
// Helmet · Rate Limit · Cache · Logger · Proxy · Scheduler
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { getDb } = require('./db');
const { logger, requestLogger } = require('./src/utils/logger');
const cache = require('./src/cache/CacheManager');

const app = express();
const PORT = process.env.PORT || 3456;

// ===== 安全中间件 =====
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-access-token'],
  maxAge: 86400,
}));

app.use(express.json({ limit: '100kb' }));

// ===== 限流 =====
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 42900, message: '请求过于频繁，请稍后再试' },
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: 42901, message: '请求过于频繁 (1分钟限制)' },
});

app.use(generalLimiter);
app.use('/api', apiLimiter);

// ===== 日志中间件 =====
app.use(requestLogger);

// ===== 健康检查 =====
app.get('/api/health', async (req, res) => {
  const { isPostgres } = require('./db');
  const version = require('./package.json').version;
  res.json({
    code: 0,
    data: {
      status: 'ok',
      uptime: process.uptime().toFixed(0) + 's',
      version,
      db: isPostgres ? 'postgresql' : 'sqlite',
      node: process.version,
      memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
    }
  });
});

// ===== 监控端点 =====
app.get('/api/health/stats', async (req, res) => {
  const { isPostgres } = require('./db');
  const cacheStats = cache.getStats();

  let poolStats = null;
  if (isPostgres) {
    try {
      const { getKnex } = require('./db');
      const k = await getKnex();
      const result = await k.raw('SELECT count(*) as active FROM pg_stat_activity WHERE state = ?', ['active']);
      poolStats = { activeConnections: result.rows[0]?.active || 0 };
    } catch {}
  }

  res.json({
    code: 0,
    data: {
      uptime: process.uptime().toFixed(0) + 's',
      memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      version: require('./package.json').version,
      db: isPostgres ? 'postgresql' : 'sqlite',
      cache: cacheStats,
      pool: poolStats,
    }
  });
});

// ===== API 路由 =====
app.use('/api/teams', require('./routes/teams'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/standings', require('./routes/standings'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./src/routes/admin'));

// API-Football 代理路由（需环境变量 API_FOOTBALL_KEY）
if (process.env.API_FOOTBALL_KEY) {
  app.use('/api/proxy', require('./routes/proxy'));
  console.log('[Server] API-Football 代理已启用');
} else {
  console.log('[Server] API-Football 代理未配置（缺少 API_FOOTBALL_KEY）');
}

// 通知端点（调度器状态查询）
const scheduler = require('./scheduler');
app.get('/api/notifications/status', (req, res) => {
  res.json({ code: 0, data: scheduler.getSchedulerStatus() });
});
app.get('/api/notifications/recent', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  res.json({ code: 0, data: scheduler.getRecentNotifications(limit) });
});

// ===== 404 & 错误处理 =====
app.use((req, res) => {
  res.status(404).json({ code: 404, message: 'API 不存在' });
});

app.use((err, req, res, next) => {
  logger.error({ err, url: req.originalUrl }, 'Unhandled error');
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      code: err.statusCode * 100,
      message: err.message || '请求错误',
    });
  }
  res.status(500).json({ code: 500, message: '服务器内部错误' });
});

// ===== 启动 =====
(async () => {
  await getDb();

  // 启动推送通知调度器
  scheduler.startScheduler();

  // 预加载热门数据到缓存
  try {
    await Promise.all([
      cache.getOrSet('teams:all', () =>
        require('./db').queryAll('SELECT * FROM teams ORDER BY grp, rank'), 3600_000),
      cache.getOrSet('schedule:today', async () => {
        const today = new Date().toISOString().slice(0, 10);
        return require('./db').queryAll(
          "SELECT * FROM matches WHERE date LIKE ? ORDER BY date", [today + '%']
        );
      }, 30_000),
    ]);
    logger.info('缓存预热完成');
  } catch (e) {
    logger.warn({ err: e.message }, '缓存预热部分失败');
  }

  app.listen(PORT, () => {
    const dbType = process.env.DATABASE_URL ? 'PostgreSQL' : 'SQLite';
    const hasWechat = !!(process.env.WECHAT_APPID && process.env.WECHAT_SECRET);
    const hasApiFootball = !!process.env.API_FOOTBALL_KEY;
    logger.info(`
╔══════════════════════════════════════════════╗
║      ⚽ 2026世界杯 API v4.1 ⚽               ║
║                                              ║
║  数据库: ${dbType.padEnd(28)}║
║  缓存:   LRU 500条                            ║
║  安全:   Helmet + RateLimit                   ║
║  登录:   ${(hasWechat ? '微信JWT' : '简化Token').padEnd(28)}║
║  代理:   ${(hasApiFootball ? 'API-Football' : '未配置').padEnd(28)}║
║  调度:   ${'已启用'.padEnd(28)}║
║  地址:   http://localhost:${String(PORT).padEnd(17)}║
║  监控:   /api/health/stats                    ║
╚══════════════════════════════════════════════╝
    `);
  });

  // 优雅关闭
  const shutdown = async (signal) => {
    logger.info(`${signal} — 正在关闭...`);
    scheduler.stopScheduler();
    const { close } = require('./db');
    await close();
    process.exit(0);
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
})();
