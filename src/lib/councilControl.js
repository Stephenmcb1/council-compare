/**
 * councilControl.js — Political administration data for the 32 Scottish councils
 *
 * Based on administrations formed after the May 2022 Scottish local elections.
 * Next scheduled elections: May 2027.
 *
 * Council control can shift mid-term through votes of no confidence, defections,
 * or coalition changes — this data reflects the position as of mid-2022 unless
 * otherwise noted. North Lanarkshire is the clearest example: SNP initially
 * formed the administration but Labour regained control in August 2022.
 *
 * Sources: Wikipedia individual council election pages; SPICe Spotlight post-election
 * analysis; individual council websites.
 */

/**
 * Party brand colours for badge display.
 * bg: background colour; text: accessible foreground colour on that background.
 */
export const PARTY_COLOURS = {
  SNP:                { bg: '#FFDD00', text: '#1a1a1a' },
  Labour:             { bg: '#E4003B', text: '#ffffff' },
  Conservative:       { bg: '#0087DC', text: '#ffffff' },
  'Liberal Democrats':{ bg: '#FAA61A', text: '#1a1a1a' },
  'Scottish Greens':  { bg: '#00B140', text: '#ffffff' },
  Independent:        { bg: '#6B7280', text: '#ffffff' },
}

/**
 * adminType values:
 *   'majority'  — single party holds > 50% of seats
 *   'minority'  — single party leads without majority; relies on case-by-case support
 *   'coalition' — formal agreement between two or more parties
 *
 * administration — parties in the ruling group (not external supporters)
 * support        — parties providing external/informal support but not in admin
 * largestParty   — party with most seats (may differ from who leads the admin)
 */
