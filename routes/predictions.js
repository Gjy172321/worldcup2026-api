// 预测路由 v3.0 — 使用 Service 层
const express = require('express');
const router = express.Router();
const predictionService = require('../src/services/PredictionService');

router.post('/', async (req, res) => {
  try {
    const result = await predictionService.submit(req.body.openid, req.body);
    res.json({ code: 0, ...result });
  } catch (err) {
    res.json({ code: err.code || 500, message: err.message });
  }
});

router.get('/user/:openid', async (req, res) => {
  const predictions = await predictionService.getUserPredictions(req.params.openid);
  res.json({ code: 0, data: predictions });
});

router.get('/leaderboard', async (req, res) => {
  const lb = await predictionService.getLeaderboard();
  res.json({ code: 0, data: lb });
});

module.exports = router;
