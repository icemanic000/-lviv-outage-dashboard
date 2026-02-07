export const OE_OUTAGE_BASE_RAW =
  'https://raw.githubusercontent.com/yaroslav2901/OE_OUTAGE_DATA/main/data'

export async function fetchRegionOutageJson(regionFile, { signal } = {}) {
  const url = `${OE_OUTAGE_BASE_RAW}/${encodeURIComponent(regionFile)}?t=${Date.now()}`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
    signal,
  })

  if (!res.ok) {
    throw new Error(`Failed to load outage data: ${res.status} ${res.statusText}`)
  }

  return await res.json()
}
