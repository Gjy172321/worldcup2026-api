// 球队路由 v3.0 — 使用 Service 层
const express = require('express');
const router = express.Router();
const teamService = require('../src/services/TeamService');

router.get('/', async (req, res) => {
  const teams = await teamService.getAll(req.query.group);
  res.json({ code: 0, data: teams });
});

router.get('/:id', async (req, res) => {
  const team = await teamService.getById(req.params.id);
  if (!team) return res.json({ code: 404, message: '球队不存在' });
  res.json({ code: 0, data: team });
});

router.get('/:id/players', async (req, res) => {
  const players = await teamService.getPlayers(req.params.id);
  res.json({ code: 0, data: players });
});

module.exports = router;