export const COUNCIL_CONTROL = [
  {
    slug: 'aberdeen-city',
    administration: ['SNP', 'Liberal Democrats'],
    adminType: 'coalition',
    largestParty: 'SNP',
    notes: 'SNP–Lib Dem coalition administration.',
  },
  {
    slug: 'aberdeenshire',
    administration: ['Conservative', 'Liberal Democrats', 'Independent'],
    adminType: 'coalition',
    largestParty: 'Conservative',
    notes: 'Conservative-led coalition with Lib Dems and Independents.',
  },
  {
    slug: 'angus',
    administration: ['SNP'],
    adminType: 'minority',
    largestParty: 'SNP',
    notes: 'SNP minority administration.',
  },
  {
    slug: 'argyll-and-bute',
    administration: ['Conservative', 'Independent', 'Liberal Democrats'],
    adminType: 'coalition',
    largestParty: 'SNP',
    notes: 'Con–Ind–Lib Dem coalition despite SNP being largest party.',
  },
  {
    slug: 'city-of-edinburgh',
    administration: ['Labour'],
    adminType: 'minority',
    support: ['Liberal Democrats', 'Conservative'],
    largestParty: 'SNP',
    notes: 'Labour minority administration with Lib Dem and Conservative support. SNP had most seats.',
  },
  {
    slug: 'clackmannanshire',
    administration: ['SNP'],
    adminType: 'minority',
    largestParty: 'SNP',
    notes: 'SNP minority administration in Scotland\'s smallest council.',
  },
  {
    slug: 'dumfries-and-galloway',
    administration: ['SNP'],
    adminType: 'minority',
    largestParty: 'Independent',
    notes: 'Complex council. Independents hold most seats; SNP leads minority administration. Administration composition has shifted through defections.',
  },
  {
    slug: 'dundee-city',
    administration: ['SNP'],
    adminType: 'majority',
    largestParty: 'SNP',
    notes: 'One of only two single-party majority councils in Scotland after 2022.',
  },
  {
    slug: 'east-ayrshire',
    administration: ['SNP'],
    adminType: 'minority',
    largestParty: 'SNP',
    notes: 'SNP minority administration.',
  },
  {
    slug: 'east-dunbartonshire',
    administration: ['SNP'],
    adminType: 'minority',
    largestParty: 'SNP',
    notes: 'SNP minority administration.',
  },
  {
    slug: 'east-lothian',
    administration: ['Labour'],
    adminType: 'minority',
    largestParty: 'Labour',
    notes: 'Labour minority administration.',
  },
  {
    slug: 'east-renfrewshire',
    administration: ['Labour'],
    adminType: 'minority',
    largestParty: 'SNP',
    notes: 'Labour minority administration despite SNP holding most seats. Fragile: initial Independent support withdrew July 2022.',
  },
  {
    slug: 'falkirk',
    administration: ['SNP'],
    adminType: 'minority',
    largestParty: 'SNP',
    notes: 'SNP minority administration.',
  },
  {
    slug: 'fife',
    administration: ['Labour'],
    adminType: 'minority',
    support: ['Liberal Democrats', 'Conservative'],
    largestParty: 'SNP',
    notes: 'Labour minority administration (20 seats) despite SNP winning 34 of 75 seats. Lib Dems (13) and Conservatives (8) voted to support Labour.',
  },
  {
    slug: 'glasgow-city',
    administration: ['SNP'],
    adminType: 'minority',
    support: ['Scottish Greens'],
    largestParty: 'SNP',
    notes: 'SNP minority (37 seats) with a formal Green working agreement — similar to the Holyrood co-operation arrangement. Greens (10) are not in the administration. Labour holds 36 seats.',
  },
  {
    slug: 'highland',
    administration: ['SNP', 'Independent'],
    adminType: 'coalition',
    largestParty: 'Independent',
    notes: 'SNP–Independent coalition. Independents are the largest group on Highland Council.',
  },
  {
    slug: 'inverclyde',
    administration: ['Labour'],
    adminType: 'minority',
    largestParty: 'Labour',
    notes: 'Labour minority administration.',
  },
  {
    slug: 'midlothian',
    administration: ['SNP'],
    adminType: 'minority',
    largestParty: 'SNP',
    notes: 'SNP minority administration.',
  },
  {
    slug: 'moray',
    administration: ['Conservative'],
    adminType: 'minority',
    largestParty: 'Conservative',
    notes: 'Conservative minority administration.',
  },
  {
    slug: 'na-h-eileanan-siar',
    administration: ['Independent'],
    adminType: 'majority',
    largestParty: 'Independent',
    notes: 'Overwhelmingly independent council — party politics plays little role in the Western Isles.',
  },
  {
    slug: 'north-ayrshire',
    administration: ['SNP'],
    adminType: 'minority',
    largestParty: 'SNP',
    notes: 'SNP minority administration.',
  },
  {
    slug: 'north-lanarkshire',
    administration: ['Labour'],
    adminType: 'minority',
    support: ['Conservative'],
    largestParty: 'SNP',
    notes: 'SNP initially formed administration after May 2022 (36 seats vs Labour 32). Labour regained control in August 2022 after an SNP defection. Conservative support (5 seats) enables the Labour minority.',
  },
  {
    slug: 'orkney-islands',
    administration: ['Independent'],
    adminType: 'majority',
    largestParty: 'Independent',
    notes: 'Dominated by independents. Party politics has minimal presence in Orkney.',
  },
  {
    slug: 'perth-and-kinross',
    administration: ['SNP'],
    adminType: 'minority',
    largestParty: 'SNP',
    notes: 'SNP minority administration.',
  },
  {
    slug: 'renfrewshire',
    administration: ['SNP'],
    adminType: 'minority',
    largestParty: 'SNP',
    notes: 'SNP minority administration.',
  },
  {
    slug: 'scottish-borders',
    administration: ['Conservative', 'Independent'],
    adminType: 'coalition',
    largestParty: 'Conservative',
    notes: 'Conservative–Independent coalition administration.',
  },
  {
    slug: 'shetland-islands',
    administration: ['Independent'],
    adminType: 'majority',
    largestParty: 'Independent',
    notes: 'Fully independent council. Party politics has no significant presence in Shetland.',
  },
  {
    slug: 'south-ayrshire',
    administration: ['Conservative'],
    adminType: 'minority',
    largestParty: 'Conservative',
    notes: 'Conservative minority administration.',
  },
  {
    slug: 'south-lanarkshire',
    administration: ['Labour', 'Liberal Democrats', 'Independent'],
    adminType: 'coalition',
    largestParty: 'SNP',
    notes: 'Labour-led coalition with Lib Dems and an Independent despite SNP holding most seats.',
  },
  {
    slug: 'stirling',
    administration: ['Labour'],
    adminType: 'minority',
    largestParty: 'SNP',
    notes: 'Labour minority administration despite SNP winning most seats — Conservatives voted to install Labour over the larger SNP group.',
  },
  {
    slug: 'west-dunbartonshire',
    administration: ['Labour'],
    adminType: 'majority',
    largestParty: 'Labour',
    notes: 'One of only two single-party majority councils in Scotland after 2022.',
  },
  {
    slug: 'west-lothian',
    administration: ['Labour'],
    adminType: 'minority',
    support: ['Conservative', 'Liberal Democrats', 'Independent'],
    largestParty: 'SNP',
    notes: 'Labour minority with loose support from Conservatives (4), Lib Dem (1), and one Independent.',
  },
]

/**
 * Look up political control data by council slug.
 * @param {string} slug
 * @returns {Object|undefined}
 */
export function getCouncilControl(slug) {
  return COUNCIL_CONTROL.find((c) => c.slug === slug)
}
