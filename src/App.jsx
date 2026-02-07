import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  ReferenceArea,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { fetchRegionOutageJson } from './services/outageService'
import {
  getStatusText,
  getTodayData,
  normalizeStatusKey,
} from './utils/outage'

const REGION_FILE = 'Lvivoblenerho.json'

const GROUPS = [
  { key: 'GPV1.1', name: 'Дім', color: '#38bdf8' },
  { key: 'GPV2.1', name: 'Медик', color: '#818cf8' },
  { key: 'GPV5.1', name: 'Резерв', color: '#34d399' },
]

function formatLocalKyiv(iso) {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('uk-UA', {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: 'Europe/Kyiv',
    }).format(new Date(iso))
  } catch {
    return String(iso)
  }
}

function pad2(v) {
  return String(v).padStart(2, '0')
}

function formatHalfHour(t) {
  const hour = Math.floor(t)
  const minutes = t % 1 === 0.5 ? 30 : 0
  return `${pad2(hour)}:${pad2(minutes)}`
}

function formatHalfRange(startT) {
  const endT = startT + 0.5
  return `${formatHalfHour(startT)}-${formatHalfHour(endT)}`
}

function expandHourToHalves(hourStatusKey) {
  const k = normalizeStatusKey(hourStatusKey)

  if (k === 'first') return ['no', 'yes']
  if (k === 'second') return ['yes', 'no']
  if (k === 'yes') return ['yes', 'yes']
  if (k === 'no') return ['no', 'no']
  if (k === 'maybe') return ['maybe', 'maybe']

  return ['maybe', 'maybe']
}

function isOutageKey(statusKey) {
  const k = normalizeStatusKey(statusKey)
  return k === 'no' || k === 'first' || k === 'second'
}

function statusToLevel(statusKey) {
  const k = normalizeStatusKey(statusKey)
  if (k === 'yes') return 2
  if (k === 'maybe') return 1
  if (k === 'no') return 0
  return 1
}

function isNoAtHour(statusKey) {
  const k = normalizeStatusKey(statusKey)
  return k === 'no'
}

function isMaybeKey(statusKey) {
  const k = normalizeStatusKey(statusKey)
  return k === 'maybe'
}

function getNoIntervalsFromRows(rows, pickKey) {
  if (!rows?.length) return []

  const intervals = []
  let startT = null
  for (const r of rows) {
    const key = pickKey(r)
    const isNo = isNoAtHour(key)
    if (isNo && startT == null) startT = r.t
    if (!isNo && startT != null) {
      intervals.push([startT, r.t])
      startT = null
    }
  }

  if (startT != null) {
    intervals.push([startT, 24])
  }

  return intervals
    .filter(([a, b]) => b > a)
    .map(([a, b]) => `${formatHalfHour(a)}-${formatHalfHour(b)}`)
}

function getBoolIntervalsFromRows(rows, pickBool) {
  if (!rows?.length) return []

  const intervals = []
  let startT = null
  for (const r of rows) {
    const on = Boolean(pickBool(r))
    if (on && startT == null) startT = r.t
    if (!on && startT != null) {
      intervals.push([startT, r.t])
      startT = null
    }
  }

  if (startT != null) intervals.push([startT, 24])

  return intervals
    .filter(([a, b]) => b > a)
    .map(([a, b]) => `${formatHalfHour(a)}-${formatHalfHour(b)}`)
}

function statusCellBg(statusKey, baseColor) {
  const k = normalizeStatusKey(statusKey)
  if (k === 'yes') return { background: `${baseColor}33` }
  if (k === 'no') return { background: 'rgba(244,63,94,0.20)' }
  if (k === 'maybe') return { background: 'rgba(251,191,36,0.18)' }
  return { background: 'rgba(148,163,184,0.12)' }
}

