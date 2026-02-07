const STATUS_ORDER = ['yes', 'maybe', 'no']

export function getGroupNumber(groupKey) {
  const m = /^GPV(\d+)/.exec(groupKey)
  return m ? Number(m[1]) : null
}

export function getTodayTimestamp(data) {
  return data?.fact?.today
}

export function getTodayData(data) {
  const ts = getTodayTimestamp(data)
  if (!ts) return null
  return data?.fact?.data?.[String(ts)] ?? null
}

export function getGroupKeysForToday(data) {
  const today = getTodayData(data)
  if (!today) return []
  return Object.keys(today).sort((a, b) => {
    const an = getGroupNumber(a) ?? 999
    const bn = getGroupNumber(b) ?? 999
    if (an !== bn) return an - bn
    return a.localeCompare(b)
  })
}

export function getHourLabel(data, hourIndex) {
  const tz = data?.preset?.time_zone?.[String(hourIndex)]
  if (!tz) return String(hourIndex).padStart(2, '0')
  const label = tz?.[0]
  return typeof label === 'string' ? label : String(hourIndex).padStart(2, '0')
}

export function getStatusText(data, statusKey) {
  return data?.preset?.time_type?.[statusKey] ?? statusKey
}

export function normalizeStatusKey(statusKey) {
  if (!statusKey) return 'maybe'
  if (STATUS_ORDER.includes(statusKey)) return statusKey
  if (statusKey === 'first' || statusKey === 'second') return statusKey
  return 'maybe'
}

export function getEffectiveStatus(statusKey, minutes) {
  const key = normalizeStatusKey(statusKey)
  if (key === 'first') {
    return minutes < 30 ? 'no' : 'yes'
  }
  if (key === 'second') {
    return minutes < 30 ? 'yes' : 'no'
  }
  return key
}

export function getNextChangeDate(now, statusKey) {
  const minutes = now.getMinutes()
  const key = normalizeStatusKey(statusKey)

  const next = new Date(now)

  if (key === 'first' || key === 'second') {
    if (minutes < 30) {
      next.setMinutes(30, 0, 0)
      return next
    }
  }

  next.setHours(now.getHours() + 1, 0, 0, 0)
  return next
}

export function formatDurationMs(ms) {
  const safe = Math.max(0, ms)
  const totalSeconds = Math.floor(safe / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60

  if (h > 0) return `${h}г ${String(m).padStart(2, '0')}хв`
  return `${m}хв ${String(s).padStart(2, '0')}с`
}

export function buildChartDataForGroup(data, groupKey) {
  const today = getTodayData(data)
  if (!today) return []

  const group = today[groupKey]
  if (!group) return []

  const res = []
  for (let i = 1; i <= 24; i += 1) {
    const statusKey = normalizeStatusKey(group[String(i)])
    res.push({
      hour: i,
      label: getHourLabel(data, i),
      statusKey,
    })
  }

  return res
}

export function getCurrentSlotStatusKey(data, groupKey, now = new Date()) {
  const today = getTodayData(data)
  if (!today) return null
  const group = today[groupKey]
  if (!group) return null

  const hour = now.getHours()
  const slot = Math.min(24, Math.max(1, hour + 1))
  return normalizeStatusKey(group[String(slot)])
}

export function getGroupSummaryForTable(data, groupKey) {
  const today = getTodayData(data)
  if (!today) return null
  const group = today[groupKey]
  if (!group) return null

  let noCount = 0
  let maybeCount = 0
  let yesCount = 0

  for (let i = 1; i <= 24; i += 1) {
    const key = normalizeStatusKey(group[String(i)])
    if (key === 'no') noCount += 1
    else if (key === 'maybe') maybeCount += 1
    else if (key === 'yes') yesCount += 1
    else if (key === 'first' || key === 'second') {
      noCount += 1
      yesCount += 1
    }
  }

  return {
    groupKey,
    groupNumber: getGroupNumber(groupKey),
    yesCount,
    maybeCount,
    noCount,
  }
}
