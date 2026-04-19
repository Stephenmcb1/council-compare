// NOMIS (ONS) APS employment rate fetcher — UK nations
// Dataset NM_17_5, variable=45 (employment rate 16–64), measures=20599
//
// Confirmed geography codes from API testing:
//   2092957697 = United Kingdom
//   2092957699 = England
//   2092957700 = Wales
//
// Scotland and Northern Ireland are not separately available in this NOMIS dataset.
// Static figures from national statistics bodies are used instead.

const NOMIS_BASE = 'https://www.nomisweb.co.uk/api/v01/dataset/NM_17_5.data.json'
const LIVE_CODES = '2092957697,2092957699,2092957700'

export const NOMIS_SITE_URL = 'https://www.nomisweb.co.uk'
export const NOMIS_DATASET_URL = 'https://www.nomisweb.co.uk/datasets/apsnew'

export const STATIC_NATIONS = [
  { label: 'Scotland',         value: 74.5, year: '2024', source: 'Scottish Government Labour Market Statistics' },
  { label: 'Northern Ireland', value: 69.8, year: '2024', source: 'NISRA Labour Force Survey' },
]

export async function fetchUKNationsEmployment() {
  const apiUrl = `${NOMIS_BASE}?geography=${LIVE_CODES}&variable=45&measures=20599&time=latest`
  const res = await fetch(apiUrl, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`NOMIS HTTP ${res.status}`)
  const json = await res.json()

  const obs = json?.obs ?? []
  const live = obs.map(o => ({
    label:  o.geography?.description ?? 'Unknown',
    value:  o.obs_value?.value ?? null,
    year:   o.time?.description ?? null,
    source: 'ONS Annual Population Survey (NOMIS)',
  }))

  return {
    nations: [...live, ...STATIC_NATIONS],
    apiUrl,
  }
}
