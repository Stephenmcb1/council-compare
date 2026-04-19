/**
 * metrics.js — Metric definitions for Phase 1
 *
 * Each metric object describes one data point we show in the comparison.
 * The SPARQL query for each metric is a function that accepts a council code
 * (e.g. 'S12000049') and returns a query string.
 *
 * Fields:
 *   id              — unique key, used as React key and chart label
 *   label           — human-readable name shown in the UI
 *   unit            — suffix for display (%, yrs, etc.)
 *   caveat          — mandatory context note shown alongside the metric
 *   higherIsBetter  — for chart normalisation (true/false/null)
 *   buildQuery(code) — returns a SPARQL SELECT query string
 *
 * ---
 * DATASET NOTES (verified against statistics.gov.scot SPARQL endpoint)
 *
 * The originally planned metrics (CfE literacy %, Band D council tax rate £,
 * social care spend per head, SIMD quintile %) are NOT available at council
 * level via SPARQL. The datasets that exist either use data-zone geography
 * (S01XXXXXX) or are not in the linked data endpoint at all. These four
 * metrics are the closest council-level equivalents that ARE queryable.
 *
 * Dimension URIs confirmed by exploratory querying:
 *   refArea   — http://purl.org/linked-data/sdmx/2009/dimension#refArea
 *   refPeriod — http://purl.org/linked-data/sdmx/2009/dimension#refPeriod
 *   measures  — http://statistics.gov.scot/def/measure-properties/<name>
 * ---
 */

import { councilUri } from './councils.js'

