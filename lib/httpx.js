// 对外请求统一管控：限流（随机抖动）、单飞去重、指数退避（含 Retry-After）、熔断。
// 目的：把对豆瓣 / Bangumi 等源站的访问频率压到最低且不规则，避免触发风控（含 PT 类源站）。
import { fault } from './model.js'

// 每个外部主机的最小间隔与抖动（毫秒）。抖动让访问间隔不规则，降低被识别为爬虫的概率。
const HOST_POLICY = {
  'movie.douban.com': { minInterval: 1600, jitter: 1400 },
  'api.bgm.tv':       { minInterval: 900,  jitter: 700 },
  // 浏览器渲染极重且最易触发风控，单独严格限速。
  '__render__':       { minInterval: 30000, jitter: 20000 },
}
// 每分钟滑动窗口请求数上限；超过即熔断，避免短时间高频被封。
const RATE_WINDOW_MS = 60 * 1000
const RATE_CAP = { 'movie.douban.com': 12, 'api.bgm.tv': 30, '__render__': 3 }
const BREAKER_FAILS = 3
const BREAKER_COOLDOWN_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 3

const lastAt = {}
const windowHits = {}
const breakers = {}
const inflight = {}

function policy(host) { return HOST_POLICY[host] || { minInterval: 1200, jitter: 1000 } }
function snooze(ms, ctx) { return ms > 0 ? (ctx.sleep ? ctx.sleep(ms) : new Promise(r => setTimeout(r, ms))) : Promise.resolve() }

async function govern(ctx, host) {
  const now = Date.now()
  const b = breakers[host]
  if (b && b.until > now) throw fault(`来源 ${host} 触发熔断，已暂停访问至 ${new Date(b.until).toLocaleTimeString()}（避免风控）`)
  const w = windowHits[host]
  if (!w || now - w.ts >= RATE_WINDOW_MS) windowHits[host] = { ts: now, n: 0 }
  if (windowHits[host].n >= (RATE_CAP[host] || 30)) throw fault(`来源 ${host} 每分钟请求数已达上限，已节流避免风控`)
  const p = policy(host)
  const wait = Math.max(0, (lastAt[host] || 0) + p.minInterval + Math.random() * p.jitter - now)
  if (wait) await snooze(wait, ctx)
  lastAt[host] = Date.now()
  windowHits[host].n++
}

function openBreaker(host) {
  const b = breakers[host] || { fails: 0, until: 0 }
  b.fails++
  if (b.fails >= BREAKER_FAILS) b.until = Date.now() + BREAKER_COOLDOWN_MS
  breakers[host] = b
}
function closeBreaker(host) { breakers[host] = { fails: 0, until: 0 } }

function retryAfterMs(r) {
  const h = r?.headers
  const v = h && (h['retry-after'] ?? h['Retry-After'])
  if (!v) return 0
  const n = Number(v)
  if (!Number.isNaN(n)) return n * 1000
  const t = Date.parse(v)
  return Number.isNaN(t) ? 0 : Math.max(0, t - Date.now())
}

// host：限流/熔断维度；key：单飞去重维度；fn：实际请求。
export async function controlled(ctx, host, key, fn) {
  if (inflight[key]) return inflight[key] // 同一请求并发只发一次
  const job = (async () => {
    let attempt = 0
    for (;;) {
      await govern(ctx, host)
      try {
        const r = await fn()
        const status = r?.status
        if (status === 429) {
          const back = retryAfterMs(r) || 2000 * Math.pow(2, attempt)
          openBreaker(host)
          if (attempt < MAX_ATTEMPTS) { await snooze(back + Math.random() * 500, ctx); attempt++; continue }
          throw fault(`来源 ${host} 返回 429，已退避仍失败，暂停访问避免风控`)
        }
        if (status && status >= 500) {
          if (attempt < MAX_ATTEMPTS) { await snooze(1000 * Math.pow(2, attempt) + Math.random() * 500, ctx); attempt++; continue }
          throw fault(`来源 ${host} 服务端错误 ${status}`)
        }
        closeBreaker(host)
        return r
      } catch (e) {
        if (/熔断|每分钟请求数|已节流|429/.test(e.message)) throw e
        if (attempt < MAX_ATTEMPTS) { await snooze(1000 * Math.pow(2, attempt) + Math.random() * 500, ctx); attempt++; continue }
        throw e
      }
    }
  })()
  inflight[key] = job
  try { return await job } finally { delete inflight[key] }
}

// 渲染器专项限速（极重、最易风控）。
export function renderKey(url) { return 'R:' + url }
