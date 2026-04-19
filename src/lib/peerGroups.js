/**
 * peerGroups.js — SIMD-based peer group definitions for the league table.
 *
 * Councils are grouped by the percentage of their population living in the most
 * deprived 20% of Scotland nationally, using Scottish Index of Multiple Deprivation
 * (SIMD) 2020 data published by the Scottish Government.
 *
 * Source: https://www.gov.scot/publications/scottish-index-multiple-deprivation-2020/
 *
 * This is the same methodology used by NHS Scotland for benchmarking health outcomes
 * across health boards — comparing like with like rather than ranking all organisations
 * together regardless of the structural conditions they face.
 *
 * Group boundaries:
 *   A  >20%  of population in most deprived national quintile
 *   B  12–20%
 *   C  5–12%
 *   D  <5%
 */

export const PEER_GROUPS = [
  {
    id: 'group-a',
    label: 'Group A',
    deprivationRange: '>20% in most deprived quintile',
    description:
      'High-deprivation councils where more than one in five residents lives in the most ' +
      'deprived fifth of Scotland. These areas carry the legacy of concentrated industrial ' +
      'decline, unemployment, and poor housing from the 1980s. Any comparison with lower-deprivation ' +
      'councils would be unfair without this context.',
    slugs: [
      'glasgow-city',
      'inverclyde',
      'west-dunbartonshire',
      'north-ayrshire',
      'dundee-city',
      'north-lanarkshire',
      'east-ayrshire',
    ],
  },
  {
    id: 'group-b',
    label: 'Group B',
    deprivationRange: '12–20% in most deprived quintile',
    description:
      'Medium-high-deprivation councils with significant pockets of poverty, often a mix of ' +
      'deprived post-industrial towns and more affluent commuter areas within the same boundary.',
    slugs: [
      'clackmannanshire',
      'south-lanarkshire',
      'falkirk',
      'renfrewshire',
      'west-lothian',
      'south-ayrshire',
      'fife',
    ],
  },
  {
    id: 'group-c',
    label: 'Group C',
    deprivationRange: '5–12% in most deprived quintile',
    description:
      'Medium-low-deprivation councils covering much of rural and semi-urban Scotland, ' +
      'plus Edinburgh. Lower aggregate deprivation scores but often with pockets of rural ' +
      'poverty and geographic access challenges not captured by urban-calibrated measures.',
    slugs: [
      'highland',
      'angus',
      'perth-and-kinross',
      'scottish-borders',
      'dumfries-and-galloway',
      'midlothian',
      'city-of-edinburgh',
      'stirling',
      'east-lothian',
      'aberdeen-city',
      'moray',
      'argyll-and-bute',
      'na-h-eileanan-siar',
    ],
  },
  {
    id: 'group-d',
    label: 'Group D',
    deprivationRange: '<5% in most deprived quintile',
    description:
      'Low-deprivation councils, largely affluent suburban areas and remote island communities. ' +
      'The island councils (Orkney, Shetland) face distinct challenges around geographic access ' +
      'and service delivery costs not reflected in deprivation scores.',
    slugs: [
      'aberdeenshire',
      'east-dunbartonshire',
      'east-renfrewshire',
      'orkney-islands',
      'shetland-islands',
    ],
  },
]

/**
 * Return the peer group for a given council slug.
 * @param {string} slug
 * @returns {Object|undefined}
 */
export function getPeerGroup(slug) {
  return PEER_GROUPS.find((g) => g.slugs.includes(slug))
}
