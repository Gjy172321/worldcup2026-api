// 球队服务 — 业务逻辑层 (含 L1 缓存)
const { queryAll, queryOne } = require('../../db');
const cache = require('../cache/CacheManager');

const TTL = { TEAMS: 3600_000, TEAM_DETAIL: 600_000 }; // 1小时 / 10分钟

const teamService = {
  async getAll(group) {
    const cacheKey = group ? `teams:group:${group}` : 'teams:all';
    return cache.getOrSet(cacheKey, async () => {
      if (group) {
        return queryAll('SELECT * FROM teams WHERE grp = ? ORDER BY rank', [group]);
      }
      return queryAll('SELECT * FROM teams ORDER BY grp, rank');
    }, TTL.TEAMS);
  },

  async getById(teamId) {
    return cache.getOrSet(`teams:${teamId}`, async () => {
      const team = await queryOne('SELECT * FROM teams WHERE id = ?', [teamId]);
      if (!team) return null;
      const [players, rivals, matches] = await Promise.all([
        queryAll('SELECT * FROM players WHERE team_id = ?', [teamId]),
        queryAll('SELECT * FROM teams WHERE grp = ? AND id != ?', [team.grp, teamId]),
        queryAll('SELECT * FROM matches WHERE home_id = ? OR away_id = ? ORDER BY date', [teamId, teamId]),
      ]);
      return { ...team, players, rivals, matches };
    }, TTL.TEAM_DETAIL);
  },

  async getPlayers(teamId) {
    return cache.getOrSet(`players:${teamId}`, () =>
      queryAll('SELECT * FROM players WHERE team_id = ?', [teamId]), TTL.TEAMS);
  },

  async getGroups() {
    return queryAll('SELECT DISTINCT grp FROM teams ORDER BY grp');
  },
};

module.exports = teamService;
