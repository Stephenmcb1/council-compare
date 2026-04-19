// World Bank Open Data API — country-level comparators
// CORS-enabled, no API key required.
// Format: /v2/country/{iso3;iso3}/indicator/{id}?format=json&mrv=5&per_page=100
// mrv = most recent values (last N years); returns [metadata, data[]]

const WB_BASE = 'https://api.worldbank.org/v2/country'
export const WB_SITE_URL = 'https://data.worldbank.org'

// UK + small-population comparators + major economies
const COUNTRIES = 'GBR;IRL;NOR;DNK;SWE;FIN;DEU;FRA;NLD;AUS;CAN;USA'

export const WB_INDICATORS = [
  {
    id: 'NY.GDP.PCAP.PP.CD',
    label: 'GDP per capita (PPP)',
    unit: 'current int. $',
    description: 'Gross domestic product per person, adjusted for purchasing power parity. UK used as proxy for Scotland.',
    format: v => `$${Math.round(v).toLocaleString()}`,
    higherIsBetter: true,
  },
  {
    id: 'SP.DYN.LE00.IN',
    label: 'Life expectancy at birth',
    unit: 'years',
    description: 'Average number of years a newborn would live if current mortality patterns held. UK used as proxy for Scotland.',
    format: v => `${v.toFixed(1)} yrs`,
    higherIsBetter: true,
  },
  {
    id: 'SH.XPD.CHEX.GD.ZS',
    label: 'Health expenditure',
    unit: '% of GDP',
    description: 'Current health expenditure as a share of GDP — covers public and private spending. Scotland has free prescriptions and NHS provision.',
    format: v => `${v.toFixed(1)}%`,
    higherIsBetter: null,
  },
  {
    id: 'SE.XPD.TOTL.GD.ZS',
    label: 'Education expenditure',
    unit: '% of GDP',
    description: 'Government expenditure on education as a share of GDP. Scotland has free university tuition.',
    format: v => `${v.toFixed(1)}%`,
    higherIsBetter: null,
  },
  {
    id: 'EG.ELC.RNEW.ZS',
    label: 'Renewable electricity',
    unit: '% of electricity output',
    description: 'Renewable electricity output as a percentage of total electricity output. Scotland\'s figure comes from the Scottish Government — the UK figure does not represent Scotland and is shown separately for transparency.',
    format: v => `${v.toFixed(1)}%`,
    higherIsBetter: true,
    // Scotland's own figure cannot be sourced from the World Bank (UK proxy badly misrepresents it).
    // Sourced from: Scottish Government Energy Statistics for Scotland, 2022 annual data.
    // Metric: renewable electricity generated as equivalent % of Scotland's gross electricity consumption.
    // URL: https://www.gov.scot/publications/energy-statistics-for-scotland-q4-2023/
    scotlandData: {
      value: 113.4,
      year: '2022',
      label: 'Scotland',
      note: 'Renewable electricity generated as % of gross electricity consumption. Exceeds 100% because Scotland exports surplus renewable electricity to England.',
      sourceUrl: 'https://www.gov.scot/publications/energy-statistics-for-scotland-q4-2023/',
      sourceLabel: 'Scottish Government Energy Statistics for Scotland, Q4 2023',
    },
  },
  {
    id: 'EN.ATM.CO2E.PC',
    label: 'CO₂ / GHG emissions per capita',
    unit: 'metric tons per person',
    description: 'CO₂ emissions per person (World Bank / IEA, territorial). Scotland\'s figure is total greenhouse gas (CO₂-equivalent, all gases) from the Scottish Government — a comparable but slightly broader measure. Scotland has a 2045 net-zero target, 5 years ahead of the UK.',
    format: v => `${v.toFixed(1)} t`,
    higherIsBetter: false,
    mrv: 10,
    scotlandData: {
      value: 6.8,
      year: '2022',
      label: 'Scotland',
      note: 'Net greenhouse gas emissions per capita (all gases, CO₂-equivalent). Scotland\'s own figure — the UK figure does not represent Scotland\'s performance, which is improving faster due to renewable electricity.',
      sourceUrl: 'https://www.gov.scot/publications/scotlands-greenhouse-gas-emissions-2022/',
      sourceLabel: 'Scottish Government, Scotland\'s Greenhouse Gas Emissions 2022',
    },
  },
]

async function fetchIndicator(indicator) {
  const mrv = indicator.mrv ?? 5
  const url = `${WB_BASE}/${COUNTRIES}/indicator/${indicator.id}?format=json&mrv=${mrv}&per_page=200`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`World Bank HTTP ${res.status}`)
  const json = await res.json()
  const data = json[1] ?? []

  // For each country pick the most recent non-null value
  const byCountry = {}
  for (const row of data) {
    if (row.value === null) continue
    const id = row.country.id
    if (!byCountry[id] || row.date > byCountry[id].year) {
      byCountry[id] = {
        countryCode: id,
        label: row.country.value,
        value: row.value,
        year: row.date,
      }
    }
  }

  const sorted = Object.values(byCountry).sort((a, b) =>
    indicator.higherIsBetter === false ? a.value - b.value : b.value - a.value
  )

  return {
    ...indicator,
    data: sorted,
    sourceUrl: `https://data.worldbank.org/indicator/${indicator.id}`,
    apiUrl: url,
  }
}

export async function fetchWorldBankData() {
  const settled = await Promise.allSettled(WB_INDICATORS.map(fetchIndicator))
  return settled.map((result, i) =>
    result.status === 'fulfilled'
      ? result.value
      : { ...WB_INDICATORS[i], data: [], error: result.reason?.message ?? 'Failed to load' }
  )
}
