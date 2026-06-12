// Knex 配置文件 — 数据库迁移
require('dotenv').config();

const baseConfig = {
  client: 'pg',
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
  },
  pool: {
    min: 2,
    max: 10,
  },
  // snake_case 自动转换
  wrapIdentifier: (value, origImpl) => origImpl(value),
  postProcessResponse: (result) => result,
};

module.exports = {
  development: {
    ...baseConfig,
    connection: process.env.DATABASE_URL || 'postgresql://localhost:5432/worldcup2026',
  },

  production: {
    ...baseConfig,
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 20 },
  },
};
