// 迁移: 创建世界杯小程序全部表结构 (PostgreSQL)
exports.up = async function (knex) {
  // 球队表
  await knex.schema.createTable('teams', (t) => {
    t.string('id', 32).primary();
    t.string('name', 64).notNullable();
    t.string('en', 64);
    t.string('flag', 8);
    t.string('grp', 1).notNullable();          // 小组 A-L
    t.integer('rank').defaultTo(999);
    t.string('color', 7).defaultTo('#1a1a2e');
  });
  await knex.raw('CREATE INDEX idx_teams_grp ON teams(grp)');

  // 球员表
  await knex.schema.createTable('players', (t) => {
    t.increments('id').primary();
    t.string('team_id', 32).notNullable().references('id').inTable('teams');
    t.string('name', 64).notNullable();
    t.string('en', 64);
    t.string('pos', 4);
    t.integer('age');
    t.integer('number');
    t.string('club', 128);
    t.integer('goals').defaultTo(0);
  });
  await knex.raw('CREATE INDEX idx_players_team ON players(team_id)');

  // 比赛表
  await knex.schema.createTable('matches', (t) => {
    t.string('id', 16).primary();
    t.string('home_id', 32);
    t.string('away_id', 32);
    t.string('home_name', 64);
    t.string('away_name', 64);
    t.string('home_flag', 8);
    t.string('away_flag', 8);
    t.string('stage', 32);
    t.timestamp('date', { useTz: true });
    t.string('stadium', 128);
    t.integer('home_score');
    t.integer('away_score');
    t.string('status', 16).defaultTo('upcoming');
    t.integer('minute');
    t.string('bracket_position', 16);           // Phase 1 新增
  });
  await knex.raw(`
    CREATE INDEX idx_matches_date ON matches(date);
    CREATE INDEX idx_matches_status ON matches(status) WHERE status IN ('live','upcoming');
  `);

  // 用户表
  await knex.schema.createTable('users', (t) => {
    t.string('openid', 64).primary();
    t.string('nickname', 64).defaultTo('球迷');
    t.string('avatar', 512).defaultTo('');
    t.string('favorites', 1024).defaultTo('[]'); // Phase 1 新增
    t.integer('points').defaultTo(0);
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });
  await knex.raw('CREATE INDEX idx_users_points ON users(points DESC) WHERE points > 0');

  // 预测表
  await knex.schema.createTable('predictions', (t) => {
    t.increments('id').primary();
    t.string('user_openid', 64).notNullable();
    t.string('match_id', 16).notNullable();
    t.string('winner', 32);
    t.integer('home_score');
    t.integer('away_score');
    t.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  });
  await knex.raw(`
    CREATE INDEX idx_predictions_user ON predictions(user_openid);
    CREATE INDEX idx_predictions_match ON predictions(match_id);
    CREATE UNIQUE INDEX idx_predictions_unique ON predictions(user_openid, match_id);
  `);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('predictions');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('matches');
  await knex.schema.dropTableIfExists('players');
  await knex.schema.dropTableIfExists('teams');
};
