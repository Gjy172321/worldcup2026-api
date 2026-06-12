// 种子数据: 导入 2026 世界杯真实数据
// 数据源: server/seed-data.js (唯一数据源)
const path = require('path');
const { TEAMS, PLAYERS, SCHEDULE } = require('../seed-data');

exports.seed = async function (knex) {
  // 清空现有数据
  await knex('predictions').del();
  await knex('users').del();
  await knex('matches').del();
  await knex('players').del();
  await knex('teams').del();

  // 导入球队
  const teamRows = TEAMS.map(t => ({
    id: t.id,
    name: t.name,
    en: t.en,
    flag: t.flag,
    grp: t.group,
    rank: t.rank,
    color: t.color,
  }));
  await knex.batchInsert('teams', teamRows, 50);
  console.log(`  ✓ ${teamRows.length} 支球队`);

  // 导入球员
  const playerRows = [];
  for (const [teamId, players] of Object.entries(PLAYERS)) {
    for (const p of players) {
      playerRows.push({
        team_id: teamId,
        name: p.name,
        en: p.en,
        pos: p.pos,
        age: p.age,
        number: p.number,
        club: p.club,
        goals: p.goals,
      });
    }
  }
  await knex.batchInsert('players', playerRows, 50);
  console.log(`  ✓ ${playerRows.length} 名球员`);

  // 导入赛程
  const matchRows = SCHEDULE.map(m => ({
    id: m.id,
    home_id: m.homeId,
    away_id: m.awayId,
    home_name: m.homeName,
    away_name: m.awayName,
    home_flag: m.homeFlag,
    away_flag: m.awayFlag,
    stage: m.stage,
    date: m.date,
    stadium: m.stadium,
    home_score: m.homeScore,
    away_score: m.awayScore,
    status: m.status,
    minute: m.minute,
    bracket_position: m.bracketPosition || null,
  }));
  await knex.batchInsert('matches', matchRows, 50);
  console.log(`  ✓ ${matchRows.length} 场比赛`);
  console.log('  种子数据导入完成 ✅');
};
