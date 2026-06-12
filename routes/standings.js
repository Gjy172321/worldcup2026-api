// 积分榜路由 v3.0 — 使用 GroupStageEngine
const express = require('express');
const router = express.Router();
const GroupStageEngine = require('../src/engine/GroupStageEngine');

router.get('/', async (req, res) => {
  const standings = await GroupStageEngine.calculateAll();
  res.json({ code: 0, data: standings });
});

router.get('/:group', async (req, res) => {
  const group = req.params.group.toUpperCase();
  if (!'ABCDEFGHIJKL'.includes(group)) {
    return res.json({ code: 404, message: '小组不存在' });
  }
  const standings = await GroupStageEngine.calculateGroup(group);
  res.json({ code: 0, data: { group, teams: standings } });
});

module.exports = router;
