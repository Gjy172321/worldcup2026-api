// 管理后台路由 — 比分更新 / 结算 / 引擎操作
const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const matchService = require('../services/MatchService');
const GroupStageEngine = require('../engine/GroupStageEngine');
const TournamentEngine = require('../engine/TournamentEngine');
const ScoringEngine = require('../engine/ScoringEngine');

// 所有操作需要 API Key
router.use(adminAuth);

// PUT /api/admin/matches/:id/score — 更新比分
router.put('/matches/:id/score', async (req, res) => {
  try {
    const match = await matchService.updateScore(req.params.id, req.body);
    if (!match) return res.json({ code: 404, message: '比赛不存在' });

    // 如果比赛结束，自动结算预测
    if (req.body.status === 'finished') {
      const result = await ScoringEngine.settleMatch(req.params.id);
      console.log(`[Admin] 自动结算 ${result.settled} 条预测, +${result.totalPoints}分`);
    }

    res.json({ code: 0, data: match });
  } catch (err) {
    res.json({ code: 500, message: err.message });
  }
});

// POST /api/admin/matches/:id/settle — 手动结算预测
router.post('/matches/:id/settle', async (req, res) => {
  try {
    const result = await ScoringEngine.settleMatch(req.params.id);
    res.json({ code: 0, data: result });
  } catch (err) {
    res.json({ code: 500, message: err.message });
  }
});

// GET /api/admin/bracket — 查看淘汰赛对阵
router.get('/bracket', async (req, res) => {
  const tree = await TournamentEngine.getBracketTree();
  res.json({ code: 0, data: tree });
});

// POST /api/admin/bracket/seed — 填充 1/16决赛
router.post('/bracket/seed', async (req, res) => {
  const qualified = await GroupStageEngine.determineQualifiers();
  const seeded = await TournamentEngine.seedRoundOf32(qualified);
  res.json({ code: 0, data: { qualified, seeded } });
});

// POST /api/admin/bracket/dates — 生成淘汰赛日期
router.post('/bracket/dates', async (req, res) => {
  await TournamentEngine.generateKnockoutDates();
  res.json({ code: 0, message: '日期已生成' });
});

// POST /api/admin/matches/:id/advance — 推进晋级
router.post('/matches/:id/advance', async (req, res) => {
  try {
    const result = await TournamentEngine.advanceWinner(req.params.id);
    res.json({ code: 0, data: result });
  } catch (err) {
    res.json({ code: 500, message: err.message });
  }
});

// GET /api/admin/qualifiers — 查看晋级球队
router.get('/qualifiers', async (req, res) => {
  const qualifiers = await GroupStageEngine.determineQualifiers();
  res.json({ code: 0, data: qualifiers });
});

// GET /api/admin/group-stage-status — 小组赛完成度
router.get('/group-stage-status', async (req, res) => {
  const complete = await GroupStageEngine.isGroupStageComplete();
  const all = await GroupStageEngine.calculateAll();
  const totalFinished = Object.values(all).reduce(
    (sum, group) => sum + group.filter(t => t.played === 3).length, 0
  );
  res.json({
    code: 0,
    data: {
      complete,
      totalTeams: 48,
      finishedTeams: totalFinished,
      progress: `${totalFinished}/48`,
    }
  });
});

module.exports = router;
