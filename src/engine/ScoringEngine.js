// 预测积分结算引擎
// 规则: 猜对胜负+10 | 猜对比分+25 | 淘汰赛×1.5 | 连胜加成
const { queryAll, run } = require('../../db');

const ScoringEngine = {
  /**
   * 结算单条预测
   */
  settle(prediction, match, streak = 0) {
    let points = 0;
    let isCorrect = false;

    // 确定实际胜者
    const actualWinner = match.home_score > match.away_score
      ? match.home_id
      : (match.away_score > match.home_score
        ? match.away_id
        : 'draw');

    // 1. 猜对胜负 → +10
    if (prediction.winner === actualWinner) {
      points += 10;
      isCorrect = true;
    }

    // 2. 猜对比分 → +25 (额外叠加)
    if (prediction.home_score === match.home_score &&
        prediction.away_score === match.away_score) {
      points += 25;
    }

    // 3. 淘汰赛加成 (stage_order >= 7 即 1/16决赛起)
    if (match.stage_order >= 7) {
      points = Math.floor(points * 1.5);
    }

    // 4. 连胜加成
    if (isCorrect && streak >= 2) {
      const multiplier = streak >= 5 ? 1.5 : streak >= 3 ? 1.2 : 1.1;
      points = Math.floor(points * multiplier);
    }

    return { points, isCorrect };
  },

  /**
   * 批量结算某场比赛
   */
  async settleMatch(matchId) {
    const { queryOne } = require('../../db');
    const match = await queryOne('SELECT * FROM matches WHERE id = ? AND status = ?', [matchId, 'finished']);
    if (!match) throw new Error('比赛未结束');

    const predictions = await queryAll(
      'SELECT * FROM predictions WHERE match_id = ?', [matchId]
    );

    let totalSettled = 0;
    let totalPoints = 0;

    for (const pred of predictions) {
      // 已结算的跳过
      if (pred.is_correct !== null) continue;

      // 获取用户连胜
      const streak = await this._getStreak(pred.user_openid);

      const { points, isCorrect } = this.settle(pred, match, streak);

      // 更新预测结果
      await run(
        'UPDATE predictions SET points_earned = ?, is_correct = ? WHERE id = ?',
        [points, isCorrect ? 1 : 0, pred.id]
      );

      // 增加用户积分
      if (points > 0) {
        await run('UPDATE users SET points = points + ? WHERE openid = ?', [points, pred.user_openid]);
      }

      totalSettled++;
      totalPoints += points;
    }

    return { matchId, settled: totalSettled, totalPoints };
  },

  /**
   * 获取用户连胜场次
   */
  async _getStreak(openid) {
    const recent = await queryAll(`
      SELECT p.is_correct, m.match_date
      FROM predictions p
      JOIN matches m ON p.match_id = m.id
      WHERE p.user_openid = ? AND m.status = 'finished'
      ORDER BY m.match_date DESC
      LIMIT 20
    `, [openid]);

    let streak = 0;
    for (const r of recent) {
      if (r.is_correct) streak++;
      else break;
    }
    return streak;
  },
};

module.exports = ScoringEngine;
