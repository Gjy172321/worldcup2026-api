// 小组赛引擎 — 积分计算 + 晋级判定
const { queryAll } = require('../../db');

const GroupStageEngine = {
  /**
   * 计算单个小组的积分榜
   * 排序规则: 积分 → 净胜球 → 进球数 → FIFA 排名
   */
  async calculateGroup(groupName) {
    const teams = await queryAll('SELECT * FROM teams WHERE grp = ?', [groupName]);
    if (teams.length === 0) return [];

    const stats = {};
    teams.forEach(t => {
      stats[t.id] = {
        teamId: t.id, name: t.name, en: t.en, flag: t.flag, color: t.color, group: groupName,
        played: 0, wins: 0, draws: 0, losses: 0,
        goalsFor: 0, goalsAgainst: 0, gd: 0, points: 0,
      };
    });

    const teamIds = teams.map(t => t.id);
    const placeholders = teamIds.map(() => '?').join(',');

    const matches = await queryAll(
      `SELECT * FROM matches WHERE status = 'finished' 
       AND home_id IN (${placeholders}) AND away_id IN (${placeholders})`,
      [...teamIds, ...teamIds]
    );

    matches.forEach(m => {
      const h = stats[m.home_id], a = stats[m.away_id];
      if (!h || !a) return;
      h.played++; a.played++;
      h.goalsFor += m.home_score; h.goalsAgainst += m.away_score;
      a.goalsFor += m.away_score; a.goalsAgainst += m.home_score;
      if (m.home_score > m.away_score)      { h.wins++; h.points += 3; a.losses++; }
      else if (m.home_score < m.away_score) { a.wins++; a.points += 3; h.losses++; }
      else                                   { h.draws++; a.draws++; h.points++; a.points++; }
    });

    const standings = Object.values(stats).map(s => ({
      ...s,
      gd: s.goalsFor - s.goalsAgainst,
    }));

    // FIFA 排序规则
    standings.sort((a, b) =>
      b.points - a.points ||
      b.gd - a.gd ||
      b.goalsFor - a.goalsFor
    );

    return standings.map((s, i) => ({ ...s, rank: i + 1 }));
  },

  /**
   * 计算所有小组积分榜
   */
  async calculateAll() {
    const groups = 'ABCDEFGHIJKL'.split('');
    const all = {};
    for (const g of groups) {
      all[g] = await this.calculateGroup(g);
    }
    return all;
  },

  /**
   * 确定晋级淘汰赛的 32 支球队
   * 2026世界杯: 每组前2名(24队) + 8个最佳第3名
   */
  async determineQualifiers() {
    const allStandings = await this.calculateAll();
    const groupWinners = [];
    const runnersUp = [];
    const thirdPlaced = [];

    for (const group of Object.keys(allStandings)) {
      const s = allStandings[group];
      if (s.length < 3) continue;
      groupWinners.push(s[0]);
      runnersUp.push(s[1]);
      thirdPlaced.push(s[2]);
    }

    // 最佳第3名排名
    thirdPlaced.sort((a, b) =>
      b.points - a.points ||
      b.gd - a.gd ||
      b.goalsFor - a.goalsFor
    );

    const bestThirds = thirdPlaced.slice(0, 8);

    return { groupWinners, runnersUp, bestThirds };
  },

  /**
   * 小组赛是否全部结束
   */
  async isGroupStageComplete() {
    const count = await queryAll(
      "SELECT COUNT(*) as c FROM matches WHERE stage LIKE '小组赛%' AND status != 'finished'"
    );
    return count[0]?.c === 0;
  },
};

module.exports = GroupStageEngine;
