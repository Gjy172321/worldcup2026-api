// 赛程路由 v3.0 — 使用 Service 层
const express = require('express');
const router = express.Router();
const matchService = require('../src/services/MatchService');

router.get('/', async (req, res) => {
  const matches = await matchService.list(req.query);
  res.json({ code: 0, data: matches });
});

router.get('/today', async (req, res) => {
  const matches = await matchService.getToday();
  res.json({ code: 0, data: matches });
});

router.get('/grouped/by-date', async (req, res) => {
  const grouped = await matchService.getGroupedByDate();
  res.json({ code: 0, data: grouped });
});

router.get('/bracket', async (req, res) => {
  const bracket = await matchService.getBracket();
  res.json({ code: 0, data: bracket });
});

router.get('/:id', async (req, res) => {
  const match = await matchService.getById(req.params.id);
  if (!match) return res.json({ code: 404, message: '比赛不存在' });
  res.json({ code: 0, data: match });
});

module.exports = router;
