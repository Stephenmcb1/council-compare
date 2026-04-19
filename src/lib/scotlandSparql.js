// Scotland-level SPARQL queries against statistics.gov.scot
// Geography: S92000003 = Scotland (country level)
// Same endpoint and query patterns as the council-level metrics — just a different refArea.

import { querySparql, flattenBindings } from './sparql.js'

const SCOTLAND_URI = 'http://statistics.gov.scot/id/statistical-geography/S92000003'
export const SPARQL_ENDPOINT_URL = 'https://statistics.gov.scot/sparql'
export const SPARQL_SITE_URL = 'https://statistics.gov.scot'

const SCOTLAND_METRICS = [
  {
    id: 'healthy-life-expectancy',
    label: 'Healthy life expectancy',
    unit: 'years',
    description: 'Average years a woman born in Scotland can expect to live in good health (3-year rolling average, all SIMD quintiles).',
    datasetSlug: 'healthy-life-expectancy',
    query: `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>
PREFIX dim: <http://statistics.gov.scot/def/dimension/>

SELECT ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/healthy-life-expectancy> ;
       sdmx:refArea <${SCOTLAND_URI}> ;
       sdmx:refPeriod ?period ;
       dim:sex <http://statistics.gov.scot/def/concept/sex/female> ;
       dim:age <http://statistics.gov.scot/def/concept/age/0-years> ;
       dim:simdQuintiles <http://statistics.gov.scot/def/concept/simd-quintiles/all> ;
       dim:urbanRuralClassification <http://statistics.gov.scot/def/concept/urban-rural-classification/all> ;
       mp:count ?value .
}
ORDER BY DESC(?period)
LIMIT 1`.trim(),
  },
  {
    id: 'unemployment',
    label: 'Unemployment rate',
    unit: '%',
    description: 'Modelled unemployment rate (% of population aged 16+), Scotland.',
    datasetSlug: 'unemployment-model-based-estimates',
    query: `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>

SELECT ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/unemployment-model-based-estimates> ;
       sdmx:refArea <${SCOTLAND_URI}> ;
       sdmx:refPeriod ?period ;
       mp:ratio ?value .
}
ORDER BY DESC(?period)
LIMIT 1`.trim(),
  },
  {
    id: 'fuel-poverty',
    label: 'Fuel poverty',
    unit: '%',
    description: 'Percentage of Scottish households spending more than 10% of income on fuel (3-year rolling average, Scottish House Condition Survey).',
    datasetSlug: 'fuel-poverty-shcs',
    query: `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>
PREFIX dim: <http://statistics.gov.scot/def/dimension/>

SELECT ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/fuel-poverty-shcs> ;
       sdmx:refArea <${SCOTLAND_URI}> ;
       sdmx:refPeriod ?period ;
       dim:fuelPoverty <http://statistics.gov.scot/def/concept/fuel-poverty/fuel-poor> ;
       dim:typeOfDwelling <http://statistics.gov.scot/def/concept/type-of-dwelling/all> ;
       dim:ageOfDwelling <http://statistics.gov.scot/def/concept/age-of-dwelling/all> ;
       dim:numberOfBedrooms <http://statistics.gov.scot/def/concept/number-of-bedrooms/all> ;
       dim:typeOfTenure <http://statistics.gov.scot/def/concept/type-of-tenure/all> ;
       dim:householdType <http://statistics.gov.scot/def/concept/household-type/all> ;
       mp:percent ?value .
}
ORDER BY DESC(?period)
LIMIT 1`.trim(),
  },
]

export async function fetchScotlandStats() {
  const results = await Promise.all(
    SCOTLAND_METRICS.map(async metric => {
      try {
        const json = await querySparql(metric.query)
        const rows = flattenBindings(json)
        const row = rows[0]
        return {
          ...metric,
          value: row ? parseFloat(row.value) : null,
          period: row?.period ?? null,
          sourceUrl: `https://statistics.gov.scot/data/${metric.datasetSlug}`,
          queryUrl: `${SPARQL_ENDPOINT_URL}?query=${encodeURIComponent(metric.query)}`,
          ok: row != null,
        }
      } catch (err) {
        return { ...metric, value: null, period: null, ok: false, error: err.message }
      }
    })
  )
  return results
}