export default function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const controller = new AbortController()

    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const json = await fetchRegionOutageJson(REGION_FILE, { signal: controller.signal })
        setData(json)
      } catch (e) {
        if (e?.name !== 'AbortError') {
          setError(e?.message || 'Failed to load data')
        }
      } finally {
        setLoading(false)
      }
    })()

    const refreshId = setInterval(() => {
      fetchRegionOutageJson(REGION_FILE, { signal: controller.signal })
        .then(setData)
        .catch(() => {})
    }, 5 * 60 * 1000)

    return () => {
      clearInterval(refreshId)
      controller.abort()
    }
  }, [])

  const today = useMemo(() => getTodayData(data), [data])
  const hasToday = Boolean(today)

  const groupHasOutages = useMemo(() => {
    if (!today) {
      return {
        [GROUPS[0].key]: false,
        [GROUPS[1].key]: false,
        [GROUPS[2].key]: false,
      }
    }

    const res = {}
    for (const g of GROUPS) {
      const group = today[g.key]
      let has = false

      for (let hourIndex = 1; hourIndex <= 24; hourIndex += 1) {
        const [a, b] = expandHourToHalves(group?.[String(hourIndex)])
        if (isOutageKey(a) || isOutageKey(b)) {
          has = true
          break
        }
      }

      res[g.key] = has
    }
    return res
  }, [today])

  const chartData = useMemo(() => {
    if (!today) return []

    const home = today[GROUPS[0].key] ?? null
    const medic = today[GROUPS[1].key] ?? null
    const reserve = today[GROUPS[2].key] ?? null

    const rows = []
    for (let hourIndex = 1; hourIndex <= 24; hourIndex += 1) {
      const baseT = hourIndex - 1

      const [homeA, homeB] = expandHourToHalves(home?.[String(hourIndex)])
      const [medicA, medicB] = expandHourToHalves(medic?.[String(hourIndex)])
      const [reserveA, reserveB] = expandHourToHalves(reserve?.[String(hourIndex)])

      const t1 = baseT
      const t2 = baseT + 0.5

      const overlap1 = isNoAtHour(medicA) && isNoAtHour(reserveA)
      const overlap2 = isNoAtHour(medicB) && isNoAtHour(reserveB)

      rows.push({
        t: t1,
        rangeLabel: formatHalfRange(t1),
        homeKey: homeA,
        medicKey: medicA,
        reserveKey: reserveA,
        home: statusToLevel(homeA),
        medic: statusToLevel(medicA),
        reserve: statusToLevel(reserveA),
        overlapNo: overlap1,
      })

      rows.push({
        t: t2,
        rangeLabel: formatHalfRange(t2),
        homeKey: homeB,
        medicKey: medicB,
        reserveKey: reserveB,
        home: statusToLevel(homeB),
        medic: statusToLevel(medicB),
        reserve: statusToLevel(reserveB),
        overlapNo: overlap2,
      })
    }

    return rows
  }, [today, data])

  const outageLines = useMemo(() => {
    if (!chartData.length) {
      return {
        home: [],
        medic: [],
        reserve: [],
        overlap: [],
      }
    }

    return {
      home: getNoIntervalsFromRows(chartData, (r) => r.homeKey),
      medic: getNoIntervalsFromRows(chartData, (r) => r.medicKey),
      reserve: getNoIntervalsFromRows(chartData, (r) => r.reserveKey),
      overlap: getBoolIntervalsFromRows(chartData, (r) => r.overlapNo),
    }
  }, [chartData])

  const transitionTicks = useMemo(() => {
    if (!chartData.length) return [0, 24]

    const ticks = new Set([0, 24])

    for (let i = 2; i <= chartData.length; i += 1) {
      const prev = chartData[i - 2]
      const curr = chartData[i - 1]

      if (prev.medicKey !== curr.medicKey) ticks.add(curr.t)
      if (prev.reserveKey !== curr.reserveKey) ticks.add(curr.t)
      if (prev.overlapNo !== curr.overlapNo) ticks.add(curr.t)
    }

    return Array.from(ticks).sort((a, b) => a - b)
  }, [chartData])

  const renderChart = ({ layout }) => {
    const isVertical = layout === 'vertical'

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          layout={layout}
          margin={{ top: 10, right: 12, left: -18, bottom: 0 }}
        >
          <defs>
            <filter id="lineGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.10)" vertical={false} />

          {chartData
            .filter((r) => r.overlapNo)
            .map((r) => (
              <ReferenceArea
                key={r.t}
                x1={isVertical ? 0 : r.t}
                x2={isVertical ? 2 : r.t + 0.5}
                y1={isVertical ? r.t : undefined}
                y2={isVertical ? r.t + 0.5 : undefined}
                fill="rgba(244,63,94,0.22)"
                strokeOpacity={0}
              />
            ))}

          {isVertical ? (
            <>
              <XAxis
                type="number"
                domain={[0, 2]}
                ticks={[0, 1, 2]}
                tick={{ fill: 'rgba(226,232,240,0.75)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  if (v === 2) return 'Є'
                  if (v === 1) return 'Можл'
                  return 'Нема'
                }}
              />
              <YAxis
                dataKey="t"
                type="number"
                domain={[0, 24]}
                ticks={transitionTicks}
                tick={{ fill: 'rgba(226,232,240,0.55)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(t) => formatHalfHour(t)}
                width={56}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="t"
                type="number"
                domain={[0, 24]}
                ticks={transitionTicks}
                tick={{ fill: 'rgba(226,232,240,0.75)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(t) => formatHalfHour(t)}
              />
              <YAxis
                type="number"
                domain={[0, 2]}
                ticks={[0, 1, 2]}
                tick={{ fill: 'rgba(226,232,240,0.55)', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => {
                  if (v === 2) return 'Є'
                  if (v === 1) return 'Можл'
                  return 'Нема'
                }}
              />
            </>
          )}

          <Tooltip
            cursor={{ stroke: 'rgba(56,189,248,0.35)', strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0]?.payload

              return (
                <div className="glass rounded-xl px-3 py-2 text-xs text-slate-200">
                  <div className="font-semibold text-slate-50">{p.rangeLabel}</div>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-300">Дім</span>
                      <span className="font-medium text-slate-100">{getStatusText(data, p.homeKey)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-300">Медик</span>
                      <span className="font-medium text-slate-100">{getStatusText(data, p.medicKey)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-300">Резерв</span>
                      <span className="font-medium text-slate-100">{getStatusText(data, p.reserveKey)}</span>
                    </div>
                  </div>
                  {p.overlapNo && (
                    <div className="mt-2 rounded-lg bg-rose-500/20 px-2 py-1 text-rose-100 ring-1 ring-rose-400/30">
                      Перетин: Медик + Резерв без світла
                    </div>
                  )}
                </div>
              )
            }}
          />

          <Line
            type="stepAfter"
            dataKey="home"
            stroke="rgba(255,255,255,0.22)"
            strokeWidth={6}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="stepAfter"
            dataKey="home"
            stroke={GROUPS[0].color}
            strokeWidth={2.8}
            dot={false}
            name={GROUPS[0].name}
            strokeDasharray=""
            isAnimationActive={false}
            style={{ filter: 'url(#lineGlow)' }}
          />

          <Line
            type="stepAfter"
            dataKey="medic"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={6}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="stepAfter"
            dataKey="medic"
            stroke={GROUPS[1].color}
            strokeWidth={2.8}
            dot={false}
            name={GROUPS[1].name}
            strokeDasharray="7 4"
            isAnimationActive={false}
            style={{ filter: 'url(#lineGlow)' }}
          />

          <Line
            type="stepAfter"
            dataKey="reserve"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={6}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="stepAfter"
            dataKey="reserve"
            stroke={GROUPS[2].color}
            strokeWidth={2.8}
            dot={false}
            name={GROUPS[2].name}
            strokeDasharray="2 3"
            isAnimationActive={false}
            style={{ filter: 'url(#lineGlow)' }}
          />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="min-h-screen text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="glass-strong rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Львів • Графік на сьогодні
              </div>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-50 sm:text-2xl">
                Дім / Робота (Медик, Резерв)
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span>Останнє оновлення: {formatLocalKyiv(data?.lastUpdated)}</span>
                <span className="hidden sm:inline">•</span>
                <span>Графік: {data?.fact?.update || '—'}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {GROUPS.map((g) => (
                <div key={g.key} className="inline-flex items-center gap-2 rounded-full bg-slate-900/40 px-3 py-1 ring-1 ring-slate-700/40">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: g.color }} />
                  <span className="text-slate-200">
                    {g.name}
                    {groupHasOutages[g.key] === false ? ' (Без відключень)' : ''}
                  </span>
                  <span className="text-slate-400">({g.key})</span>
                </div>
              ))}
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/40 px-3 py-1 text-rose-200 ring-1 ring-rose-400/40">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                Перетин: робота без світла
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="glass hidden rounded-2xl p-3 md:block">
              <div className="grid grid-cols-1 gap-3">
                {GROUPS.map((g) => (
                  <div key={g.key} className="grid grid-cols-[110px_1fr] items-center gap-3">
                    <div className="text-xs font-medium text-slate-300">
                      {g.name}
                    </div>
                    <div className="flex h-3 overflow-hidden rounded-full ring-1 ring-slate-700/40">
                      {chartData.map((r) => (
                        <div
                          key={`${g.key}-${r.t}`}
                          className="h-full flex-1"
                          style={
                            g.key === GROUPS[0].key
                              ? statusCellBg(r.homeKey, g.color)
                              : g.key === GROUPS[1].key
                                ? statusCellBg(r.medicKey, g.color)
                                : statusCellBg(r.reserveKey, g.color)
                          }
                          title={`${r.rangeLabel} • ${g.name}: ${getStatusText(data, g.key === GROUPS[0].key ? r.homeKey : g.key === GROUPS[1].key ? r.medicKey : r.reserveKey)}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-[110px_1fr] items-center gap-3">
                  <div className="text-xs font-medium text-slate-300">Робота (перетин)</div>
                  <div className="flex h-3 overflow-hidden rounded-full ring-1 ring-slate-700/40">
                    {chartData.map((r) => (
                      <div
                        key={`overlap-${r.t}`}
                        className="h-full flex-1"
                        style={{
                          background: r.overlapNo ? 'rgba(244,63,94,0.70)' : 'rgba(148,163,184,0.10)',
                        }}
                        title={r.overlapNo ? `${r.rangeLabel} • Перетин: робота без світла` : r.rangeLabel}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-[110px_1fr] items-center gap-3">
                  <div className="text-[11px] font-medium text-slate-500">Час</div>
                  <div className="flex">
                    {Array.from({ length: 48 }, (_, i) => {
                      const isHour = i % 2 === 0
                      const hour = i / 2
                      return (
                        <div
                          key={`tick-${i}`}
                          className="flex-1 text-center text-[10px] leading-none text-slate-500"
                        >
                          {isHour ? pad2(hour) : ''}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] text-slate-500">
                Підказка: наведись на смугу, щоб побачити статус для конкретної півгодини.
              </div>
            </div>

            <div className="hidden h-[360px] md:block">{renderChart({ layout: 'horizontal' })}</div>
            <div className="h-[560px] md:hidden">{renderChart({ layout: 'vertical' })}</div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <div className="glass rounded-2xl p-3">
              <div className="text-xs font-medium text-slate-300">
                Дім — години відключень
              </div>
              <div className="mt-1 text-sm text-slate-100">
                {outageLines.home.length ? outageLines.home.join(', ') : 'Без відключень'}
              </div>
            </div>
            <div className="glass rounded-2xl p-3">
              <div className="text-xs font-medium text-slate-300">
                Медик — години відключень
              </div>
              <div className="mt-1 text-sm text-slate-100">
                {outageLines.medic.length ? outageLines.medic.join(', ') : 'Без відключень'}
              </div>
            </div>
            <div className="glass rounded-2xl p-3">
              <div className="text-xs font-medium text-slate-300">
                Резерв — години відключень
              </div>
              <div className="mt-1 text-sm text-slate-100">
                {outageLines.reserve.length ? outageLines.reserve.join(', ') : 'Без відключень'}
              </div>
            </div>
            <div className="glass rounded-2xl p-3">
              <div className="text-xs font-medium text-slate-300">
                Робота (перетин) — без світла
              </div>
              <div className="mt-1 text-sm text-slate-100">
                {outageLines.overlap.length ? outageLines.overlap.join(', ') : 'Без відключень'}
              </div>
            </div>
          </div>

          {loading && (
            <div className="mt-4 rounded-xl bg-slate-900/40 p-3 text-sm text-slate-300 ring-1 ring-slate-700/40">
              Завантаження…
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-xl bg-rose-500/10 p-3 text-sm text-rose-200 ring-1 ring-rose-400/20">
              {error}
            </div>
          )}
          {!loading && !error && !hasToday && (
            <div className="mt-4 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200 ring-1 ring-amber-400/20">
              Немає даних на сьогодні.
            </div>
          )}
        </div>

        <footer className="mt-6 flex justify-center">
          <a
            className="glass inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-slate-900/40"
            href="https://t.me/stinches"
            target="_blank"
            rel="noreferrer"
          >
            Telegram: @stinches
          </a>
        </footer>
      </div>
    </div>
  )
}
