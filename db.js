// 数据库初始化 — v2.0 双引擎
//   DATABASE_URL 存在 → PostgreSQL (Knex)  [生产推荐]
//   DATABASE_URL 不存在 → SQLite (sql.js) [本地开发兜底]
require('dotenv').config();

const USE_PG = !!process.env.DATABASE_URL;

// ===== PostgreSQL 模式 =====
let knex = null;

async function initPg() {
  if (knex) return knex;
  const Knex = require('knex');
  const config = require('./knexfile');
  const env = process.env.NODE_ENV === 'production' ? 'production' : 'development';

  knex = Knex(config[env]);

  // 验证连接
  await knex.raw('SELECT 1');
  console.log(`[DB] PostgreSQL 已连接 (${env})`);

  return knex;
}

// ===== SQLite 模式 =====
let sqliteDb = null;
let sqliteReady = null;

async function initSqlite() {
  if (sqliteDb) return sqliteDb;
  if (sqliteReady) return sqliteReady;

  const initSqlJs = require('sql.js');
  const fs = require('fs');
  const path = require('path');
  const DB_PATH = path.join(__dirname, 'worldcup.db');

  sqliteReady = (async () => {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      sqliteDb = new SQL.Database(buffer);
      console.log('[DB] SQLite 从文件加载');
    } else {
      sqliteDb = new SQL.Database();
      console.log('[DB] SQLite 创建新库');
      createSqliteTables();
      seedSqliteData();
      saveSqlite();
    }
    return sqliteDb;
  })();

  return sqliteReady;
}

function saveSqlite() {
  if (!sqliteDb) return;
  const fs = require('fs');
  const path = require('path');
  const DB_PATH = path.join(__dirname, 'worldcup.db');
  fs.writeFileSync(DB_PATH, Buffer.from(sqliteDb.export()));
}

function createSqliteTables() {
  sqliteDb.run(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY, name TEXT, en TEXT, flag TEXT,
      grp TEXT, rank INTEGER DEFAULT 999, color TEXT DEFAULT '#1a1a2e'
    );
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT, team_id TEXT,
      name TEXT, en TEXT, pos TEXT, age INTEGER, number INTEGER,
      club TEXT, goals INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY, home_id TEXT, away_id TEXT,
      home_name TEXT, away_name TEXT, home_flag TEXT, away_flag TEXT,
      stage TEXT, date TEXT, stadium TEXT,
      home_score INTEGER, away_score INTEGER,
      status TEXT DEFAULT 'upcoming', minute INTEGER,
      bracket_position TEXT DEFAULT NULL
    );
    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_openid TEXT,
      match_id TEXT, winner TEXT, home_score INTEGER, away_score INTEGER,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS users (
      openid TEXT PRIMARY KEY, nickname TEXT DEFAULT '球迷',
      avatar TEXT DEFAULT '', favorites TEXT DEFAULT '[]',
      points INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );
  `);
}

function seedSqliteData() {
  const count = sqliteDb.exec('SELECT COUNT(*) as c FROM teams');
  if (count.length > 0 && count[0].values[0][0] > 0) {
    console.log('[DB] SQLite 已有数据，跳过 seed');
    return;
  }

  const { TEAMS, PLAYERS, SCHEDULE } = require('./seed-data');
  sqliteDb.run('BEGIN');

  for (const t of TEAMS) {
    sqliteDb.run('INSERT OR IGNORE INTO teams VALUES (?,?,?,?,?,?,?)',
      [t.id, t.name, t.en, t.flag, t.group, t.rank, t.color]);
  }
  for (const [teamId, players] of Object.entries(PLAYERS)) {
    for (const p of players) {
      sqliteDb.run('INSERT OR IGNORE INTO players (team_id,name,en,pos,age,number,club,goals) VALUES (?,?,?,?,?,?,?,?)',
        [teamId, p.name, p.en, p.pos, p.age, p.number, p.club, p.goals]);
    }
  }
  for (const m of SCHEDULE) {
    sqliteDb.run('INSERT OR IGNORE INTO matches VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [m.id, m.homeId, m.awayId, m.homeName, m.awayName, m.homeFlag, m.awayFlag,
       m.stage, m.date, m.stadium, m.homeScore, m.awayScore, m.status, m.minute,
       m.bracketPosition || null]);
  }
  sqliteDb.run('COMMIT');
  saveSqlite();
  console.log(`[DB] SQLite seed 完成: ${TEAMS.length}队, ${SCHEDULE.length}场`);
}

// ===== 统一查询接口 (兼容旧 API) =====

/**
 * 查询多条记录
 * PG: 使用 knex.raw 执行原始 SQL + 参数绑定
 * SQLite: 使用 sql.js prepare/bind/step
 */
async function queryAll(sql, params = []) {
  if (USE_PG) {
    const k = await initPg();
    try {
      // 将 ? 占位符转换为 $1, $2, ...
      let idx = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++idx}`);
      const result = await k.raw(pgSql, params);
      return result.rows;
    } catch (e) {
      console.error('[DB-PG] queryAll error:', e.message);
      return [];
    }
  }

  // SQLite 模式
  const db = await initSqlite();
  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    const results = [];
    while (stmt.step()) results.push(stmt.getAsObject());
    stmt.free();
    return results;
  } catch (e) {
    console.error('[DB-SQLite] queryAll error:', e.message);
    return [];
  }
}

/**
 * 查询单条记录
 */
async function queryOne(sql, params = []) {
  const results = await queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * 执行写操作 (INSERT/UPDATE/DELETE)
 * PG: 使用 knex.raw
 * SQLite: 使用 sql.js run + save
 */
async function run(sql, params = []) {
  if (USE_PG) {
    const k = await initPg();
    try {
      let idx = 0;
      const pgSql = sql.replace(/\?/g, () => `$${++idx}`);
      const result = await k.raw(pgSql, params);
      return { changes: result.rowCount || 0 };
    } catch (e) {
      console.error('[DB-PG] run error:', e.message);
      return { changes: 0 };
    }
  }

  // SQLite 模式
  const db = await initSqlite();
  try {
    db.run(sql, params);
    saveSqlite();
    return { changes: db.getRowsModified() };
  } catch (e) {
    console.error('[DB-SQLite] run error:', e.message);
    return { changes: 0 };
  }
}

// ===== 初始化入口 =====
async function getDb() {
  if (USE_PG) return initPg();
  return initSqlite();
}

// ===== 导出 Knex 实例 (供高级查询使用) =====
async function getKnex() {
  if (!USE_PG) throw new Error('Knex 仅在 PostgreSQL 模式下可用');
  return initPg();
}

// 关闭连接
async function close() {
  if (knex) {
    await knex.destroy();
    knex = null;
    console.log('[DB] PostgreSQL 连接已关闭');
  }
}

module.exports = {
  getDb,
  queryAll,
  queryOne,
  run,
  getKnex,
  close,
  isPostgres: USE_PG,
  // 向后兼容
  saveDb: () => { if (!USE_PG && sqliteDb) saveSqlite(); },
};
