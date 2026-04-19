/**
 * councils.js — The 32 Scottish unitary authorities
 *
 * All data in this app is structured around these 32 councils.
 * Each entry includes:
 *   - slug: a URL-safe identifier used in SPARQL queries
 *   - label: display name
 *   - sparqlUri: the URI that statistics.gov.scot uses to identify this council
 *     in linked data. These URIs are stable identifiers — not web pages.
 *
 * Note on SPARQL URIs: statistics.gov.scot identifies councils using the
 * pattern http://statistics.gov.scot/id/statistical-geography/S12XXXXXX
 * where S12XXXXXX is the official ONS geography code for that council area.
 */

export const COUNCILS = [
  {
    slug: 'aberdeen-city',
    label: 'Aberdeen City',
    code: 'S12000033',
  },
  {
    slug: 'aberdeenshire',
    label: 'Aberdeenshire',
    code: 'S12000034',
  },
  {
    slug: 'angus',
    label: 'Angus',
    code: 'S12000041',
  },
  {
    slug: 'argyll-and-bute',
    label: 'Argyll and Bute',
    code: 'S12000035',
  },
  {
    slug: 'city-of-edinburgh',
    label: 'City of Edinburgh',
    code: 'S12000036',
  },
  {
    slug: 'clackmannanshire',
    label: 'Clackmannanshire',
    code: 'S12000005',
  },
  {
    slug: 'dumfries-and-galloway',
    label: 'Dumfries and Galloway',
    code: 'S12000006',
  },
  {
    slug: 'dundee-city',
    label: 'Dundee City',
    code: 'S12000042',
  },
  {
    slug: 'east-ayrshire',
    label: 'East Ayrshire',
    code: 'S12000008',
  },
  {
    slug: 'east-dunbartonshire',
    label: 'East Dunbartonshire',
    code: 'S12000045',
  },
  {
    slug: 'east-lothian',
    label: 'East Lothian',
    code: 'S12000010',
  },
  {
    slug: 'east-renfrewshire',
    label: 'East Renfrewshire',
    code: 'S12000011',
  },
  {
    slug: 'falkirk',
    label: 'Falkirk',
    code: 'S12000014',
  },
  {
    slug: 'fife',
    label: 'Fife',
    code: 'S12000047',
  },
  {
    slug: 'glasgow-city',
    label: 'Glasgow City',
    code: 'S12000049',
  },
  {
    slug: 'highland',
    label: 'Highland',
    code: 'S12000017',
  },
  {
    slug: 'inverclyde',
    label: 'Inverclyde',
    code: 'S12000018',
  },
  {
    slug: 'midlothian',
    label: 'Midlothian',
    code: 'S12000019',
  },
  {
    slug: 'moray',
    label: 'Moray',
    code: 'S12000020',
  },
  {
    slug: 'na-h-eileanan-siar',
    label: 'Na h-Eileanan Siar',
    code: 'S12000013',
  },
  {
    slug: 'north-ayrshire',
    label: 'North Ayrshire',
    code: 'S12000021',
  },
  {
    slug: 'north-lanarkshire',
    label: 'North Lanarkshire',
    code: 'S12000050',
  },
  {
    slug: 'orkney-islands',
    label: 'Orkney Islands',
    code: 'S12000023',
  },
  {
    slug: 'perth-and-kinross',
    label: 'Perth and Kinross',
    code: 'S12000024',
  },
  {
    slug: 'renfrewshire',
    label: 'Renfrewshire',
    code: 'S12000038',
  },
  {
    slug: 'scottish-borders',
    label: 'Scottish Borders',
    code: 'S12000026',
  },
  {
    slug: 'shetland-islands',
    label: 'Shetland Islands',
    code: 'S12000027',
  },
  {
    slug: 'south-ayrshire',
    label: 'South Ayrshire',
    code: 'S12000028',
  },
  {
    slug: 'south-lanarkshire',
    label: 'South Lanarkshire',
    code: 'S12000029',
  },
  {
    slug: 'stirling',
    label: 'Stirling',
    code: 'S12000030',
  },
  {
    slug: 'west-dunbartonshire',
    label: 'West Dunbartonshire',
    code: 'S12000039',
  },
  {
    slug: 'west-lothian',
    label: 'West Lothian',
    code: 'S12000040',
  },
]

/**
 * Look up a council by its slug.
 * @param {string} slug
 * @returns {Object|undefined}
 */
export function getCouncil(slug) {
  return COUNCILS.find((c) => c.slug === slug)
}

/**
 * Build the full statistics.gov.scot geography URI for a council code.
 * These URIs are used as identifiers in SPARQL queries.
 * @param {string} code - e.g. 'S12000033'
 * @returns {string}
 */
export function councilUri(code) {
  return `http://statistics.gov.scot/id/statistical-geography/${code}`
}
