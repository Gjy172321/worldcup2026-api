// 比赛服务 — 赛程查询/分组
const { queryAll, queryOne } = require('../../db');

const matchService = {
  /**
   * 赛程列表 (支持过滤)
   */
  async list({ stage, status, date, limit = 100, offset = 0 }) {
    let sql = 'SELECT * FROM matches WHERE 1=1';
    const params = [];
    if (stage)  { sql += ' AND stage = ?'; params.push(stage); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (date)   { sql += " AND date LIKE ?"; params.push(date + '%'); }
    sql += ' ORDER BY date LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    return queryAll(sql, params);
  },

  /**
   * 今日比赛
   */
  async getToday() {
    const today = new Date().toISOString().slice(0, 10);
    return queryAll("SELECT * FROM matches WHERE date LIKE ? ORDER BY date", [today + '%']);
  },

  /**
   * 按日期分组
   */
  async getGroupedByDate() {
    const matches = await queryAll('SELECT * FROM matches ORDER BY date');
    const grouped = {};
    matches.forEach(m => {
      const d = new Date(m.date);
      const key = `${d.getMonth() + 1}/${d.getDate()} ${['日', '一', '二', '三', '四', '五', '六'][d.getDay()]}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });
    return grouped;
  },

  /**
   * 比赛详情 (含两队信息)
   */
  async getById(matchId) {
    const match = await queryOne('SELECT * FROM matches WHERE id = ?', [matchId]);
    if (!match) return null;

    const [home, away] = await Promise.all([
      queryOne('SELECT * FROM teams WHERE id = ?', [match.home_id]),
      queryOne('SELECT * FROM teams WHERE id = ?', [match.away_id]),
    ]);

    return { ...match, home, away };
  },

  /**
   * 更新比分 (管理端)
   */
  async updateScore(matchId, { homeScore, awayScore, status }) {
    const { run } = require('../../db');
    await run(
      'UPDATE matches SET home_score = ?, away_score = ?, status = COALESCE(?, status) WHERE id = ?',
      [homeScore, awayScore, status, matchId]
    );
    return queryOne('SELECT * FROM matches WHERE id = ?', [matchId]);
  },

  /**
   * 获取淘汰赛比赛 (带 bracketPosition)
   */
  async getBracket() {
    return queryAll(
      "SELECT * FROM matches WHERE bracket_position IS NOT NULL ORDER BY bracket_position"
    );
  },
};

module.exports = matchService;
