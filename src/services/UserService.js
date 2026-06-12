// 用户服务 — 认证 + 资料 + 收藏 + 积分
const { queryOne, queryAll, run } = require('../../db');

const userService = {
  /**
   * 简化登录 (兼容旧 API)
   */
  async simpleLogin(code) {
    const openid = 'wx_' + simpleHash(code);

    let user = await queryOne('SELECT * FROM users WHERE openid = ?', [openid]);
    if (!user) {
      const nickname = '球迷' + Math.floor(Math.random() * 9000 + 1000);
      await run(
        'INSERT INTO users (openid, nickname, points) VALUES (?, ?, 0) ON CONFLICT (openid) DO NOTHING',
        [openid, nickname]);
      user = { openid, nickname, avatar: '', points: 0 };
    }

    return {
      openid: user.openid,
      nickname: user.nickname,
      avatar: user.avatar || '',
      points: user.points || 0,
      favorites: parseFavorites(user.favorites),
      token: 'tok_' + openid,
    };
  },

  /**
   * 微信 jscode2session 登录 (生产环境)
   */
  async wechatLogin(code) {
    const axios = require('axios');
    const { data } = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: process.env.WECHAT_APPID,
        secret: process.env.WECHAT_SECRET,
        js_code: code,
        grant_type: 'authorization_code',
      },
    });

    if (data.errcode) {
      throw new Error(`微信登录失败: ${data.errmsg}`);
    }

    const { openid, unionid } = data;

    let user = await queryOne('SELECT * FROM users WHERE openid = ?', [openid]);
    if (!user) {
      const nickname = '球迷' + Math.floor(Math.random() * 9000 + 1000);
      await run('INSERT INTO users (openid, nickname, unionid) VALUES (?, ?, ?) ON CONFLICT (openid) DO NOTHING',
        [openid, nickname, unionid || null]);
      user = { openid, nickname, avatar: '', points: 0 };
    }

    return {
      openid: user.openid,
      nickname: user.nickname,
      avatar: user.avatar || '',
      points: user.points || 0,
      favorites: parseFavorites(user.favorites),
    };
  },

  /**
   * 获取用户资料
   */
  async getProfile(openid) {
    const user = await queryOne('SELECT * FROM users WHERE openid = ?', [openid]);
    if (!user) return null;
    return {
      openid: user.openid,
      nickname: user.nickname,
      avatar: user.avatar,
      points: user.points,
      favorites: parseFavorites(user.favorites),
      createdAt: user.created_at,
    };
  },

  /**
   * 更新用户资料
   */
  async updateProfile(openid, { nickname, avatar }) {
    if (nickname) await run('UPDATE users SET nickname = ? WHERE openid = ?', [nickname, openid]);
    if (avatar !== undefined) await run('UPDATE users SET avatar = ? WHERE openid = ?', [avatar, openid]);
    return queryOne('SELECT * FROM users WHERE openid = ?', [openid]);
  },

  /**
   * 获取收藏
   */
  async getFavorites(openid) {
    const user = await queryOne('SELECT favorites FROM users WHERE openid = ?', [openid]);
    return user ? parseFavorites(user.favorites) : [];
  },

  /**
   * 同步收藏
   */
  async saveFavorites(openid, teams) {
    await run('INSERT INTO users (openid) VALUES (?) ON CONFLICT (openid) DO NOTHING', [openid]);
    await run('UPDATE users SET favorites = ? WHERE openid = ?', [JSON.stringify(teams), openid]);
    return teams;
  },

  /**
   * 增加积分
   */
  async addPoints(openid, points, reason) {
    await run('UPDATE users SET points = points + ? WHERE openid = ?', [points, openid]);
    const user = await queryOne('SELECT points FROM users WHERE openid = ?', [openid]);
    return { points: user?.points || 0, added: points, reason };
  },

  /**
   * 排行榜
   */
  async getLeaderboard(limit = 100) {
    return queryAll(
      'SELECT nickname, points, avatar FROM users WHERE points > 0 ORDER BY points DESC LIMIT ?', [limit]);
  },
};

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).slice(0, 16);
}

function parseFavorites(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.favorites)) {
      return parsed.favorites;
    }
    if (Array.isArray(parsed)) return parsed;
  } catch {}
  return [];
}

module.exports = userService;
