// 淘汰赛引擎 — 真实对阵树生成 + 晋级推进
const { queryAll, queryOne, run } = require('../../db');

/**
 * 2026世界杯 48队淘汰赛结构:
 * 1/16决赛 (R32): 32队, 16场 → 1/8决赛 (R16): 16队, 8场
 * → 1/4决赛 (QF): 8队, 4场 → 半决赛 (SF): 4队, 2场
 * → 季军赛 (3RD): 2队, 1场 → 决赛 (F): 2队, 1场
 *
 * 晋级规则:
 *   R32-1 胜者 → R16-1
 *   R32-2 胜者 → R16-1
 *   R16-1 胜者 → QF-1
 *   ...
 *   SF-1 胜者   → F-1
 *   SF-1 负者   → 3RD-1
 */

// 淘汰赛轮次定义
const KO_STAGES = [
  { name: '1/16决赛', bracketPrefix: 'R32', matchCount: 16, stageOrder: 7,
    startDate: '2026-06-29', dateSpan: 4, gamesPerDay: 4 },
  { name: '1/8决赛',  bracketPrefix: 'R16', matchCount: 8,  stageOrder: 8,
    startDate: '2026-07-05', dateSpan: 4, gamesPerDay: 2 },
  { name: '1/4决赛',  bracketPrefix: 'QF',  matchCount: 4,  stageOrder: 9,
    startDate: '2026-07-10', dateSpan: 2, gamesPerDay: 2 },
  { name: '半决赛',   bracketPrefix: 'SF',  matchCount: 2,  stageOrder: 10,
    startDate: '2026-07-14', dateSpan: 2, gamesPerDay: 1 },
  { name: '季军赛',   bracketPrefix: '3RD', matchCount: 1,  stageOrder: 11,
    startDate: '2026-07-18', dateSpan: 1, gamesPerDay: 1 },
  { name: '决赛',     bracketPrefix: 'F',   matchCount: 1,  stageOrder: 12,
    startDate: '2026-07-19', dateSpan: 1, gamesPerDay: 1 },
];

// 晋级映射: R32-1 → R16-1, R32-2 → R16-1, ...
function getNextStage(bracketPosition) {
  const [prefix, num] = bracketPosition.split('-');
  const n = parseInt(num);

  const map = {
    'R32': { next: 'R16', nextNum: Math.ceil(n / 2) },
    'R16': { next: 'QF',  nextNum: Math.ceil(n / 2) },
    'QF':  { next: 'SF',  nextNum: Math.ceil(n / 2) },
    'SF':  n === 1 ? { next: 'F', nextNum: 1 } : { next: '3RD', nextNum: 1 },
    'F':   null,
    '3RD': null,
  };

  const mapping = map[prefix];
  if (!mapping) return null;
  return `${mapping.next}-${mapping.nextNum}`;
}

const TournamentEngine = {
  /**
   * 小组赛结束后，用晋级球队填充 1/16决赛
   * @param {{groupWinners, runnersUp, bestThirds}} qualified
   */
  async seedRoundOf32(qualified) {
    const { groupWinners, runnersUp, bestThirds } = qualified;

    // 合并32强: 24直接晋级 + 8最佳第3名
    const all32 = [];

    // 按组分配 (官方对阵表规则: A组第一 vs 最佳第3名, etc.)
    // 简化实现: 循环将球队放入 R32 slots
    const groups = 'ABCDEFGHIJKL'.split('');
    for (const g of groups) {
      const winner = groupWinners.find(w => w.group === g);
      const runner = runnersUp.find(r => r.group === g);
      if (winner) all32.push(winner);
      if (runner) all32.push(runner);
    }
    all32.push(...bestThirds);

    if (all32.length < 32) {
      console.warn(`[Engine] 仅 ${all32.length}/32 支球队确定，跳过 seeding`);
      return [];
    }

    // 分配到 R32 bracket slots
    const seeded = [];
    for (let i = 0; i < 16; i++) {
      const home = all32[i * 2];
      const away = all32[i * 2 + 1];
      if (!home || !away) continue;
      const pos = `R32-${i + 1}`;

      await run(`
        UPDATE matches SET
          home_id = ?, away_id = ?,
          home_name = ?, away_name = ?,
          home_flag = ?, away_flag = ?
        WHERE bracket_position = ?
      `, [home.teamId, away.teamId, home.name, away.name, home.flag, away.flag, pos]);

      seeded.push({ position: pos, home, away });
    }

    console.log(`[Engine] 1/16决赛 seeded: ${seeded.length} 场`);
    return seeded;
  },

  /**
   * 比赛结束后，确定胜者并推进到下一轮
   */
  async advanceWinner(matchId) {
    const match = await queryOne(
      'SELECT * FROM matches WHERE id = ? AND status = ?',
      [matchId, 'finished']
    );
    if (!match) throw new Error('比赛未结束或不存在');

    const bracketPos = match.bracket_position;
    if (!bracketPos) return null; // 不是淘汰赛

    const nextPos = getNextStage(bracketPos);
    if (!nextPos) {
      console.log(`[Engine] ${bracketPos} 已是最后一轮`);
      return null;
    }

    // 确定胜者
    const winner = match.home_score > match.away_score
      ? { id: match.home_id, name: match.home_name, flag: match.home_flag }
      : (match.away_score > match.home_score
        ? { id: match.away_id, name: match.away_name, flag: match.away_flag }
        : null);

    if (!winner) {
      console.warn(`[Engine] ${matchId} 平局，无法推进`);
      return null;
    }

    // 更新下一轮 (胜者填入 home 或 away slot)
    // R32-1 胜者 → R16-1 home, R32-2 胜者 → R16-1 away
    const slotNum = parseInt(bracketPos.split('-')[1]);
    const isHome = slotNum % 2 === 1;

    const field = isHome
      ? 'home_id = ?, home_name = ?, home_flag = ?'
      : 'away_id = ?, away_name = ?, away_flag = ?';

    await run(
      `UPDATE matches SET ${field} WHERE bracket_position = ?`,
      [winner.id, winner.name, winner.flag, nextPos]
    );

    console.log(`[Engine] ${bracketPos} 胜者 ${winner.name} → ${nextPos} ${isHome ? '主队' : '客队'}`);

    return { from: bracketPos, to: nextPos, winner, isHome };
  },

  /**
   * 生成完整淘汰赛对阵树
   */
  async getBracketTree() {
    const matches = await queryAll(
      "SELECT * FROM matches WHERE bracket_position IS NOT NULL ORDER BY bracket_position"
    );

    const rounds = {};
    for (const stage of KO_STAGES) {
      rounds[stage.bracketPrefix] = {
        name: stage.name,
        matches: matches.filter(m => m.bracket_position?.startsWith(stage.bracketPrefix)),
      };
    }

    return rounds;
  },

  /**
   * 生成淘汰赛日期
   */
  async generateKnockoutDates() {
    for (const stage of KO_STAGES) {
      for (let i = 1; i <= stage.matchCount; i++) {
        const pos = `${stage.bracketPrefix}-${i}`;
        const d = new Date(stage.startDate);
        const dayOffset = Math.floor((i - 1) / stage.gamesPerDay);
        d.setDate(d.getDate() + dayOffset);

        await run(
          'UPDATE matches SET match_date = ? WHERE bracket_position = ?',
          [d.toISOString(), pos]
        );
      }
    }
    console.log('[Engine] 淘汰赛日期已生成');
  },

  // 导出轮次定义供外部使用
  KO_STAGES,
};

module.exports = TournamentEngine;