export const METRICS = [
  {
    id: 'school-attendance',
    label: 'School Attendance Rate',
    unit: '%',
    higherIsBetter: true,
    caveat:
      'Percentage of possible attendances made at primary schools. ' +
      'Attendance is lower in deprived areas due to health inequalities, ' +
      'housing instability, and caring responsibilities — not school quality. ' +
      'Holyrood sets attendance policy and statutory obligations; councils deliver it. ' +
      'Data: statistics.gov.scot / school-attendance-rate.',

    buildQuery(code) {
      const uri = councilUri(code)
      return `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>

SELECT ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/school-attendance-rate> ;
       sdmx:refArea <${uri}> ;
       sdmx:refPeriod ?period ;
       <http://statistics.gov.scot/def/dimension/schoolType>
         <http://statistics.gov.scot/def/concept/school-type/primary> ;
       mp:ratio ?value .
}
ORDER BY DESC(?period)
LIMIT 1
`.trim()
    },
  },

  {
    id: 'council-tax-collection',
    label: 'Council Tax Collection Rate',
    unit: '%',
    higherIsBetter: true,
    caveat:
      'Percentage of council tax billed that was actually collected in the year. ' +
      'A lower collection rate typically reflects higher levels of poverty and debt ' +
      'in the council area — it is a deprivation indicator as much as a performance one. ' +
      'Councils with high proportions of Band A properties (the lowest band, ' +
      'most common in deprived areas) have a narrower tax base to collect from. ' +
      'Data: statistics.gov.scot / council-tax-collection-rates.',

    buildQuery(code) {
      const uri = councilUri(code)
      return `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>

SELECT ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/council-tax-collection-rates> ;
       sdmx:refArea <${uri}> ;
       sdmx:refPeriod ?period ;
       <http://statistics.gov.scot/def/dimension/councilTaxCollection>
         <http://statistics.gov.scot/def/concept/council-tax-collection/collection-rate> ;
       mp:percent ?value .
}
ORDER BY DESC(?period)
LIMIT 1
`.trim()
    },
  },

  {
    id: 'looked-after-children',
    label: 'Looked After Children',
    unit: ' per 1,000',
    higherIsBetter: false,
    caveat:
      'Number of children looked after by the council per 1,000 children in the area. ' +
      'This is one of the strongest indicators of social deprivation — poverty, ' +
      'addiction, domestic abuse, and housing instability all drive looked-after rates. ' +
      'A high rate does not indicate council failure; it reflects the structural ' +
      'pressures the council is managing. Holyrood sets child protection policy; ' +
      'councils deliver it within that framework. ' +
      'Data: statistics.gov.scot / looked-after-children.',

    buildQuery(code) {
      const uri = councilUri(code)
      return `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>

SELECT ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/looked-after-children> ;
       sdmx:refArea <${uri}> ;
       sdmx:refPeriod ?period ;
       <http://statistics.gov.scot/def/dimension/residentialStatus>
         <http://statistics.gov.scot/def/concept/residential-status/all> ;
       mp:ratio ?value .
}
ORDER BY DESC(?period)
LIMIT 1
`.trim()
    },
  },

  {
    id: 'healthy-life-expectancy',
    label: 'Healthy Life Expectancy',
    unit: ' yrs',
    higherIsBetter: true,
    caveat:
      'Average number of years a woman born in this council area can expect to live in ' +
      'good health (3-year rolling average). ' +
      'This is the single strongest summary indicator of deprivation and inequality — ' +
      'poverty, poor housing, unemployment, and low income all shorten healthy life. ' +
      'It is not a measure of council performance: NHS Scotland, not councils, ' +
      'delivers healthcare. The gap between the wealthiest and most deprived councils ' +
      'in Scotland exceeds 10 years. ' +
      'Data: statistics.gov.scot / healthy-life-expectancy.',

    buildQuery(code) {
      const uri = councilUri(code)
      return `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>
PREFIX dim: <http://statistics.gov.scot/def/dimension/>

SELECT ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/healthy-life-expectancy> ;
       sdmx:refArea <${uri}> ;
       sdmx:refPeriod ?period ;
       dim:sex <http://statistics.gov.scot/def/concept/sex/female> ;
       dim:age <http://statistics.gov.scot/def/concept/age/0-years> ;
       dim:simdQuintiles <http://statistics.gov.scot/def/concept/simd-quintiles/all> ;
       dim:urbanRuralClassification <http://statistics.gov.scot/def/concept/urban-rural-classification/all> ;
       mp:count ?value .
}
ORDER BY DESC(?period)
LIMIT 1
`.trim()
    },
  },

  {
    id: 'earnings',
    label: 'Median Weekly Earnings',
    unit: '£',
    higherIsBetter: true,
    caveat:
      'Median gross weekly pay for full-time employees in the council area (all genders). ' +
      'Earnings reflect local labour market conditions — industry mix, urbanity, commuter patterns — ' +
      'not council decisions. Edinburgh and Aberdeen are elevated by financial and energy sectors; ' +
      'rural councils by public sector employment. Councils do not set wages. ' +
      'Data: statistics.gov.scot / earnings (Annual Survey of Hours and Earnings).',

    buildQuery(code) {
      const uri = councilUri(code)
      return `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>
PREFIX dim: <http://statistics.gov.scot/def/dimension/>

SELECT ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/earnings> ;
       sdmx:refArea <${uri}> ;
       sdmx:refPeriod ?period ;
       dim:gender <http://statistics.gov.scot/def/concept/gender/all> ;
       dim:workingPattern <http://statistics.gov.scot/def/concept/working-pattern/full-time> ;
       mp:median ?value .
}
ORDER BY DESC(?period)
LIMIT 1
`.trim()
    },
  },

  {
    id: 'fuel-poverty',
    label: 'Fuel Poverty',
    unit: '%',
    higherIsBetter: false,
    caveat:
      'Percentage of households spending more than 10% of their income on fuel to maintain ' +
      'an adequate temperature (3-year rolling average, Scottish House Condition Survey). ' +
      'Fuel poverty is driven by low incomes, poor housing insulation, and energy prices — ' +
      'structural factors largely outside council control. Westminster regulates energy markets; ' +
      'Holyrood funds energy efficiency programmes; councils deliver retrofit schemes locally. ' +
      'Data: statistics.gov.scot / fuel-poverty-shcs.',

    buildQuery(code) {
      const uri = councilUri(code)
      return `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>
PREFIX dim: <http://statistics.gov.scot/def/dimension/>

SELECT ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/fuel-poverty-shcs> ;
       sdmx:refArea <${uri}> ;
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
LIMIT 1
`.trim()
    },
  },

  {
    id: 'unemployment',
    label: 'Unemployment Rate',
    unit: '%',
    higherIsBetter: false,
    caveat:
      'Modelled unemployment rate (% of population aged 16+) — quarterly estimate. ' +
      'Unemployment is driven by national economic conditions, industry structure, ' +
      'and deindustrialisation history, not council decisions. ' +
      'Former coalfield and heavy-industry councils (Inverclyde, North Ayrshire) carry ' +
      'structural unemployment that predates devolution and is unaffected by local political control. ' +
      'Westminster controls macroeconomic policy; councils cannot set interest rates or corporation tax. ' +
      'Data: statistics.gov.scot / unemployment-model-based-estimates.',

    buildQuery(code) {
      const uri = councilUri(code)
      return `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>

SELECT ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/unemployment-model-based-estimates> ;
       sdmx:refArea <${uri}> ;
       sdmx:refPeriod ?period ;
       mp:ratio ?value .
}
ORDER BY DESC(?period)
LIMIT 1
`.trim()
    },
  },

  {
    id: 'recorded-crime',
    label: 'Recorded Crime (all)',
    unit: '',
    higherIsBetter: false,
    caveat:
      'Total number of crimes recorded by Police Scotland in the council area. ' +
      'This is an absolute count — larger councils will naturally record more crimes. ' +
      'Compare proportionally, not directly: Glasgow City (pop. ~640k) recording 52,000 ' +
      'crimes is very different from Clackmannanshire (pop. ~52k) recording 5,000. ' +
      'Policing in Scotland is delivered by Police Scotland (a national body, not council staff). ' +
      'Recording practices also vary. ' +
      'Data: statistics.gov.scot / recorded-crime.',

    buildQuery(code) {
      const uri = councilUri(code)
      return `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>

SELECT ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/recorded-crime> ;
       sdmx:refArea <${uri}> ;
       sdmx:refPeriod ?period ;
       <http://statistics.gov.scot/def/dimension/crimeOrOffence>
         <http://statistics.gov.scot/def/concept/crime-or-offence/all-crimes> ;
       mp:count ?value .
}
ORDER BY DESC(?period)
LIMIT 1
`.trim()
    },
  },

  {
    id: 'homelessness',
    label: 'Homelessness Applications',
    unit: '',
    higherIsBetter: false,
    caveat:
      'Total homelessness applications made to the council in the year. ' +
      'This is an absolute count — larger councils receive more applications. ' +
      'Homelessness is driven by housing affordability, welfare policy, and relationship breakdown — ' +
      'Westminster controls housing benefit; Holyrood controls planning and housing policy. ' +
      'Councils have a legal duty to assess and house homeless applicants. ' +
      'A high count also reflects a council area where people know their rights and apply — ' +
      'low counts are not always a sign of low need. ' +
      'Data: statistics.gov.scot / homelessness-applications.',

    buildQuery(code) {
      const uri = councilUri(code)
      return `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>

SELECT ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/homelessness-applications> ;
       sdmx:refArea <${uri}> ;
       sdmx:refPeriod ?period ;
       <http://statistics.gov.scot/def/dimension/applicationType>
         <http://statistics.gov.scot/def/concept/application-type/all-applications> ;
       mp:count ?value .
}
ORDER BY DESC(?period)
LIMIT 1
`.trim()
    },
  },

  {
    id: 'drug-discharge',
    label: 'Drug-Related Hospital Discharges',
    unit: '',
    higherIsBetter: false,
    caveat:
      'Number of hospital discharges with a drug-related diagnosis in the council area. ' +
      'This is an absolute count, so larger councils will have higher totals. ' +
      'The "Glasgow effect" — elevated drug mortality and morbidity in the West of Scotland — ' +
      'reflects decades of deindustrialisation, unemployment, and poverty concentrated in that area. ' +
      'Drug policy in Scotland is largely reserved to Westminster; NHS treatment ' +
      'is delivered by Health Boards (not councils). Councils fund some community services. ' +
      'Data: statistics.gov.scot / drug-related-discharge.',

    buildQuery(code) {
      const uri = councilUri(code)
      return `
PREFIX sdmx: <http://purl.org/linked-data/sdmx/2009/dimension#>
PREFIX mp: <http://statistics.gov.scot/def/measure-properties/>
PREFIX qb: <http://purl.org/linked-data/cube#>

SELECT ?value ?period WHERE {
  ?obs qb:dataSet <http://statistics.gov.scot/data/drug-related-discharge> ;
       sdmx:refArea <${uri}> ;
       sdmx:refPeriod ?period ;
       mp:count ?value .
}
ORDER BY DESC(?period)
LIMIT 1
`.trim()
    },
  },
]

/**
 * Look up a metric by its id.
 * @param {string} id
 * @returns {Object|undefined}
 */
export function getMetric(id) {
  return METRICS.find((m) => m.id === id)
}
