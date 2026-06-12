// 用户路由 v3.0 — 使用 Service + JWT Auth
const express = require('express');
const router = express.Router();
const userService = require('../src/services/UserService');
const { generateToken } = require('../src/middleware/auth');

// 登录 (兼容旧版 + 微信 jscode2session)
router.post('/login', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.json({ code: 400, message: '缺少登录凭证' });

  try {
    // 尝试微信登录 (如果配置了 WECHAT_APPID)
    if (process.env.WECHAT_APPID && process.env.WECHAT_SECRET) {
      const user = await userService.wechatLogin(code);
      const token = generateToken(user);
      return res.json({ code: 0, data: { ...user, token } });
    }
  } catch (e) {
    console.warn('[Auth] 微信登录失败，降级到简化模式:', e.message);
  }

  // 简化登录 (兼容旧版)
  const user = await userService.simpleLogin(code);
  res.json({ code: 0, data: user });
});

// 获取用户资料
router.get('/:openid/profile', async (req, res) => {
  const user = await userService.getProfile(req.params.openid);
  if (!user) return res.json({ code: 404, message: '用户不存在' });
  res.json({ code: 0, data: user });
});

// 更新用户资料
router.put('/:openid/profile', async (req, res) => {
  const user = await userService.updateProfile(req.params.openid, req.body);
  res.json({ code: 0, data: user });
});

// 同步收藏
router.post('/:openid/favorites', async (req, res) => {
  const { teams } = req.body;
  if (!Array.isArray(teams)) return res.json({ code: 400, message: 'teams 需为数组' });
  await userService.saveFavorites(req.params.openid, teams);
  res.json({ code: 0, data: { favorites: teams } });
});

// 获取收藏
router.get('/:openid/favorites', async (req, res) => {
  const favorites = await userService.getFavorites(req.params.openid);
  res.json({ code: 0, data: favorites });
});

// 更新积分
router.post('/:openid/points', async (req, res) => {
  const { points, reason } = req.body;
  const result = await userService.addPoints(req.params.openid, points || 0, reason);
  res.json({ code: 0, data: result });
});

// 排行榜
router.get('/leaderboard', async (req, res) => {
  const top = await userService.getLeaderboard(100);
  res.json({ code: 0, data: top });
});

module.exports = router;
