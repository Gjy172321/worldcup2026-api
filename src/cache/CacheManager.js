// L1 内存缓存 — 基于 LRU，自动淘汰
const { LRUCache } = require('lru-cache');

const cache = new LRUCache({
  max: 500,                    // 最多 500 条
  ttl: 60_000,                // 默认 60 秒过期
  updateAgeOnGet: true,       // 读取时刷新 TTL
  allowStale: false,          // 不返回过期数据
});

// 统计
let hits = 0;
let misses = 0;

const cacheManager = {
  /**
   * 读取缓存
   */
  get(key) {
    const value = cache.get(key);
    if (value !== undefined) {
      hits++;
      return value;
    }
    misses++;
    return undefined;
  },

  /**
   * 写入缓存
   * @param {string} key
   * @param {*} value
   * @param {number} ttlMs - 过期时间(毫秒), 默认 60s
   */
  set(key, value, ttlMs = 60_000) {
    cache.set(key, value, { ttl: ttlMs });
  },

  /**
   * 读取或加载 (缓存穿透保护)
   * @param {string} key
   * @param {Function} loader - 数据加载函数
   * @param {number} ttlMs
   */
  async getOrSet(key, loader, ttlMs = 60_000) {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    const value = await loader();
    if (value !== null && value !== undefined) {
      this.set(key, value, ttlMs);
    }
    return value;
  },

  /**
   * 按模式删除缓存
   */
  delByPattern(pattern) {
    const regex = new RegExp(pattern.replace('*', '.*'));
    for (const key of cache.keys()) {
      if (regex.test(key)) cache.delete(key);
    }
  },

  /**
   * 删除单个
   */
  del(key) {
    cache.delete(key);
  },

  /**
   * 清空
   */
  clear() {
    cache.clear();
    hits = 0;
    misses = 0;
  },

  /**
   * 缓存统计
   */
  getStats() {
    const total = hits + misses;
    return {
      size: cache.size,
      hits,
      misses,
      hitRate: total > 0 ? (hits / total * 100).toFixed(1) + '%' : '0%',
      total,
    };
  },
};

module.exports = cacheManager;
