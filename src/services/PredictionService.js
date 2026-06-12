// 预测服务 — 预测提交/查询/排行榜
const { queryOne, queryAll, run } = require('../../db');

const predictionService = {
  /**
   * 提交预测
   */
  async submit(openid, { matchId, winner, homeScore, awayScore }) {
    if (!openid || !matchId || !winner) {
      throw Object.assign(new Error('缺少参数'), { code: 400 });
    }

    const match = await queryOne('SELECT * FROM matches WHERE id = ?', [matchId]);
    if (!match) throw Object.assign(new Error('比赛不存在'), { code: 404 });
    if (match.status === 'finished') throw Object.assign(new Error('比赛已结束'), { code: 400 });

    const existing = await queryOne(
      'SELECT id FROM predictions WHERE user_openid = ? AND match_id = ?', [openid, matchId]);
    if (existing) throw Object.assign(new Error('已预测过该比赛'), { code: 400 });

    await run(
      'INSERT INTO predictions (user_openid, match_id, winner, home_score, away_score) VALUES (?,?,?,?,?)',
      [openid, matchId, winner, homeScore || null, awayScore || null]);

    await run('INSERT INTO users (openid) VALUES (?) ON CONFLICT (openid) DO NOTHING', [openid]);

    return { message: '预测成功' };
  },

  /**
   * 获取用户的所有预测
   */
  async getUserPredictions(openid) {
    return queryAll(`
      SELECT p.*, m.home_name, m.away_name,
             m.home_score as match_home, m.away_score as match_away,
             m.status as match_status, m.stage
      FROM predictions p
      LEFT JOIN matches m ON p.match_id = m.id
      WHERE p.user_openid = ?
      ORDER BY p.created_at DESC
    `, [openid]);
  },

  /**
   * 预测排行榜
   */
  async getLeaderboard(limit = 50) {
    return queryAll(
      'SELECT nickname, avatar, points FROM users ORDER BY points DESC LIMIT ?', [limit]);
  },
};

module.exports = predictionService;
