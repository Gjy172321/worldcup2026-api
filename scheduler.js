// 推送通知调度器 - 定时检查比赛状态并触发通知
// 实际生产环境需接入微信服务端API发送订阅消息
const { queryAll, run } = require('./db');

// 调度状态
let _schedulerRunning = false;
let _intervalId = null;
const _notificationLog = [];

// 启动调度器
function startScheduler() {
  if (_schedulerRunning) return;
  _schedulerRunning = true;

  console.log('[Scheduler] 推送通知调度器已启动 (每60秒检查)');

  // 立即执行一次
  checkAndNotify();

  // 每60秒检查一次
  _intervalId = setInterval(checkAndNotify, 60000);
}

// 停止调度器
function stopScheduler() {
  if (_intervalId) { clearInterval(_intervalId); _intervalId = null; }
  _schedulerRunning = false;
  console.log('[Scheduler] 调度器已停止');
}

// 核心检查逻辑
function checkAndNotify() {
  const now = new Date();
  const nowISO = now.toISOString();
  const in35Min = new Date(now.getTime() + 35 * 60000).toISOString();
  const justFinished = new Date(now.getTime() - 5 * 60000).toISOString();

  try {
    // 1. 30分钟内即将开始的比赛 → 开赛提醒
    const upcomingMatches = queryAll(
      `SELECT * FROM matches WHERE status = 'upcoming' AND date > ? AND date < ? ORDER BY date`,
      [nowISO, in35Min]
    );

    upcomingMatches.forEach(match => {
      const minutesToKickoff = Math.round((new Date(match.date) - now) / 60000);
      if (minutesToKickoff > 0 && minutesToKickoff <= 35) {
        logNotification('matchReminder', match, {
          title: `⚽ ${match.home_name} VS ${match.away_name}`,
          desc: `将在 ${minutesToKickoff} 分钟后开赛`,
          stage: match.stage,
          stadium: match.stadium,
        });
      }
    });

    // 2. 直播中的比赛 → 进球提醒
    const liveMatches = queryAll(`SELECT * FROM matches WHERE status = 'live'`, []);

    liveMatches.forEach(match => {
      const lastCheck = _lastGoalCheck[match.id] || 0;
      if (now.getTime() - lastCheck > 60000) {
        _lastGoalCheck[match.id] = now.getTime();
        const prevScore = _matchScores[match.id];
        const currScore = `${match.home_score}-${match.away_score}`;
        if (prevScore && prevScore !== currScore) {
          logNotification('goalAlert', match, {
            title: `⚡ ${match.home_name} ${match.home_score}-${match.away_score} ${match.away_name}`,
            desc: `比分已更新！当前 ${match.minute || '?'}'`,
          });
        }
        _matchScores[match.id] = currScore;
      }
    });

    // 3. 刚结束的比赛 → 结果通知
    const finishedRecently = queryAll(
      `SELECT * FROM matches WHERE status = 'finished' AND date > ? ORDER BY date DESC`,
      [justFinished]
    );

    finishedRecently.forEach(match => {
      if (_notifiedMatches.has(match.id)) return;
      _notifiedMatches.add(match.id);

      logNotification('resultNotify', match, {
        title: `🏁 ${match.home_name} ${match.home_score}-${match.away_score} ${match.away_name}`,
        desc: '比赛已结束，点击查看详情',
        stage: match.stage,
      });

      // 预测结果结算
      const predictions = queryAll(`SELECT * FROM predictions WHERE match_id = ?`, [match.id]);
      predictions.forEach(pred => {
        const actualHomeWin = match.home_score > match.away_score;
        const actualDraw = match.home_score === match.away_score;
        const predCorrect =
          (actualHomeWin && pred.winner === match.home_id) ||
          (!actualHomeWin && !actualDraw && pred.winner === match.away_id) ||
          (actualDraw && pred.winner === 'draw');

        const exactScore = pred.home_score === match.home_score && pred.away_score === match.away_score;
        const points = predCorrect ? (5 + (exactScore ? 10 : 0)) : 0;

        logNotification('predictionResult', match, {
          title: predCorrect ? '✅ 预测命中！' : '❌ 预测未中',
          desc: predCorrect ? `恭喜获得 +${points} 积分` : '继续加油！',
          openid: pred.user_openid,
          points,
        });

        if (points > 0 && pred.user_openid) {
          run(`UPDATE users SET points = points + ? WHERE openid = ?`, [points, pred.user_openid]);
        }
      });
    });

    // 清理
    if (_notificationLog.length > 500) { _notificationLog.splice(0, 200); }

  } catch (err) {
    console.error('[Scheduler] 检查失败:', err.message);
  }
}

function logNotification(type, match, data) {
  const entry = {
    id: `notify_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type, matchId: match.id,
    homeName: match.home_name, awayName: match.away_name,
    data, createdAt: new Date().toISOString(), delivered: false,
  };
  _notificationLog.unshift(entry);
  console.log(`[Notify] ${type}: ${match.home_name} vs ${match.away_name} — ${data.title}`);
}

const _lastGoalCheck = {};
const _matchScores = {};
const _notifiedMatches = new Set();

function getRecentNotifications(limit = 20) { return _notificationLog.slice(0, limit); }
function markDelivered(notificationId) {
  const entry = _notificationLog.find(n => n.id === notificationId);
  if (entry) entry.delivered = true;
}
function getSchedulerStatus() {
  return {
    running: _schedulerRunning,
    pendingNotifications: _notificationLog.filter(n => !n.delivered).length,
    totalNotifications: _notificationLog.length,
    lastCheck: new Date().toISOString(),
  };
}

module.exports = { startScheduler, stopScheduler, getRecentNotifications, markDelivered, getSchedulerStatus, checkAndNotify };
