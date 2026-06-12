// JWT 认证中间件
// 生产环境: 使用 jsonwebtoken + 微信 jscode2session
// 本地开发: 使用简化 token 兼容旧 API
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'worldcup2026_dev_secret';
const JWT_EXPIRES = '24h';

/**
 * 生成 JWT Token
 */
function generateToken(user) {
  return jwt.sign(
    {
      sub: user.openid || user.id,
      openid: user.openid,
      nickname: user.nickname,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );
}

/**
 * 解析 JWT Token (从请求头提取)
 */
function extractToken(req) {
  // 1. Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // 2. 兼容旧版: tok_ 前缀
  const oldToken = req.headers['x-access-token'];
  if (oldToken) return oldToken;

  return null;
}

/**
 * 必需认证中间件 (401)
 */
function requireAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ code: 40100, message: '未登录' });
  }

  // 兼容旧版 token (tok_ 前缀)
  if (token.startsWith('tok_')) {
    req.user = { openid: token.slice(4) };
    return next();
  }

  // JWT 验证
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ code: 40101, message: '登录已过期' });
  }
}

/**
 * 可选认证中间件 (不强制登录)
 */
function optionalAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  if (token.startsWith('tok_')) {
    req.user = { openid: token.slice(4) };
    return next();
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    req.user = null;
  }
  next();
}

/**
 * 管理后台认证 (API Key)
 */
function adminAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  const validKey = process.env.ADMIN_API_KEY || 'admin_dev_key';

  if (!apiKey || apiKey !== validKey) {
    return res.status(403).json({ code: 40300, message: '无权限' });
  }
  next();
}

module.exports = { generateToken, extractToken, requireAuth, optionalAuth, adminAuth };
