// 结构化日志 (基于 pino)
const pino = require('pino');

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' },
  } : undefined,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      ip: req.ip,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
    err: pino.stdSerializers.err,
  },
});

/**
 * Express 请求日志中间件
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    if (req.url === '/api/health') return; // 跳过健康检查

    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms,
    }, `${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}

module.exports = { logger, requestLogger };
